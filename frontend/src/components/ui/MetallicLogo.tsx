import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export const MetallicLogo = ({ size = 120, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create metallic gradient effect
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Animated metallic colors
      const hue = (time * 20) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 80%, 70%, 1)`);
      gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 70%, 60%, 0.8)`);

      // Draw animated circles (liquid effect)
      for (let i = 0; i < 3; i++) {
        const x = canvas.width / 2 + Math.sin(time + i * 2) * 20;
        const y = canvas.height / 2 + Math.cos(time + i * 2) * 20;
        const radius = 30 + Math.sin(time * 2 + i) * 10;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Canvas background with liquid metallic effect */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0 rounded-full"
        style={{ filter: 'blur(8px)' }}
      />
      
      {/* Logo overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Leaf
          className="text-primary drop-shadow-2xl"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6))',
          }}
        />
      </motion.div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default MetallicLogo;
