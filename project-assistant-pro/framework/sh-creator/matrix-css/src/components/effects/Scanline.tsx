import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface ScanlineProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'heavy';
  type?: 'horizontal' | 'vertical' | 'both';
  children: React.ReactNode;
}

export const Scanline: React.FC<ScanlineProps> = ({
  intensity = 'medium',
  type = 'horizontal',
  children,
  className,
  ...props
}) => {
  // Get CSS variables based on intensity
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'light':
        return {
          opacity: '0.3',
          size: '1px',
          gap: '10px',
        };
      case 'heavy':
        return {
          opacity: '0.7',
          size: '3px',
          gap: '8px',
        };
      default: // medium
        return {
          opacity: '0.5',
          size: '2px',
          gap: '9px',
        };
    }
  };

  const { opacity, size, gap } = getIntensityStyles();

  const horizontalScanline = type === 'horizontal' || type === 'both';
  const verticalScanline = type === 'vertical' || type === 'both';

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Original content */}
      {children}

      {/* Horizontal scanlines */}
      {horizontalScanline && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              transparent ${gap},
              rgba(0, 0, 0, ${opacity}) ${gap},
              rgba(0, 0, 0, ${opacity}) calc(${gap} + ${size}),
              transparent calc(${gap} + ${size})
            )`,
            backgroundSize: `100% calc(${gap} + ${size})`,
            backgroundRepeat: 'repeat',
          }}
        />
      )}

      {/* Vertical scanlines */}
      {verticalScanline && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: `linear-gradient(
              to right,
              transparent ${gap},
              rgba(0, 0, 0, ${opacity}) ${gap},
              rgba(0, 0, 0, ${opacity}) calc(${gap} + ${size}),
              transparent calc(${gap} + ${size})
            )`,
            backgroundSize: `calc(${gap} + ${size}) 100%`,
            backgroundRepeat: 'repeat',
          }}
        />
      )}

      {/* Moving scanline effect */}
      {horizontalScanline && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: `linear-gradient(to bottom, transparent, transparent 50%, rgba(0, 255, 65, 0.1) 50%, transparent)`,
            backgroundSize: '100% 4px',
            animation: 'scanline 10s linear infinite',
          }}
        />
      )}
    </div>
  );
};

export default Scanline;

