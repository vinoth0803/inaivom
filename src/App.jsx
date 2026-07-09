import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';

import ParticleBackground from './components/ParticleBackground';
import FogBackground from './components/FogBackground';
import VoiceOrb from './components/VoiceOrb';
import RotaryWheel from './components/RotaryWheel';
import TitleReveal from './components/TitleReveal';
import PosterAssembly from './components/PosterAssembly';
import EventInfo from './components/EventInfo';

import useVoiceRecognition from './hooks/useVoiceRecognition';
import useAudioController from './hooks/useAudioController';

// Scene constants
const SCENES = {
  OPENING: 'opening',
  LISTENING: 'listening',
  ACTIVATION: 'activation',
  TITLE_REVEAL: 'title_reveal',
  POSTER_ASSEMBLY: 'poster_assembly',
  EVENT_INFO: 'event_info',
  FINAL: 'final',
};

function App() {
  const [scene, setScene] = useState(SCENES.OPENING);
  const [isStarted, setIsStarted] = useState(false);
  
  const containerRef = useRef(null);
  const shakeRef = useRef(null);
  
  const {
    isListening,
    isSupported,
    audioDataRef,
    error,
    hasPermission,
    startListening,
    manualActivate,
  } = useVoiceRecognition('inaivom ondraga');

  const {
    isMuted,
    isLoaded,
    loadAudio,
    toggleMute,
    transitionToScene,
    playBassImpact,
  } = useAudioController();

  // Handle voice activation
  useEffect(() => {
    if (hasPermission && scene === SCENES.LISTENING) {
      triggerActivation();
    }
  }, [hasPermission, scene]);

  // Screen shake effect
  const triggerShake = useCallback(() => {
    if (shakeRef.current) {
      gsap.to(shakeRef.current, {
        x: [-10, 10, -8, 8, -5, 5, 0],
        y: [-5, 5, -3, 3, 0],
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, []);

  // Activation sequence
  const triggerActivation = useCallback(() => {
    setScene(SCENES.ACTIVATION);
    
    // Stop all current audio
    transitionToScene('activation');
    
    // Screen shake
    triggerShake();
    
    // Sequence the next scenes
    const tl = gsap.timeline();
    
    // Brief pause
    tl.to({}, { duration: 0.5 });
    
    // Transition to title reveal
    tl.call(() => {
      setScene(SCENES.TITLE_REVEAL);
      transitionToScene('reveal');
    });
    
    // Title reveal duration
    tl.to({}, { duration: 3 });
    
    // Transition to poster assembly
    tl.call(() => {
      setScene(SCENES.POSTER_ASSEMBLY);
    });
    
    // Poster assembly duration
    tl.to({}, { duration: 2.5 });
    
    // Transition to event info
    tl.call(() => {
      setScene(SCENES.EVENT_INFO);
    });
    
    // Final state
    tl.to({}, { duration: 1 });
    tl.call(() => {
      setScene(SCENES.FINAL);
    });
  }, [triggerShake, transitionToScene]);

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
    
    // Load audio
    await loadAudio();
    
    // Fade out opening
    gsap.to('.opening-content', {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        setScene(SCENES.LISTENING);
        startListening();
        transitionToScene('listening');
      },
    });
  }, [loadAudio, startListening, transitionToScene]);

  // Manual fallback activation
  const handleManualActivate = useCallback(() => {
    manualActivate();
  }, [manualActivate]);

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
      <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-bold metallic-text tracking-[0.3em] mb-12">
        INAIVOM
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

  // Render activation scene
  const renderActivation = () => (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      {/* Particle explosion effect */}
      <div className="relative">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-metallic-gold rounded-full"
            style={{
              animation: `particle-burst 1s ease-out forwards`,
              animationDelay: `${i * 0.02}s`,
              transform: `rotate(${i * 18}deg) translateX(0)`,
              '--burst-distance': `${100 + Math.random() * 100}px`,
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes particle-burst {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateX(var(--burst-distance, 100px)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-matte-black"
    >
      {/* Screen shake container */}
      <div ref={shakeRef} className="absolute inset-0">
        {/* Background layers */}
        <FogBackground isActive={true} />
        <ParticleBackground 
          intensity={scene === SCENES.LISTENING ? 'low' : 'high'} 
          isActive={isStarted}
        />
        
        {/* Rotary wheel */}
        <RotaryWheel 
          isVisible={scene === SCENES.TITLE_REVEAL || 
                    scene === SCENES.POSTER_ASSEMBLY || 
                    scene === SCENES.EVENT_INFO || 
                    scene === SCENES.FINAL} 
        />
        
        {/* Title reveal */}
        <TitleReveal 
          isVisible={scene === SCENES.TITLE_REVEAL || 
                     scene === SCENES.POSTER_ASSEMBLY || 
                     scene === SCENES.EVENT_INFO || 
                     scene === SCENES.FINAL}
        />
        
        {/* Poster assembly */}
        <PosterAssembly 
          isVisible={scene === SCENES.POSTER_ASSEMBLY || 
                     scene === SCENES.EVENT_INFO || 
                     scene === SCENES.FINAL}
        />
        
        {/* Event info */}
        <EventInfo 
          isVisible={scene === SCENES.EVENT_INFO || scene === SCENES.FINAL}
        />
        
        {/* Scene-specific content */}
        {scene === SCENES.OPENING && renderOpening()}
        {scene === SCENES.LISTENING && renderListening()}
        {scene === SCENES.ACTIVATION && renderActivation()}
        
        {/* Vignette overlay */}
        <div className="cinematic-vignette" />
        
        {/* Film grain */}
        <div className="film-grain" />
        
        {/* Light rays */}
        {(scene === SCENES.TITLE_REVEAL || 
          scene === SCENES.POSTER_ASSEMBLY || 
          scene === SCENES.EVENT_INFO || 
          scene === SCENES.FINAL) && (
          <div className="light-rays" />
        )}
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
