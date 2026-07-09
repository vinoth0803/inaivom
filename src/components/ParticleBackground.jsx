import { useEffect, useRef } from 'react';

const ParticleBackground = ({ intensity = 'high', isActive = true }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle count based on intensity and device
    const isMobile = window.innerWidth < 768;
    const baseCount = intensity === 'high' ? (isMobile ? 30 : 80) : (isMobile ? 15 : 40);

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < baseCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        golden: Math.random() > 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Render every 2nd frame on mobile for performance
      if (isMobile && frameCount % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        // Wrap around
        if (particle.y > height + 10) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }
        if (particle.x > width + 10) particle.x = -10;
        if (particle.x < -10) particle.x = width + 10;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        const color = particle.golden 
          ? `rgba(212, 175, 55, ${particle.opacity})`
          : `rgba(128, 0, 128, ${particle.opacity * 0.5})`;

        // Draw paper-like particle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ParticleBackground;
