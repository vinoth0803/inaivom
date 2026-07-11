import { useEffect, useRef } from 'react';

// Sky-shot fireworks for the poster reveal: glowing heads, fading trails,
// burst flashes, and varied shell types. One canvas, additive glow.
const COLORS = [
  [255, 90, 90],
  [255, 190, 80],
  [90, 180, 255],
  [190, 130, 255],
  [120, 255, 150],
  [255, 245, 190],
  [255, 130, 220],
  [255, 215, 120],
];

// Pre-bake a soft glow sprite per colour so heads are cheap to draw.
const makeGlow = (rgb) => {
  const s = 32;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.95)`);
  grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return c;
};

const Fireworks = ({ isVisible }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const scale = isMobile ? 0.55 : 1; // fewer sparks on mobile

    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];
    const glows = COLORS.map(makeGlow);
    const glowFor = (rgb) => glows[COLORS.indexOf(rgb)] || glows[0];

    const rockets = [];
    const sparks = [];
    const flashes = [];

    const launch = () => {
      const x = rand(w * 0.12, w * 0.88);
      const targetY = rand(h * 0.08, h * 0.42);
      rockets.push({
        x,
        y: h + 10,
        px: x,
        py: h + 10,
        vx: rand(-0.7, 0.7),
        vy: -rand(9.5, 13.5),
        targetY,
        color: pick(COLORS),
      });
    };

    const addSpark = (x, y, vx, vy, color, life, decay, gravity, size, twinkle) => {
      sparks.push({ x, y, px: x, py: y, vx, vy, color, life, decay, gravity, size, twinkle });
    };

    const burst = (x, y, color) => {
      // Bright flash at the detonation point.
      flashes.push({ x, y, life: 1, color });

      const type = Math.random();
      if (type < 0.2) {
        // Ring: uniform speed, thin expanding circle.
        const n = Math.round(60 * scale);
        const sp = rand(4, 6);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          addSpark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, color, 1, rand(0.008, 0.012), 0.03, rand(1.6, 2.6), false);
        }
      } else if (type < 0.4) {
        // Willow: fewer sparks, long life, heavy droop, gold.
        const gold = pick([[255, 215, 120], [255, 190, 80], [255, 245, 190]]);
        const n = Math.round((44 + ((Math.random() * 16) | 0)) * scale);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = rand(1, 4);
          addSpark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, gold, 1, rand(0.004, 0.008), 0.09, rand(1.6, 2.8), true);
        }
      } else {
        // Chrysanthemum: full sphere with varied speeds.
        const n = Math.round((80 + ((Math.random() * 60) | 0)) * scale);
        const two = Math.random() < 0.4 ? pick(COLORS) : color;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rand(-0.1, 0.1);
          const sp = rand(1.5, 7);
          const col = Math.random() < 0.5 ? color : two;
          addSpark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, col, 1, rand(0.007, 0.016), 0.05, rand(1.6, 3), Math.random() < 0.4);
        }
      }
    };

    let last = performance.now();
    let nextLaunch = 250;

    const frame = (t) => {
      const dt = t - last;
      last = t;

      // Fade existing pixels a touch → glowing trails, background stays visible.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      nextLaunch -= dt;
      if (nextLaunch <= 0) {
        launch();
        if (!isMobile && Math.random() < 0.4) launch();
        nextLaunch = isMobile ? rand(750, 1400) : rand(450, 1000);
      }

      // Burst flashes.
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= 0.06;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const r = 70 * (1 - f.life) + 20;
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        grd.addColorStop(0, `rgba(255,255,255,${0.5 * f.life})`);
        grd.addColorStop(0.4, `rgba(${f.color[0]},${f.color[1]},${f.color[2]},${0.35 * f.life})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rockets ascending with a sparkling tail.
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x;
        r.py = r.y;
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12;
        ctx.strokeStyle = `rgba(${r.color[0]},${r.color[1]},${r.color[2]},0.9)`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(r.px, r.py);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        const d = 10;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(glowFor(r.color), r.x - d / 2, r.y - d / 2, d, d);
        ctx.globalAlpha = 1;
        if (r.y <= r.targetY || r.vy >= 0) {
          burst(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Sparks with glowing heads.
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.984;
        s.vy = s.vy * 0.984 + s.gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        let a = Math.max(0, s.life);
        if (s.twinkle && s.life < 0.6) a *= 0.4 + 0.6 * Math.random();
        const d = s.size * 4 * Math.max(s.life, 0.25);
        ctx.globalAlpha = a;
        ctx.drawImage(glowFor(s.color), s.x - d / 2, s.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // z-2: above fog/particles, behind the poster (z-20) and the blast (z-30).
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }} />;
};

export default Fireworks;
