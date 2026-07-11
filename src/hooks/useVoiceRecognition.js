import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceRecognition = (targetPhrase = 'inaivom ondraga') => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  // Live frequency data, shared by ref so the 60fps updates never trigger
  // React re-renders (doing so caused a setState feedback loop).
  const audioDataRef = useRef(null);

  // Refs so event handlers never read stale state.
  const shouldListenRef = useRef(false); // do we want recognition running?
  const activatedRef = useRef(false);    // has the phrase already matched?
  const langFallbackRef = useRef(false); // switched from Tamil to English yet?
  const heardFirstRef = useRef(false);   // heard the first word ("inaivom") yet?

  // --- Phrase matching -------------------------------------------------
  // "Inaivom Ondraga" is Tamil: இணைவோம் ஒன்றாக ("let's unite as one").
  // We detect each half of the phrase separately (Tamil script plus the
  // fragments Chrome tends to produce). The launch requires BOTH the first
  // word AND the second word, so it only fires once "ondraga" is spoken.
  const evaluatePhrase = useCallback((raw) => {
    const t = raw
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const collapsed = t.replace(/\s/g, '');

    // First word — "இணைவோம்" / "inaivom" / heard as "enable".
    const first =
      /இணை|இணைவ/.test(raw) ||
      /\b(inaivom|inaivo|inaiv|naivom|in a vom|in a bomb|i naiv|enable|enabled|enabl)\b/.test(t) ||
      collapsed.includes('inaivom');

    // Second word — "ஒன்றாக" / "ondraga" / heard as "mon…".
    const second =
      /ஒன்ற|ஒன்றா|ஒன்றாக/.test(raw) ||
      /\bmon\w*/.test(t) ||
      /\b(ondraga|ondra|on draga|on drago|on drug|androga|and draga)\b/.test(t) ||
      collapsed.includes('ondraga') ||
      collapsed.includes('ondraa');

    return { first, second };
  }, []);

  // --- Audio visualisation --------------------------------------------
  const startAudioAnalysis = useCallback((stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audioDataRef.current = dataArray;

      const analyze = () => {
        if (!analyserRef.current) return;
        // Write in place into the shared buffer — no new allocation, no
        // setState, so consumers read live values without re-rendering.
        analyserRef.current.getByteFrequencyData(dataArray);
        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.error('[voice] audio analysis error:', err);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (microphoneRef.current) {
      try { microphoneRef.current.disconnect(); } catch (e) { /* noop */ }
      microphoneRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) { /* noop */ }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    audioDataRef.current = null;
  }, []);

  // --- One-time recogniser setup --------------------------------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // The trigger phrase is Tamil, so listen in Tamil for an accurate
    // transcription. Falls back to English in onerror if unsupported.
    recognition.lang = 'ta-IN';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcript = transcript.trim();
      console.log('[voice] heard:', transcript);

      if (activatedRef.current) return;

      const { first, second } = evaluatePhrase(transcript);

      // Remember the first word once heard — it may arrive in an earlier
      // result than the second word.
      if (first) heardFirstRef.current = true;

      // Only launch once BOTH words have been heard (i.e. after "ondraga").
      if (heardFirstRef.current && second) {
        console.log('[voice] full phrase matched -> launching');
        activatedRef.current = true;
        shouldListenRef.current = false;
        setError(null);
        setHasPermission(true);
        try { recognition.stop(); } catch (e) { /* noop */ }
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are routine; don't surface them.
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      // If Tamil isn't available on this device, fall back to English once.
      if (event.error === 'language-not-supported' && !langFallbackRef.current) {
        console.warn('[voice] Tamil (ta-IN) unsupported — falling back to en-US');
        langFallbackRef.current = true;
        recognition.lang = 'en-US';
        return; // onend will restart it with the new language
      }

      console.error('[voice] recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied');
        shouldListenRef.current = false;
      } else if (event.error === 'network') {
        setError('Network required for voice. Check your connection.');
      } else {
        setError('Listening error. Please try again.');
      }
    };

    recognition.onend = () => {
      // Chrome ends recognition after silence even in continuous mode.
      // Restart it ourselves as long as we still want to listen.
      if (shouldListenRef.current && !activatedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Can throw "already started" if it recovered on its own — ignore.
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try { recognition.stop(); } catch (e) { /* noop */ }
      recognitionRef.current = null;
    };
  }, [evaluatePhrase]);

  // --- Public controls -------------------------------------------------
  const startListening = useCallback(async () => {
    setError(null);
    activatedRef.current = false;
    heardFirstRef.current = false;

    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    try {
      // The orb visualiser opens its own mic stream. On mobile that stream
      // holds the microphone exclusively, so SpeechRecognition can't hear you
      // (mic shows "on" but nothing is recognised). Skip the visualiser on
      // mobile and let recognition own the mic; keep it on desktop where the
      // mic can be shared.
      if (!isMobile) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          startAudioAnalysis(stream);
        } catch (micErr) {
          console.warn('[voice] visualiser mic unavailable:', micErr?.name || micErr);
        }
      }

      shouldListenRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        // "already started" — safe to ignore.
      }
      setIsListening(true);
    } catch (err) {
      console.error('[voice] failed to start listening:', err);
      setError('Microphone access required');
    }
  }, [startAudioAnalysis]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* noop */ }
    }
    stopAudioAnalysis();
    setIsListening(false);
  }, [stopAudioAnalysis]);

  const manualActivate = useCallback(() => {
    activatedRef.current = true;
    shouldListenRef.current = false;
    setHasPermission(true);
    stopListening();
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    audioDataRef,
    error,
    hasPermission,
    startListening,
    stopListening,
    manualActivate,
  };
};

export default useVoiceRecognition;
