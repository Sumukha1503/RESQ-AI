import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export const MetallicLogo = ({ size = 120, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create metallic gradient effect with green/emerald colors
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Metallic green shades
      const offset = Math.sin(time * 2) * 0.2;
      gradient.addColorStop(0, `hsla(142, 76%, ${40 + offset * 20}%, 0.6)`);
      gradient.addColorStop(0.3, `hsla(142, 86%, ${50 + offset * 15}%, 0.8)`);
      gradient.addColorStop(0.6, `hsla(152, 76%, ${45 + offset * 18}%, 0.9)`);
      gradient.addColorStop(1, `hsla(142, 86%, ${35 + offset * 20}%, 0.7)`);

      // Draw animated liquid circles
      for (let i = 0; i < 5; i++) {
        const angle = time + (i * Math.PI * 2) / 5;
        const x = canvas.width / 2 + Math.sin(angle) * 25;
        const y = canvas.height / 2 + Math.cos(angle) * 25;
        const radius = 25 + Math.sin(time * 3 + i) * 8;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.4 + Math.sin(time + i) * 0.1;
        ctx.fill();
      }

      // Add central glow
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      centerGradient.addColorStop(0, 'hsla(142, 86%, 60%, 0.3)');
      centerGradient.addColorStop(1, 'hsla(142, 86%, 40%, 0)');
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.globalAlpha = 0.6 + Math.sin(time) * 0.2;
      ctx.fill();

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
        className="absolute inset-0 rounded-full opacity-90"
        style={{ filter: 'blur(12px)' }}
      />
      
      {/* Logo overlay with animations */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Leaf
          className="text-primary"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            filter: 'drop-shadow(0 0 25px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 50px rgba(34, 197, 94, 0.4))',
          }}
        />
      </motion.div>

      {/* Metallic shimmer overlay */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 80%)',
          backgroundSize: '300% 300%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Edge glow effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: 'inset 0 0 30px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.2)',
        }}
      />
    </div>
  );
};

export default MetallicLogo;
