import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// ---------------------------------------------------------------------------
// POSTER PIECES
//
// Split your 4:5 poster into four EQUAL quarters and save them here:
//   public/poster/1.png  = TOP-LEFT
//   public/poster/2.png  = TOP-RIGHT
//   public/poster/3.png  = BOTTOM-LEFT
//   public/poster/4.png  = BOTTOM-RIGHT
// Also save the uncut poster as public/poster/full.png (used by PosterReveal
// to fade in over the joined pieces and hide any seams).
//
// If a slice is missing, that quarter falls back to a dark gradient so nothing
// breaks while you're still preparing the artwork.
// ---------------------------------------------------------------------------
const SLICES = [
  '/poster/1.png', // top-left
  '/poster/2.png', // top-right
  '/poster/3.png', // bottom-left
  '/poster/4.png', // bottom-right
];

// Each quadrant: the image slice layered over a gradient fallback.
const GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(225deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(315deg, #1a1a2e 0%, #16213e 100%)',
];

const POSITIONS = [
  'top-0 left-0',
  'top-0 right-0',
  'bottom-0 left-0',
  'bottom-0 right-0',
];

const PosterAssembly = ({ isVisible, onComplete }) => {
  const containerRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const tl = gsap.timeline({
        onComplete: () => onComplete && onComplete(),
      });

      // Fly each quarter in from its corner.
      const starts = [
        { x: -220, y: -220, rotation: -15 }, // top-left
        { x: 220, y: -220, rotation: 15 },   // top-right
        { x: -220, y: 220, rotation: 15 },   // bottom-left
        { x: 220, y: 220, rotation: -15 },   // bottom-right
      ];

      const panels = panelsRef.current.filter(Boolean);

      panels.forEach((panel, i) => {
        gsap.set(panel, {
          x: starts[i]?.x || 0,
          y: starts[i]?.y || 0,
          rotation: starts[i]?.rotation || 0,
          opacity: 0,
          scale: 0.8,
        });
      });

      tl.to(panels, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        duration: 1.4,
        stagger: 0.12,
        ease: 'power3.out',
      });

      // Lock-in pulse once assembled.
      tl.to(containerRef.current, {
        scale: 1.03,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center z-10"
    >
      {/* Poster container — 4:5 portrait, sized to fit any screen/orientation */}
      <div className="relative aspect-[4/5]" style={{ width: 'min(86vw, 64vh, 480px)' }}>
        {SLICES.map((slice, i) => (
          <div
            key={i}
            ref={(el) => (panelsRef.current[i] = el)}
            className={`absolute ${POSITIONS[i]} w-1/2 h-1/2 overflow-hidden`}
            style={{
              // Image slice on top, gradient fallback behind it.
              backgroundImage: `url(${slice}), ${GRADIENTS[i]}`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Gold frame around the assembled poster */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '3px solid rgba(212, 175, 55, 0.4)',
            boxShadow: 'inset 0 0 40px rgba(212, 175, 55, 0.2)',
          }}
        />
      </div>
    </div>
  );
};

export default PosterAssembly;
