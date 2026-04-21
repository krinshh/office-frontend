'use client';

import React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string; // Make alt required for accessibility
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

const Image: React.FC<ImageProps> = ({
  alt,
  src,
  priority = false,
  loading = 'lazy',
  className = '',
  fallbackSrc,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    onError?.();
  };

  return (
    <NextImage
      {...props}
      src={imageSrc}
      alt={alt}
      priority={priority}
      loading={priority ? 'eager' : loading}
      className={className}
      onError={handleError}
    />
  );
};

export default Image;