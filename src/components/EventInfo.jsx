import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventInfo = ({ isVisible }) => {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  const eventDetails = [
    { label: 'Project', value: 'INAIVOM', delay: 0 },
    { label: 'Tagline', value: 'United by Purpose. Driven by Impact.', delay: 0.2 },
    { label: 'Date', value: 'Coming Soon', icon: Calendar, delay: 0.4 },
    { label: 'Venue', value: 'To Be Announced', icon: MapPin, delay: 0.6 },
    { label: 'Time', value: 'TBA', icon: Clock, delay: 0.8 },
    { label: 'Organizer', value: 'Rotary Club', icon: Users, delay: 1.0 },
  ];

  useEffect(() => {
    if (isVisible && containerRef.current) {
      // Set initial state
      gsap.set(itemsRef.current, {
        opacity: 0,
        y: 40,
        rotateX: -20,
      });

      // Staggered reveal animation
      itemsRef.current.forEach((item, i) => {
        if (item) {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            delay: eventDetails[i]?.delay || i * 0.15,
            ease: 'power3.out',
          });
        }
      });

      // CTA button animation (last element)
      const ctaButton = itemsRef.current[itemsRef.current.length - 1];
      if (ctaButton) {
        gsap.fromTo(
          ctaButton,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            delay: 1.2,
            ease: 'back.out(1.7)',
          }
        );
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-30 px-6"
    >
      {/* Info cards container */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl w-full">
        {eventDetails.map((detail, i) => (
          <div
            key={i}
            ref={(el) => (itemsRef.current[i] = el)}
            className="group relative p-4 md:p-6 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(10, 10, 10, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              backdropFilter: 'blur(10px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
              }}
            />

            {/* Icon */}
            {detail.icon && (
              <detail.icon className="w-5 h-5 text-metallic-gold/60 mb-2" />
            )}

            {/* Label */}
            <p className="text-warm-white/50 text-xs uppercase tracking-widest mb-1">
              {detail.label}
            </p>

            {/* Value */}
            <p className={`font-cinzel ${i === 0 ? 'text-xl md:text-2xl text-metallic-gold' : 'text-sm md:text-base text-warm-white/90'} tracking-wide`}>
              {detail.value}
            </p>

            {/* Decorative corner */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 opacity-30"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(212, 175, 55, 0.5) 50%)',
              }}
            />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div
        ref={(el) => (itemsRef.current[eventDetails.length] = el)}
        className="mt-8"
      >
        <button
          className="cinematic-btn group relative overflow-hidden"
          onClick={() => {
            // Trigger notification or modal
            alert('Thank you for your interest! More details coming soon.');
          }}
        >
          <span className="relative z-10">Stay Updated</span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
            }}
          />
        </button>
      </div>

      {/* Social links */}
      <div className="mt-6 flex gap-6">
        {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
          <a
            key={social}
            href="#"
            className="text-warm-white/40 hover:text-metallic-gold text-xs tracking-widest uppercase transition-colors duration-300"
          >
            {social}
          </a>
        ))}
      </div>
    </div>
  );
};

export default EventInfo;
