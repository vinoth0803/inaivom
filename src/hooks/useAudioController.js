import { useState, useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';

/**
 * Two sounds only (drop them into public/music/):
 *
 *   music.mp3    Looping background music. Starts when the countdown begins
 *                (kept silent while the mic is listening so it doesn't
 *                interfere with speech recognition).
 *   impact.mp3   One-shot hit, played the instant the phrase is recognised.
 *
 * Any missing file just stays silent — the experience keeps working.
 */
const MUSIC_SRC = '/music/music.mp3';
const IMPACT_SRC = '/music/impact.mp3';

const useAudioController = () => {
  const [isMuted, setIsMuted] = useState(false);
  const musicRef = useRef(null);
  const impactRef = useRef(null);

  const loadAudio = useCallback(async () => {
    if (!musicRef.current) {
      musicRef.current = new Howl({
        src: [MUSIC_SRC],
        loop: true,
        volume: 0.6,
        html5: true, // stream longer music files
        onloaderror: () =>
          console.warn(`[audio] No file at ${MUSIC_SRC} — background music will be silent.`),
      });
    }
    if (!impactRef.current) {
      impactRef.current = new Howl({
        src: [IMPACT_SRC],
        loop: false,
        volume: 0.9,
        onloaderror: () =>
          console.warn(`[audio] No file at ${IMPACT_SRC} — impact will be silent.`),
      });
    }
    Howler.mute(isMuted);
  }, [isMuted]);

  const startMusic = useCallback(() => {
    if (musicRef.current && !musicRef.current.playing()) {
      musicRef.current.play();
    }
  }, []);

  const playImpact = useCallback(() => {
    if (impactRef.current) impactRef.current.play();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      Howler.mute(next);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (musicRef.current) musicRef.current.unload();
      if (impactRef.current) impactRef.current.unload();
    };
  }, []);

  return { isMuted, loadAudio, toggleMute, startMusic, playImpact };
};

export default useAudioController;
