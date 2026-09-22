import React from 'react';

export const LOGO_URL = '/logo.png';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
}

/**
 * Componente Logo oficial para FoodLink Solidario.
 * Utiliza exclusivamente la imagen real del logo con preservación de proporciones (aspect-ratio).
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showBackground = true,
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-12',
    lg: 'h-16',
    xl: 'h-24',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center ${
        showBackground
          ? 'bg-white rounded-xl p-1 shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
          : ''
      } ${className}`}
    >
      <img
        src={LOGO_URL}
        alt="FoodLink Solidario"
        className={`${heightClasses} w-auto object-contain select-none`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
