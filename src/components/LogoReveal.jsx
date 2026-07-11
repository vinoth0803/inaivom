import { useEffect, useRef } from 'react';

// Plays your logo-reveal video once, then advances to the poster assembly.
// Drop your file into public/logo/reveal.mp4 (H.264 MP4 recommended).
const LOGO_SRC = '/logo/reveal.mp4';

// Safety cap: if the "ended" event never fires (e.g. missing file), move on.
const SAFETY_MS = 20000;

// `active`  -> mount + start buffering the video (do this early so it's ready)
// `isVisible` -> actually show and play it
const LogoReveal = ({ active, isVisible, onComplete }) => {
  const videoRef = useRef(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (onComplete) onComplete();
  };

  // Start buffering as soon as the experience begins.
  useEffect(() => {
    if (active && videoRef.current) {
      videoRef.current.load();
    }
  }, [active]);

  // Play only once the scene becomes visible (it's already buffered by then).
  useEffect(() => {
    if (!isVisible) return;

    doneRef.current = false;
    const video = videoRef.current;

    if (video) {
      try {
        video.currentTime = 0;
      } catch (e) {
        /* noop */
      }
      const p = video.play();
      if (p && p.catch) {
        p.catch((err) => console.warn('[logo] play() rejected (continuing):', err?.name || err));
      }
    }

    const timer = setTimeout(finish, SAFETY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Not started yet -> don't mount (nothing to buffer).
  if (!active) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black"
      style={{
        zIndex: isVisible ? 30 : -1,
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={LOGO_SRC}
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={() => {
          console.warn(`[logo] video error — skipping to poster. Check ${LOGO_SRC}`);
          if (isVisible) finish();
        }}
      />
    </div>
  );
};

export default LogoReveal;
