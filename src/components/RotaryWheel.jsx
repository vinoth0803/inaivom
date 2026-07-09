import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const RotaryWheel = ({ isVisible }) => {
  const wheelRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && wheelRef.current && containerRef.current) {
      // Entry animation
      gsap.fromTo(
        containerRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'power3.out' }
      );

      // Continuous rotation
      gsap.to(wheelRef.current, {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: 'none',
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity: 0, zIndex: 5 }}
    >
      <div
        ref={wheelRef}
        className="rotary-wheel"
        style={{
          transform: 'scale(1.5)',
        }}
      >
        {/* Gear teeth */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: '20px',
              height: '30px',
              background: 'linear-gradient(to bottom, #D4AF37, #8B7355)',
              top: '-15px',
              left: '50%',
              transform: `translateX(-50%) rotate(${i * 15}deg)`,
              transformOrigin: '50% 415px',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          />
        ))}

        {/* Inner decorative ring */}
        <div
          className="absolute rounded-full border-2 border-metallic-gold/30"
          style={{
            inset: '80px',
          }}
        >
          {/* Small decorative dots */}
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-metallic-gold rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 10}deg) translateX(140px) translateY(-50%)`,
              }}
            />
          ))}
        </div>

        {/* Center emblem area */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            inset: '140px',
            background: 'radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a)',
            border: '3px solid #D4AF37',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.3)',
          }}
        >
          {/* Rotary-style spokes */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-2 bg-gradient-to-b from-metallic-gold/20 via-transparent to-metallic-gold/20"
              style={{
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}

          {/* Center hub */}
          <div
            className="absolute w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #D4AF37, #8B7355)',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
            }}
          >
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Light rays behind wheel */}
      <div className="light-rays" />
    </div>
  );
};

export default RotaryWheel;
