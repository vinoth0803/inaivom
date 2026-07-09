import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PosterAssembly = ({ isVisible, onComplete }) => {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const tl = gsap.timeline({
        onComplete: () => onComplete && onComplete(),
      });

      // Initial positions for panels
      const positions = [
        { x: -200, y: -200, rotation: -15 }, // Top-left
        { x: 200, y: -200, rotation: 15 },   // Top-right
        { x: -200, y: 200, rotation: 15 },   // Bottom-left
        { x: 200, y: 200, rotation: -15 },   // Bottom-right
        { x: 0, y: -300, rotation: 0 },      // Top
        { x: 0, y: 300, rotation: 0 },       // Bottom
      ];

      // Set initial positions
      panelsRef.current.forEach((panel, i) => {
        if (panel) {
          gsap.set(panel, {
            x: positions[i]?.x || 0,
            y: positions[i]?.y || 0,
            rotation: positions[i]?.rotation || 0,
            opacity: 0,
            scale: 0.8,
          });
        }
      });

      // Animate panels assembling
      tl.to(panelsRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power3.out',
      });

      // Final lock-in effect
      tl.to(containerRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });

      // Subtle floating animation after assembly
      tl.to(containerRef.current, {
        y: '+=10',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center z-10"
    >
      {/* Poster container */}
      <div className="relative w-[320px] md:w-[400px] lg:w-[480px] aspect-[3/4]">
        {/* Panel 1 - Top left quadrant */}
        <div
          ref={(el) => (panelsRef.current[0] = el)}
          className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-royal-purple/20 to-transparent" />
        </div>

        {/* Panel 2 - Top right quadrant */}
        <div
          ref={(el) => (panelsRef.current[1] = el)}
          className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden"
          style={{
            background: 'linear-gradient(225deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-metallic-gold/10 to-transparent" />
        </div>

        {/* Panel 3 - Bottom left quadrant */}
        <div
          ref={(el) => (panelsRef.current[2] = el)}
          className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden"
          style={{
            background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-royal-purple/10 to-transparent" />
        </div>

        {/* Panel 4 - Bottom right quadrant */}
        <div
          ref={(el) => (panelsRef.current[3] = el)}
          className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden"
          style={{
            background: 'linear-gradient(315deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tl from-metallic-gold/10 to-transparent" />
        </div>

        {/* Central content panel */}
        <div
          ref={(el) => (panelsRef.current[4] = el)}
          className="absolute inset-8 flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(26, 26, 46, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            boxShadow: '0 0 60px rgba(212, 175, 55, 0.2), inset 0 0 60px rgba(128, 0, 128, 0.1)',
          }}
        >
          {/* Rotary emblem */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-6 relative"
            style={{
              background: 'conic-gradient(from 0deg, #D4AF37, #8B7355, #D4AF37, #8B7355, #D4AF37)',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)',
            }}
          >
            <div className="absolute inset-2 rounded-full bg-matte-black flex items-center justify-center">
              <span className="font-cinzel text-3xl md:text-4xl font-bold metallic-text">R</span>
            </div>
          </div>

          {/* Event title */}
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-metallic-gold tracking-wider mb-2">
            INAIVOM
          </h2>

          {/* Tagline */}
          <p className="text-warm-white/70 text-xs md:text-sm tracking-widest uppercase text-center px-4">
            United by Purpose
          </p>

          {/* Decorative elements */}
          <div className="mt-6 w-16 h-px bg-gradient-to-r from-transparent via-metallic-gold to-transparent" />
        </div>

        {/* Golden frame overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 40px rgba(212, 175, 55, 0.2)',
            border: '3px solid rgba(212, 175, 55, 0.4)',
          }}
        />

        {/* Corner decorations */}
        {[
          'top-0 left-0',
          'top-0 right-0 rotate-90',
          'bottom-0 right-0 rotate-180',
          'bottom-0 left-0 -rotate-90',
        ].map((position, i) => (
          <div
            key={i}
            className={`absolute w-8 h-8 ${position}`}
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(212, 175, 55, 0.5) 50%)',
            }}
          />
        ))}
      </div>

      {/* Lens flare effect */}
      <div 
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          top: '20%',
          right: '20%',
        }}
      />
    </div>
  );
};

export default PosterAssembly;
