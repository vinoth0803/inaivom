import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';

import ParticleBackground from './components/ParticleBackground';
import FogBackground from './components/FogBackground';
import VoiceOrb from './components/VoiceOrb';
import Countdown from './components/Countdown';
import PosterAssembly from './components/PosterAssembly';
import PosterReveal from './components/PosterReveal';

import useVoiceRecognition from './hooks/useVoiceRecognition';
import useAudioController from './hooks/useAudioController';

// Scene flow:
// opening -> listening -> countdown (5..1) -> assembly (4 pieces) ->
// reveal (full poster + blast) -> final
const SCENES = {
  OPENING: 'opening',
  LISTENING: 'listening',
  COUNTDOWN: 'countdown',
  ASSEMBLY: 'assembly',
  REVEAL: 'reveal',
  FINAL: 'final',
};

function App() {
  const [scene, setScene] = useState(SCENES.OPENING);
  const [isStarted, setIsStarted] = useState(false);

  const containerRef = useRef(null);

  const {
    isListening,
    isSupported,
    audioDataRef,
    error,
    hasPermission,
    startListening,
    manualActivate,
  } = useVoiceRecognition('inaivom ondraga');

  const { isMuted, loadAudio, toggleMute, startMusic, playImpact } = useAudioController();

  // Voice recognized -> impact + music + countdown
  const startCountdown = useCallback(() => {
    setScene(SCENES.COUNTDOWN);
    playImpact();
    startMusic();
  }, [playImpact, startMusic]);

  useEffect(() => {
    if (hasPermission && scene === SCENES.LISTENING) {
      startCountdown();
    }
  }, [hasPermission, scene, startCountdown]);

  // Countdown finished -> assemble the four poster pieces
  const handleCountdownComplete = useCallback(() => {
    setScene(SCENES.ASSEMBLY);
  }, []);

  // Drive assembly -> reveal -> final on timers.
  useEffect(() => {
    if (scene === SCENES.ASSEMBLY) {
      const t = setTimeout(() => setScene(SCENES.REVEAL), 2200);
      return () => clearTimeout(t);
    }
    if (scene === SCENES.REVEAL) {
      const t = setTimeout(() => setScene(SCENES.FINAL), 2600);
      return () => clearTimeout(t);
    }
  }, [scene]);

  // Start experience
  const handleStart = useCallback(async () => {
    setIsStarted(true);

    // Try fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen not supported');
    }

    // Prepare audio (nothing plays yet — mic stays clean while listening)
    await loadAudio();

    // Fade out opening, then start listening
    gsap.to('.opening-content', {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        setScene(SCENES.LISTENING);
        startListening();
      },
    });
  }, [loadAudio, startListening]);

  const handleManualActivate = useCallback(() => {
    manualActivate();
  }, [manualActivate]);

  const posterVisible =
    scene === SCENES.ASSEMBLY || scene === SCENES.REVEAL || scene === SCENES.FINAL;
  const revealVisible = scene === SCENES.REVEAL || scene === SCENES.FINAL;

  // Render opening scene
  const renderOpening = () => (
    <div className="opening-content absolute inset-0 flex flex-col items-center justify-center z-20">
      {/* Ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3), transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      {/* Title */}
      <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-bold metallic-text tracking-[0.15em] mb-12 text-center px-4">
        Let&apos;s unite
      </h1>

      {/* Tap prompt */}
      <button
        onClick={handleStart}
        className="group relative px-8 py-4 overflow-hidden"
      >
        <span className="relative z-10 text-warm-white/70 font-inter text-sm tracking-[0.4em] uppercase group-hover:text-metallic-gold transition-colors duration-500">
          Tap Anywhere to Begin
        </span>
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-metallic-gold to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        />
      </button>
    </div>
  );

  // Render listening scene
  const renderListening = () => (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <VoiceOrb
        audioDataRef={audioDataRef}
        isListening={isListening}
        error={error}
      />

      {/* Voice prompt + always-available manual launch */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center">
        <p className="text-warm-white/50 text-sm mb-4 tracking-wider">
          {!isSupported
            ? 'Voice recognition is unavailable on this browser.'
            : 'Say “Inaivom Ondraga” — or launch manually below.'}
        </p>
        <button
          onClick={handleManualActivate}
          className="cinematic-btn text-xs"
        >
          Launch Experience
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-matte-black"
    >
      <div className="absolute inset-0">
        {/* Background layers */}
        <FogBackground isActive={true} />
        <ParticleBackground
          intensity={scene === SCENES.LISTENING ? 'low' : 'high'}
          isActive={isStarted}
        />

        {/* Poster pieces assembling */}
        <PosterAssembly isVisible={posterVisible} />

        {/* Full poster reveal + popper blast */}
        <PosterReveal isVisible={revealVisible} />

        {/* Scene-specific content */}
        {scene === SCENES.OPENING && renderOpening()}
        {scene === SCENES.LISTENING && renderListening()}
        <Countdown
          isVisible={scene === SCENES.COUNTDOWN}
          from={5}
          onComplete={handleCountdownComplete}
        />

        {/* Vignette overlay */}
        <div className="cinematic-vignette" />

        {/* Film grain */}
        <div className="film-grain" />

        {/* Light rays */}
        {revealVisible && <div className="light-rays" />}
      </div>

      {/* Audio controls */}
      {isStarted && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-metallic-gold/30 text-metallic-gold/70 hover:text-metallic-gold hover:border-metallic-gold/60 transition-all duration-300"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>
  );
}

export default App;
