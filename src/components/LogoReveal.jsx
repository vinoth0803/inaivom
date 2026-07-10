import { useEffect, useRef } from 'react';

// Plays your logo-reveal video once, then advances to the poster assembly.
// Drop your file(s) into public/logo/ (WebM preferred for transparency;
// MP4 as a fallback):
//   public/logo/reveal.webm
//   public/logo/reveal.mp4
const LOGO_SOURCES = [
  { src: '/logo/reveal.webm', type: 'video/webm' },
  { src: '/logo/reveal.mp4', type: 'video/mp4' },
];

// Safety cap: if the "ended" event never fires (e.g. missing file), move on.
const SAFETY_MS = 20000;

const LogoReveal = ({ isVisible, onComplete }) => {
  const videoRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isVisible) {
      doneRef.current = false;
      return;
    }

    doneRef.current = false;
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      if (onComplete) onComplete();
    };

    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = 0;
      } catch (e) {
        /* noop */
      }
      const p = video.play();
      // If autoplay is blocked or the file is missing, skip to the assembly.
      if (p && p.catch) p.catch(() => finish());
    } else {
      finish();
    }

    // Fallback timer in case the video never signals "ended".
    const timer = setTimeout(finish, SAFETY_MS);
    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const handleFinish = () => {
    if (!doneRef.current) {
      doneRef.current = true;
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={handleFinish}
        onError={handleFinish}
      >
        {LOGO_SOURCES.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
    </div>
  );
};

export default LogoReveal;
