import { useEffect, useRef } from 'react';

const FogBackground = ({ isActive = true }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

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

    // Fog layers
    const fogLayers = [
      { offset: 0, speed: 0.0005, scale: 0.003, opacity: 0.15 },
      { offset: 1000, speed: 0.0003, scale: 0.005, opacity: 0.1 },
      { offset: 2000, speed: 0.0007, scale: 0.002, opacity: 0.08 },
    ];

    // Simple noise function
    const noise = (x, y) => {
      return Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.5 + 0.5;
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Dark purple base
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      gradient.addColorStop(0, '#1a0a1f');
      gradient.addColorStop(0.5, '#0f0512');
      gradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw fog layers
      fogLayers.forEach((layer) => {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y += 4) { // Skip pixels for performance
          for (let x = 0; x < width; x += 4) {
            const nx = (x + time * layer.speed + layer.offset) * layer.scale;
            const ny = (y + time * layer.speed * 0.5) * layer.scale;
            const n = noise(nx, ny);

            const idx = (y * width + x) * 4;
            const purpleIntensity = Math.floor(n * layer.opacity * 255);

            // Fill 4x4 block
            for (let dy = 0; dy < 4 && y + dy < height; dy++) {
              for (let dx = 0; dx < 4 && x + dx < width; dx++) {
                const blockIdx = ((y + dy) * width + (x + dx)) * 4;
                data[blockIdx] = purpleIntensity * 0.5;     // R
                data[blockIdx + 1] = 0;                      // G
                data[blockIdx + 2] = purpleIntensity * 0.8; // B
                data[blockIdx + 3] = purpleIntensity;        // A
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FogBackground;
