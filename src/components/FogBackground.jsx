// Lightweight atmospheric fog. Previously this ran a per-pixel noise field on
// a canvas three times per frame (~1.5M ops/frame) which stalled the launch.
// This CSS version is GPU-composited and costs effectively zero CPU while
// keeping the same dark-purple drifting-fog look.
const FogBackground = ({ isActive = true }) => {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background:
          'radial-gradient(ellipse at center, #1a0a1f 0%, #0f0512 50%, #0a0a0a 100%)',
      }}
    >
      <div className="fog-blob fog-blob-1" />
      <div className="fog-blob fog-blob-2" />
      <div className="fog-blob fog-blob-3" />

      <style>{`
        .fog-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          will-change: transform;
        }
        .fog-blob-1 {
          width: 70vw; height: 70vw; left: -15vw; top: -20vh;
          background: radial-gradient(circle, rgba(90, 0, 100, 0.35), transparent 70%);
          animation: fog-drift-1 34s ease-in-out infinite;
        }
        .fog-blob-2 {
          width: 60vw; height: 60vw; right: -10vw; top: 20vh;
          background: radial-gradient(circle, rgba(60, 0, 80, 0.30), transparent 70%);
          animation: fog-drift-2 42s ease-in-out infinite;
        }
        .fog-blob-3 {
          width: 55vw; height: 55vw; left: 20vw; bottom: -20vh;
          background: radial-gradient(circle, rgba(40, 0, 55, 0.28), transparent 70%);
          animation: fog-drift-3 38s ease-in-out infinite;
        }
        @keyframes fog-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(12vw, 10vh) scale(1.15); }
        }
        @keyframes fog-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50%      { transform: translate(-10vw, 8vh) scale(1); }
        }
        @keyframes fog-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(8vw, -10vh) scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fog-blob { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default FogBackground;
