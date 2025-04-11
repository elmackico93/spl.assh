import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface CodeRainProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  charSet?: 'default' | 'matrix' | 'binary' | 'custom';
  customChars?: string;
  glitchEffect?: boolean;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
}

export const CodeRain: React.FC<CodeRainProps> = ({
  className,
  density = 'medium',
  speed = 'medium',
  charSet = 'default',
  customChars = '',
  glitchEffect = true,
  backgroundColor = 'var(--m-bg)',
  textColor = 'var(--m-text)',
  height = '100%',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);

  // Get the character set based on the prop
  const getCharacters = () => {
    switch (charSet) {
      case 'matrix':
        return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
      case 'binary':
        return '01';
      case 'custom':
        return customChars || 'abcdefghijklmnopqrstuvwxyz0123456789';
      default:
        return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    }
  };

  // Get density value
  const getDensityValue = () => {
    switch (density) {
      case 'low':
        return 0.01;
      case 'high':
        return 0.03;
      default: // medium
        return 0.02;
    }
  };

  // Get speed value
  const getSpeedValue = () => {
    switch (speed) {
      case 'slow':
        return 1;
      case 'fast':
        return 3;
      default: // medium
        return 2;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const { offsetWidth, offsetHeight } = canvas.parentElement || { offsetWidth: 0, offsetHeight: 0 };
      setDimensions({ width: offsetWidth, height: offsetHeight });
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const characters = getCharacters();
    const densityValue = getDensityValue();
    const speedValue = getSpeedValue();

    // Column properties
    const fontSize = 16;
    const columns = Math.floor(dimensions.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Frame rate control
    let lastTime = 0;
    const framesPerSecond = 30;
    const frameInterval = 1000 / framesPerSecond;

    const draw = (timestamp: number) => {
      // Calculate elapsed time
      const elapsed = timestamp - lastTime;

      // If enough time has passed, draw the next frame
      if (elapsed > frameInterval) {
        lastTime = timestamp - (elapsed % frameInterval);

        // Semi-transparent black background to show trail effect
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set green text
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px courier`;

        // Loop over each column
        for (let i = 0; i < drops.length; i++) {
          // Generate a random character from our set
          const text = characters.charAt(Math.floor(Math.random() * characters.length));

          // Randomize brightness for glitch effect if enabled
          if (glitchEffect && Math.random() > 0.95) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Bright white for glitch effect
          } else {
            ctx.fillStyle = textColor;
          }

          // Draw the character
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          // Randomly reset some columns to top
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          // Increment y coordinate for next character
          drops[i] += speedValue;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Initialize additional raindrop streams based on density
    for (let i = 0; i < Math.floor(columns * densityValue); i++) {
      const randomColumn = Math.floor(Math.random() * columns);
      drops[randomColumn] = Math.floor(Math.random() * (canvas.height / fontSize));
    }

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, density, speed, charSet, customChars, glitchEffect, backgroundColor, textColor]);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
};

export default CodeRain;

