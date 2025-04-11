import React, { ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

type GlitchTextProps<T extends ElementType> = {
  text: string;
  intensity?: 'light' | 'medium' | 'heavy';
  as?: T;
} & ComponentPropsWithoutRef<T>;

export const GlitchText = <T extends ElementType = 'div'>({
  text,
  intensity = 'medium',
  as,
  className,
  ...props
}: GlitchTextProps<T>) => {
  const Component = as || 'div';

  // Set different animation values based on intensity
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'light':
        return {
          beforeAnimation: 'animate-[glitch-1-light_2s_infinite_linear_alternate-reverse]',
          afterAnimation: 'animate-[glitch-2-light_3s_infinite_linear_alternate-reverse]',
        };
      case 'heavy':
        return {
          beforeAnimation: 'animate-[glitch-1-heavy_1.5s_infinite_linear_alternate-reverse]',
          afterAnimation: 'animate-[glitch-2-heavy_2s_infinite_linear_alternate-reverse]',
        };
      default: // medium
        return {
          beforeAnimation: 'animate-[glitch-1_2s_infinite_linear_alternate-reverse]',
          afterAnimation: 'animate-[glitch-2_3s_infinite_linear_alternate-reverse]',
        };
    }
  };

  const { beforeAnimation, afterAnimation } = getIntensityStyles();

  return (
    <Component
      data-text={text}
      className={cn(
        'relative text-matrix-text font-matrix tracking-wide',
        'before:content-[attr(data-text)] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-matrix-bg before:left-[2px] before:text-shadow-[hsl(0,100%,50%)_-2px_0] before:clip-path-[polygon(0_0,100%_0,100%_45%,0_45%)]',
        'after:content-[attr(data-text)] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-matrix-bg after:left-[-2px] after:text-shadow-[#00f_2px_0] after:clip-path-[polygon(0_55%,100%_55%,100%_100%,0_100%)]',
        beforeAnimation,
        afterAnimation,
        className
      )}
      {...props}
    >
      {text}
    </Component>
  );
};

export default GlitchText;