import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const TitleReveal = ({ isVisible, onComplete }) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const charsRef = useRef([]);

  const title = 'INAIVOM';

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const tl = gsap.timeline({
        onComplete: () => onComplete && onComplete(),
      });

      // Initial state
      gsap.set(charsRef.current, {
        opacity: 0,
        y: 100,
        rotateX: -90,
      });

      gsap.set(taglineRef.current, {
        opacity: 0,
        y: 30,
      });

      // Character reveal animation
      tl.to(charsRef.current, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });

      // Light sweep effect across title
      tl.to(
        titleRef.current,
        {
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power2.inOut',
        },
        '-=0.5'
      );

      // Sparks effect (simulated with pseudo-elements via CSS)
      tl.add(() => {
        if (titleRef.current) {
          titleRef.current.classList.add('sparks-active');
        }
      }, '-=1.5');

      // Tagline reveal
      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
        },
        '-=1'
      );

      // Continuous subtle glow animation
      gsap.to(titleRef.current, {
        textShadow: '0 0 80px rgba(212, 175, 55, 0.6), 0 0 120px rgba(212, 175, 55, 0.3)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [isVisible, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Main title */}
      <h1
        ref={titleRef}
        className="font-cinzel text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.2em] metallic-text text-3d relative"
        style={{
          background: 'linear-gradient(90deg, #8B7355 0%, #D4AF37 25%, #F4E4BC 50%, #D4AF37 75%, #8B7355 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {title.split('').map((char, i) => (
          <span
            key={i}
            ref={(el) => (charsRef.current[i] = el)}
            className="inline-block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* Tagline */}
      <p
        ref={taglineRef}
        className="mt-8 text-warm-white/80 font-inter text-sm md:text-base lg:text-lg tracking-[0.4em] uppercase"
      >
        United by Purpose. Driven by Impact.
      </p>

      {/* Decorative line */}
      <div className="mt-6 w-32 h-px bg-gradient-to-r from-transparent via-metallic-gold to-transparent" />
    </div>
  );
};

export default TitleReveal;
