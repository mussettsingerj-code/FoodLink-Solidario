import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';

interface Interactive3DLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

/**
 * Logotipo 3D interactivo y animado de FoodLink Solidario.
 * Simula una moneda/medallón tridimensional con rotación continua sobre el eje Y,
 * respuesta dinámica a la inclinación del cursor (tilt), sombreado volumétrico,
 * reflejo especular en movimiento y profundidad física mediante capas CSS 3D.
 */
export const Interactive3DLogo: React.FC<Interactive3DLogoProps> = ({
  className = '',
  size = 'responsive',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Estados de animación física continua
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [transformStyle, setTransformStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    sheenOffset: 0,
    shadowScale: 1,
  });

  // Referencias para el loop de animación sin react-rerenders pesados
  const rotationYRef = useRef(0);
  const baseSpeedRef = useRef(0.42); // Grados por frame en rotación pasiva
  const currentSpeedRef = useRef(0.42);
  const tiltXRef = useRef(0);
  const tiltYRef = useRef(0);
  const targetTiltXRef = useRef(0);
  const targetTiltYRef = useRef(0);
  const floatTimeRef = useRef(0);

  // Manejo del cursor para inclinación interactiva
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    // Limitar rango de inclinación a +/- 16 grados
    targetTiltXRef.current = -normY * 16;
    targetTiltYRef.current = normX * 20;
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    targetTiltXRef.current = 0;
    targetTiltYRef.current = 0;
  }, []);

  // Interacción táctil en móviles
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = (touch.clientX - centerX) / (rect.width / 2);
    const normY = (touch.clientY - centerY) / (rect.height / 2);

    targetTiltXRef.current = Math.max(-14, Math.min(14, -normY * 14));
    targetTiltYRef.current = Math.max(-18, Math.min(18, normX * 18));
  }, []);

  const handleTouchEnd = useCallback(() => {
    targetTiltXRef.current = 0;
    targetTiltYRef.current = 0;
  }, []);

  // Respuesta al clic
  const handleClick = useCallback(() => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 450);
  }, []);

  // Loop de física y renderizado a 60fps
  useEffect(() => {
    if (shouldReduceMotion) {
      // Si el usuario tiene reducción de movimiento activa, dejamos una vista estática elegante
      setTransformStyle({
        rotateX: 4,
        rotateY: 12,
        translateY: 0,
        sheenOffset: 45,
        shadowScale: 1,
      });
      return;
    }

    let lastTimestamp = performance.now();

    const updatePhysics = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 16.667, 2.5);
      lastTimestamp = timestamp;

      // Velocidad de rotación suave con aceleración al interactuar
      const targetSpeed = isHovered ? 0.95 : 0.45;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * 0.08 * delta;
      rotationYRef.current = (rotationYRef.current + currentSpeedRef.current * delta) % 360;

      // Suavizado e inercia (Lerp) para la inclinación del cursor
      tiltXRef.current += (targetTiltXRef.current - tiltXRef.current) * 0.12 * delta;
      tiltYRef.current += (targetTiltYRef.current - tiltYRef.current) * 0.12 * delta;

      // Efecto de flotación armónica vertical
      floatTimeRef.current += 0.028 * delta;
      const floatY = Math.sin(floatTimeRef.current) * 6;

      // Proyección del ángulo para el reflejo de luz (sheen)
      const normalizedAngle = ((rotationYRef.current % 360) + 360) % 360;
      const sheenPos = (normalizedAngle / 360) * 200 - 50;

      // Proyección de escala de sombra según rotación y altura
      const cosAngle = Math.abs(Math.cos((rotationYRef.current * Math.PI) / 180));
      const shadowScale = (0.75 + cosAngle * 0.25) * (1 - floatY * 0.015);

      setTransformStyle({
        rotateX: tiltXRef.current,
        rotateY: rotationYRef.current + tiltYRef.current,
        translateY: floatY,
        sheenOffset: sheenPos,
        shadowScale: Math.max(0.4, Math.min(1.1, shadowScale)),
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isHovered, shouldReduceMotion]);

  // Dimensiones según tamaño seleccionado
  const sizeClasses = {
    sm: 'w-40 h-40 sm:w-48 sm:h-48',
    md: 'w-56 h-56 sm:w-64 sm:h-64',
    lg: 'w-72 h-72 sm:w-80 sm:h-80',
    responsive: 'w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 lg:w-76 lg:h-76 xl:w-88 xl:h-88',
  }[size];

  // Grosor del canto del medallón (8 capas en Z para volumen físico real)
  const rimLayers = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: '1100px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Logotipo 3D interactivo de FoodLink Solidario. Coloca el cursor para interactuar con la inclinación."
    >
      {/* Halo de luz ambiental esmeralda detrás del medallón */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-700 ease-out ${
          isHovered
            ? 'w-72 h-72 sm:w-88 sm:h-88 bg-emerald-400/25 blur-3xl scale-110'
            : 'w-56 h-56 sm:w-72 sm:h-72 bg-emerald-500/15 blur-2xl scale-95'
        }`}
      />

      {/* Contenedor Medallón 3D con transform-style: preserve-3d */}
      <div
        ref={containerRef}
        className={`relative ${sizeClasses} cursor-grab active:cursor-grabbing transition-transform duration-150 ease-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateY(${transformStyle.translateY}px) rotateX(${transformStyle.rotateX}deg) rotateY(${transformStyle.rotateY}deg) scale(${
            isClicked ? 0.92 : isHovered ? 1.05 : 1
          })`,
          transition: isClicked
            ? 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            : 'transform 0.06s ease-out',
        }}
      >
        {/* Capas intermedias que forman el borde / canto cilíndrico de la moneda (volumen físico) */}
        {rimLayers.map((z) => (
          <div
            key={z}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: `translateZ(${z}px)`,
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
              border: '2px solid rgba(16, 185, 129, 0.35)',
              opacity: 0.9,
            }}
          />
        ))}

        {/* ======================================================== */}
        {/* CARA FRONTAL DEL MEDALLÓN                                 */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 rounded-full bg-white dark:bg-white overflow-hidden shadow-2xl flex items-center justify-center"
          style={{
            transform: 'translateZ(4px)',
            backfaceVisibility: 'hidden',
            border: '4px solid #10b981',
            boxShadow: isHovered
              ? '0 0 35px rgba(16, 185, 129, 0.4), inset 0 0 16px rgba(0, 0, 0, 0.08)'
              : '0 12px 30px rgba(0, 0, 0, 0.25), inset 0 0 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Anillo de bisel metálico decorativo */}
          <div className="absolute inset-1.5 rounded-full border border-emerald-300/60 pointer-events-none" />

          {/* Imagen real del logotipo FoodLink Solidario */}
          <img
            src="/logo.png"
            alt="FoodLink Solidario Logotipo Oficial"
            className="w-[92%] h-[92%] object-contain pointer-events-none select-none drop-shadow-xs"
            draggable={false}
            referrerPolicy="no-referrer"
          />

          {/* Destello de brillo especular dinámico que cruza el lente de cristal */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: `linear-gradient(
                125deg,
                rgba(255, 255, 255, 0) ${transformStyle.sheenOffset - 25}%,
                rgba(255, 255, 255, 0.45) ${transformStyle.sheenOffset}%,
                rgba(255, 255, 255, 0.75) ${transformStyle.sheenOffset + 8}%,
                rgba(255, 255, 255, 0) ${transformStyle.sheenOffset + 30}%
              )`,
              opacity: isHovered ? 0.9 : 0.6,
              mixBlendMode: 'screen',
            }}
          />

          {/* Sombra de oclusión interna que da curvatura esférica */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.18) 100%)',
            }}
          />
        </div>

        {/* ======================================================== */}
        {/* CARA POSTERIOR DEL MEDALLÓN                               */}
        {/* Muestra exactamente el mismo diseño oficial sin invertir  */}
        {/* el logotipo, garantizando legibilidad en 360 grados       */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 rounded-full bg-white dark:bg-white overflow-hidden shadow-2xl flex items-center justify-center"
          style={{
            transform: 'rotateY(180deg) translateZ(4px)',
            backfaceVisibility: 'hidden',
            border: '4px solid #10b981',
            boxShadow: isHovered
              ? '0 0 35px rgba(16, 185, 129, 0.4), inset 0 0 16px rgba(0, 0, 0, 0.08)'
              : '0 12px 30px rgba(0, 0, 0, 0.25), inset 0 0 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Anillo de bisel metálico decorativo */}
          <div className="absolute inset-1.5 rounded-full border border-emerald-300/60 pointer-events-none" />

          {/* Imagen real del logotipo FoodLink Solidario */}
          <img
            src="/logo.png"
            alt="FoodLink Solidario Logotipo Oficial"
            className="w-[92%] h-[92%] object-contain pointer-events-none select-none drop-shadow-xs"
            draggable={false}
            referrerPolicy="no-referrer"
          />

          {/* Destello de brillo para el reverso */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: `linear-gradient(
                125deg,
                rgba(255, 255, 255, 0) ${transformStyle.sheenOffset - 25}%,
                rgba(255, 255, 255, 0.4) ${transformStyle.sheenOffset}%,
                rgba(255, 255, 255, 0.7) ${transformStyle.sheenOffset + 8}%,
                rgba(255, 255, 255, 0) ${transformStyle.sheenOffset + 30}%
              )`,
              opacity: isHovered ? 0.9 : 0.6,
              mixBlendMode: 'screen',
            }}
          />

          {/* Sombra de oclusión interna */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.18) 100%)',
            }}
          />
        </div>
      </div>

      {/* Sombra dinámica sobre el suelo que reacciona a la rotación y flotación */}
      <div
        className="w-40 sm:w-56 lg:w-64 h-5 rounded-[100%] bg-emerald-950/70 dark:bg-black/80 blur-md pointer-events-none mt-4 transition-all duration-75"
        style={{
          transform: `scaleX(${transformStyle.shadowScale}) scaleY(${
            0.85 + Math.abs(transformStyle.rotateX) * 0.015
          })`,
          opacity: 0.65 - (transformStyle.translateY / 12) * 0.2,
        }}
      />
    </div>
  );
};
