import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

interface ParallaxElementProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.2 (moves slower than scroll) or 0.2 (moves faster)
  className?: string;
  maxOffset?: number; // clamps to avoid wild displacement (default 35px)
}

/**
 * Componente para efectos de profundidad y parallax sutiles en elementos decorativos.
 * Prioriza rendimiento mediante transforms acelerados por hardware y se desactiva
 * automáticamente si el usuario prefiere movimiento reducido.
 */
export const ParallaxElement: React.FC<ParallaxElementProps> = ({
  children,
  speed = 0.15,
  className = '',
  maxOffset = 30,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Mueve de -maxOffset * speed a +maxOffset * speed
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [-maxOffset * (speed / 0.2), maxOffset * (speed / 0.2)]
  );

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
};
