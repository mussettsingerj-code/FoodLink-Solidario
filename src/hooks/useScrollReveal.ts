import { useEffect, useState, useRef } from 'react';

export interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delayMs?: number;
}

/**
 * Hook reutilizable para detectar cuándo un elemento entra en el viewport mediante IntersectionObserver.
 * Respeta 'prefers-reduced-motion' y garantiza que el contenido nunca quede invisible ante fallos.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true,
    delayMs = 0,
  } = options;

  const elementRef = useRef<T | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  useEffect(() => {
    // Si el usuario solicita movimiento reducido o no hay soporte para IntersectionObserver,
    // mostrar de inmediato sin animaciones para accesibilidad total.
    if (typeof window === 'undefined') {
      setIsInView(true);
      setHasAnimated(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsInView(true);
      setHasAnimated(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    let timeoutId: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              timeoutId = window.setTimeout(() => {
                setIsInView(true);
                setHasAnimated(true);
              }, delayMs);
            } else {
              setIsInView(true);
              setHasAnimated(true);
            }

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delayMs]);

  return { elementRef, isInView, hasAnimated };
}
