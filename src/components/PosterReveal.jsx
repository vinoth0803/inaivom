import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// The full, seamless poster that fades in over the four assembled pieces.
// Save it as public/poster/full.png (same 4:5 artwork, uncut).
const FULL_POSTER = '/poster/full.png';

// Warm fire palette (RGB) for the ember blast.
const FIRE_COLORS = [
  [255, 247, 204],
  [255, 210, 77],
  [255, 154, 31],
  [255, 90, 31],
  [255, 45, 0],
];

const EMBER_COUNT = 220;
const SMOKE_COUNT = 30;
const DURATION = 2600; // ms

// Pre-bake a radial glow sprite so we can drawImage() instead of paying for
// box-shadow / blur on hundreds of live DOM nodes.
const makeGlowSprite = (rgb) => {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`);
  grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
};

const makeSmokeSprite = () => {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(35,26,26,1)');
  grd.addColorStop(1, 'rgba(20,15,15,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
};

const PosterReveal = ({ isVisible }) => {
  const posterRef = useRef(null);
  const canvasRef = useRef(null);
  const flashRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    // Poster fades in over the pieces, slightly delayed so the blast reads first.
    if (posterRef.current) {
      gsap.fromTo(
        posterRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.25, ease: 'power2.out' }
      );
    }

    // Cheap single-element full-screen flash.
    if (flashRef.current) {
      gsap.fromTo(
        flashRef.current,
        { opacity: 0.85 },
        { opacity: 0, duration: 0.5, ease: 'power2.out' }
      );
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const rand = (a, b) => a + Math.random() * (b - a);

    const emberSprites = FIRE_COLORS.map(makeGlowSprite);
    const smokeSprite = makeSmokeSprite();

    // Embers: burst outward fast, then rise (buoyancy) and fade.
    const embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(5, 24);
      embers.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(3, 9),
        sprite: emberSprites[(Math.random() * emberSprites.length) | 0],
        life: 1,
        decay: rand(0.006, 0.018),
      });
    }

    // Smoke: slower, rises and expands.
    const smoke = [];
    for (let i = 0; i < SMOKE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(1, 5);
      smoke.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * 0.6,
        vy: Math.sin(angle) * speed * 0.6 - 1,
        size: rand(40, 90),
        life: 1,
        decay: rand(0.004, 0.009),
      });
    }

    const startTime = performance.now();

    const frame = (t) => {
      const elapsed = t - startTime;
      ctx.clearRect(0, 0, w, h);

      // Central fireball (first ~0.5s).
      const fb = elapsed / 500;
      if (fb < 1) {
        const r = 60 + fb * 280;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, `rgba(255,245,220,${0.9 * (1 - fb)})`);
        grd.addColorStop(0.4, `rgba(255,150,50,${0.6 * (1 - fb)})`);
        grd.addColorStop(1, 'rgba(255,60,10,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shockwave rings.
      for (let k = 0; k < 3; k++) {
        const rt = (elapsed - k * 120) / 900;
        if (rt > 0 && rt < 1) {
          ctx.strokeStyle = `rgba(255,170,60,${0.7 * (1 - rt)})`;
          ctx.lineWidth = 4 * (1 - rt) + 1;
          ctx.beginPath();
          ctx.arc(cx, cy, rt * (360 + k * 120), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Smoke (normal blending).
      ctx.globalCompositeOperation = 'source-over';
      for (const p of smoke) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.05;
        p.vx *= 0.98;
        p.size += 0.9;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life) * 0.4;
        const d = p.size * 2;
        ctx.drawImage(smokeSprite, p.x - d / 2, p.y - d / 2, d, d);
      }

      // Embers (additive glow).
      ctx.globalCompositeOperation = 'lighter';
      for (const p of embers) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.12; // buoyancy — embers rise
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        const d = p.size * 6 * Math.max(p.life, 0.2);
        ctx.drawImage(p.sprite, p.x - d / 2, p.y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Full-screen blast flash */}
      <div
        ref={flashRef}
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,240,210,0.95) 0%, rgba(255,140,40,0.5) 45%, transparent 75%)',
          opacity: 0,
        }}
      />

      {/* Explosion canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-30 pointer-events-none" />

      {/* Full poster */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="relative w-[320px] md:w-[400px] lg:w-[480px] aspect-[4/5]">
          <img
            ref={posterRef}
            src={FULL_POSTER}
            alt="Poster"
            className="w-full h-full object-cover"
            style={{ opacity: 0, boxShadow: '0 0 70px rgba(212, 175, 55, 0.35)' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.warn(`[poster] No file at ${FULL_POSTER} — showing the assembled pieces only.`);
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: '3px solid rgba(212, 175, 55, 0.4)',
              boxShadow: 'inset 0 0 40px rgba(212, 175, 55, 0.2)',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PosterReveal;
