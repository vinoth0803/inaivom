import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

// Counts down from `from` to 1, one number per second, then calls onComplete.
const Countdown = ({ isVisible, from = 5, onComplete }) => {
  const [count, setCount] = useState(from);
  const numRef = useRef(null);
  const startedRef = useRef(false);

  // Drive the countdown timer.
  useEffect(() => {
    if (!isVisible) {
      startedRef.current = false;
      setCount(from);
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    setCount(from);

    let n = from;
    const interval = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setCount(n);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, from, onComplete]);

  // Animate each number as it changes: pop in, then swell out.
  useEffect(() => {
    if (isVisible && numRef.current) {
      gsap.fromTo(
        numRef.current,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
      gsap.to(numRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.55,
        delay: 0.45,
        ease: 'power2.in',
      });
    }
  }, [count, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
      <span
        ref={numRef}
        className="font-cinzel font-bold metallic-text"
        style={{
          fontSize: 'clamp(6rem, 30vw, 16rem)',
          textShadow: '0 0 80px rgba(212, 175, 55, 0.5)',
        }}
      >
        {count}
      </span>
    </div>
  );
};

export default Countdown;
