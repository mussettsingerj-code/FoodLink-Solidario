import React, { useState, useEffect } from 'react';
import { FoodCategory } from '../../types';
import { CATEGORY_ILLUSTRATIONS } from '../../data/demoData';

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: FoodCategory;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = 'Otros alimentos',
  className = 'w-full h-full object-cover',
}) => {
  const fallbackSrc = CATEGORY_ILLUSTRATIONS[category] || CATEGORY_ILLUSTRATIONS['Otros alimentos'];
  const [imgSrc, setImgSrc] = useState<string>(src && src.trim() ? src : fallbackSrc);

  useEffect(() => {
    setImgSrc(src && src.trim() ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
      loading="lazy"
    />
  );
};
