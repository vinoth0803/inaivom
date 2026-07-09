import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const VoiceOrb = ({ audioDataRef, isListening, error }) => {
  const orbRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Single animation loop: reads live audio data from the ref every frame and
  // drives both the waveform canvas and the orb pulse without any setState.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    const animate = () => {
      const audioData = audioDataRef && audioDataRef.current;
      ctx.clearRect(0, 0, width, height);

      if (isListening && audioData) {
        const barWidth = width / audioData.length;

        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
          const value = audioData[i];
          sum += value;
          const barHeight = (value / 255) * height * 0.5;
          const x = i * barWidth;

          // Create gradient
          const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
          gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
          gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.8)');
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
        }

        // Pulse the orb with the average volume — direct DOM write, no render.
        if (orbRef.current) {
          const avgVolume = sum / audioData.length;
          const scale = 1 + (avgVolume / 255) * 0.3;
          orbRef.current.style.transform = `scale(${scale})`;
        }
      } else {
        if (orbRef.current) {
          orbRef.current.style.transform = 'scale(1)';
        }

        // Idle animation
        const time = Date.now() * 0.002;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const y = centerY + Math.sin(x * 0.02 + time) * 10;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, audioDataRef]);

  // Error shake animation
  useEffect(() => {
    if (error && orbRef.current) {
      gsap.to(orbRef.current, {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [error]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Orb */}
      <div
        ref={orbRef}
        className="relative"
        style={{
          transform: 'scale(1)',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" 
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.5), transparent 70%)',
            animationDuration: '2s',
          }}
        />
        <div className="absolute -inset-8 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(128, 0, 128, 0.3), transparent 60%)',
          }}
        />

        {/* Main orb */}
        <div className="voice-orb" />

        {/* Inner core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(212, 175, 55, 0.6), transparent)',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Waveform display */}
      <div className="mt-12 w-64 h-16 relative">
        <canvas
          ref={canvasRef}
          width={256}
          height={64}
          className="w-full h-full"
        />
      </div>

      {/* Status text */}
      <div className="mt-8 text-center">
        <p className="text-metallic-gold/80 font-cinzel text-sm tracking-[0.3em] uppercase">
          {isListening ? 'Listening...' : 'Waiting...'}
        </p>
        {error && (
          <p className="mt-2 text-red-400/80 font-inter text-xs tracking-wider animate-pulse">
            {error}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center opacity-50">
        <p className="text-warm-white/60 font-inter text-xs tracking-wide">
          Say
        </p>
        <p className="text-metallic-gold font-cinzel text-lg tracking-wider mt-1">
          "Inaivom Ondraga"
        </p>
      </div>
    </div>
  );
};

export default VoiceOrb;
