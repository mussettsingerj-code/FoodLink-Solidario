import React from 'react';
import { motion, useReducedMotion, Variants } from 'motion/react';

export type ScrollAnimationType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: ScrollAnimationType;
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
  viewportMargin?: string;
  once?: boolean;
}

const getVariants = (animation: string, distance: number): Variants => {
  switch (animation) {
    case 'fade':
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    case 'slide-left':
      return {
        hidden: { opacity: 0, x: -distance },
        visible: { opacity: 1, x: 0 },
      };
    case 'slide-right':
      return {
        hidden: { opacity: 0, x: distance },
        visible: { opacity: 1, x: 0 },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      };
    case 'slide-up':
    default:
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0 },
      };
  }
};

/**
 * Componente declarativo para animaciones activadas por scroll.
 * Respeta `prefers-reduced-motion` y se activa una sola vez para no distraer al usuario.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'slide-up',
  duration = 0.55,
  delay = 0,
  distance = 24,
  className = '',
  viewportMargin = '-40px',
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = getVariants(animation, distance);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Cubic bezier suave para aceleración natural
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollStaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewportMargin?: string;
  once?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

/**
 * Contenedor escalonado para listas o grupos de tarjetas.
 * Sus hijos (<ScrollStaggerItem>) se revelan uno después de otro.
 */
export const ScrollStaggerContainer: React.FC<ScrollStaggerContainerProps> = ({
  children,
  staggerDelay = 0.12,
  delayChildren = 0.05,
  className = '',
  viewportMargin = '-40px',
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerDelay, delayChildren }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollStaggerItemProps {
  children: React.ReactNode;
  animation?: 'slide-up' | 'scale' | 'fade';
  distance?: number;
  duration?: number;
  className?: string;
}

const itemVariants = (animation: string, distance: number): Variants => {
  switch (animation) {
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      };
    case 'fade':
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    case 'slide-up':
    default:
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0 },
      };
  }
};

export const ScrollStaggerItem: React.FC<ScrollStaggerItemProps> = ({
  children,
  animation = 'slide-up',
  distance = 20,
  duration = 0.5,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={itemVariants(animation, distance)}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
