import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import GlitchText from '@/components/effects/GlitchText';

interface MatrixHeroProps {
  className?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  showScrollIndicator?: boolean;
  showVersion?: boolean;
  version?: string;
  disableRainEffect?: boolean;
}

export const MatrixHero: React.FC<MatrixHeroProps> = ({
  className,
  title = 'MATRIX.CSS',
  subtitle = 'Immerse your users in the digital realm with the complete Matrix-inspired design framework. Build stunning cyberpunk interfaces with minimal effort.',
  primaryCta = { text: 'ENTER THE MATRIX', href: '#getting-started' },
  secondaryCta = { text: 'EXPLORE COMPONENTS', href: '#components' },
  showScrollIndicator = true,
  showVersion = true,
  version = 'VERSION 2.0',
  disableRainEffect = false,
}) => {
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  
  // Initialize matrix rain animation
  useEffect(() => {
    if (!rainCanvasRef.current || disableRainEffect) return;

    const canvas = rainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setIsCanvasReady(true);

    // Matrix characters (including Japanese katakana for authenticity)
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Set up columns
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -20);
    }
    
    // Animation function
    const draw = () => {
      // Semi-transparent black background for the trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set green text color
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;
      
      // Loop over each column
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Randomize brightness for some characters
        if (Math.random() > 0.95) {
          ctx.fillStyle = '#00ff97'; // Brighter green
        } else {
          ctx.fillStyle = '#00ff41'; // Regular green
        }
        
        // Draw character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        
        // Move drops down
        drops[i]++;
        
        // Reset to top with randomness
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    const animationRef = { current: requestAnimationFrame(draw) };
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [disableRainEffect]);

  // Button hover effect handlers
  const handlePrimaryButtonMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(-3px)";
    target.style.boxShadow = "0 0 15px var(--m-glow)";
    target.style.background = "linear-gradient(to bottom, rgba(0, 255, 65, 0.8), rgba(0, 180, 30, 0.8))";
    
    // Get or create top line element
    let topLine = target.querySelector('.btn-top-line') as HTMLDivElement;
    if (!topLine) {
      topLine = document.createElement('div');
      topLine.className = 'btn-top-line';
      topLine.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba(255, 255, 255, 0.7);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      `;
      target.appendChild(topLine);
    }
    
    // Get or create bottom line element
    let bottomLine = target.querySelector('.btn-bottom-line') as HTMLDivElement;
    if (!bottomLine) {
      bottomLine = document.createElement('div');
      bottomLine.className = 'btn-bottom-line';
      bottomLine.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba(255, 255, 255, 0.7);
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      `;
      target.appendChild(bottomLine);
    }
    
    // Animate lines
    requestAnimationFrame(() => {
      topLine.style.transform = "scaleX(1)";
      bottomLine.style.transform = "scaleX(1)";
    });
  };

  const handlePrimaryButtonMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(0)";
    target.style.boxShadow = "0 0 10px var(--m-glow)";
    target.style.background = "linear-gradient(to bottom, rgba(0, 255, 65, 0.7), rgba(0, 150, 30, 0.7))";
    
    const topLine = target.querySelector('.btn-top-line') as HTMLDivElement;
    const bottomLine = target.querySelector('.btn-bottom-line') as HTMLDivElement;
    
    if (topLine) topLine.style.transform = "scaleX(0)";
    if (bottomLine) bottomLine.style.transform = "scaleX(0)";
  };

  const handleSecondaryButtonMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(-3px)";
    target.style.boxShadow = "0 0 15px var(--m-glow)";
    target.style.backgroundColor = "rgba(7, 39, 7, 0.8)";
    target.style.color = "var(--m-text-bright)";
    
    // Get or create top line element
    let topLine = target.querySelector('.btn-top-line') as HTMLDivElement;
    if (!topLine) {
      topLine = document.createElement('div');
      topLine.className = 'btn-top-line';
      topLine.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--m-text);
        opacity: 0.7;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      `;
      target.appendChild(topLine);
    }
    
    // Get or create bottom line element
    let bottomLine = target.querySelector('.btn-bottom-line') as HTMLDivElement;
    if (!bottomLine) {
      bottomLine = document.createElement('div');
      bottomLine.className = 'btn-bottom-line';
      bottomLine.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--m-text);
        opacity: 0.7;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      `;
      target.appendChild(bottomLine);
    }
    
    // Animate lines
    requestAnimationFrame(() => {
      topLine.style.transform = "scaleX(1)";
      bottomLine.style.transform = "scaleX(1)";
    });
  };

  const handleSecondaryButtonMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(0)";
    target.style.boxShadow = "0 0 5px rgba(0, 255, 65, 0.2)";
    target.style.backgroundColor = "rgba(7, 39, 7, 0.7)";
    target.style.color = "var(--m-text)";
    
    const topLine = target.querySelector('.btn-top-line') as HTMLDivElement;
    const bottomLine = target.querySelector('.btn-bottom-line') as HTMLDivElement;
    
    if (topLine) topLine.style.transform = "scaleX(0)";
    if (bottomLine) bottomLine.style.transform = "scaleX(0)";
  };

  const handleButtonMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateY(1px)";
  };

  const handlePrimaryButtonMouseUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateY(-3px)";
  };

  const handleSecondaryButtonMouseUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translateY(-3px)";
  };

  return (
    <section className={cn('relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden', className)}>
      {/* Digital Rain Canvas */}
      {!disableRainEffect && (
        <canvas 
          ref={rainCanvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full -z-10",
            isCanvasReady ? "opacity-100" : "opacity-0",
            "transition-opacity duration-1000"
          )}
        />
      )}
      
      {/* Hero Content with enhanced visibility */}
      <div className="relative z-2 text-center px-5 max-w-4xl">
        <div className="inline-block relative mb-8">
          <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold tracking-[6px] text-shadow-[0_0_20px_var(--m-glow),0_0_40px_var(--m-glow)] mb-2 uppercase animate-[pulse_3s_infinite]">
            <GlitchText text={title} />
          </h1>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--m-text)] to-transparent my-5 animate-[expand_2s_ease]"></div>
        </div>
        
        {/* Semi-transparent background to make text more readable */}
        <p className="text-[clamp(1rem,2vw,1.5rem)] max-w-3xl mx-auto mb-12 leading-relaxed text-shadow-[0_0_10px_var(--m-glow)] bg-[rgba(0,0,0,0.7)] p-5 rounded border border-[var(--m-border)]">
          {subtitle}
        </p>
        
        {/* Button container */}
        <div className="flex gap-6 justify-center mt-8 flex-wrap">
          <a 
            href={primaryCta.href} 
            className="m-btn-primary relative overflow-hidden inline-flex items-center justify-center px-8 py-3 min-w-[180px] text-[var(--m-black)] bg-gradient-to-b from-[rgba(0,255,65,0.7)] to-[rgba(0,150,30,0.7)] border border-[var(--m-text)] rounded-[var(--m-radius)] font-bold text-xl uppercase tracking-wider shadow-[0_0_10px_var(--m-glow)] transition-all duration-250"
            onMouseEnter={handlePrimaryButtonMouseEnter}
            onMouseLeave={handlePrimaryButtonMouseLeave}
            onMouseDown={handleButtonMouseDown}
            onMouseUp={handlePrimaryButtonMouseUp}
          >
            <span className="relative z-2">{primaryCta.text}</span>
          </a>
          
          <a 
            href={secondaryCta.href} 
            className="m-btn-secondary relative overflow-hidden inline-flex items-center justify-center px-8 py-3 min-w-[180px] text-[var(--m-text)] bg-[rgba(7,39,7,0.7)] border border-[var(--m-border)] rounded-[var(--m-radius)] font-bold text-xl uppercase tracking-wider shadow-[0_0_5px_rgba(0,255,65,0.2)] transition-all duration-250"
            onMouseEnter={handleSecondaryButtonMouseEnter}
            onMouseLeave={handleSecondaryButtonMouseLeave}
            onMouseDown={handleButtonMouseDown}
            onMouseUp={handleSecondaryButtonMouseUp}
          >
            <span className="relative z-2">{secondaryCta.text}</span>
          </a>
        </div>
        
        {/* Version badge */}
        {showVersion && (
          <div className="mt-12 opacity-80 text-[0.9rem]">
            <span className="py-[0.3rem] px-[0.8rem] text-[0.9rem] tracking-[1px] border border-[var(--m-border)] rounded bg-[rgba(0,0,0,0.3)]">
              {version}
            </span>
          </div>
        )}
      </div>
      
      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="absolute bottom-[2rem] left-1/2 transform -translate-x-1/2 animate-[bounce_2s_infinite] cursor-pointer">
          <a href="#features" className="text-[var(--m-text)] flex flex-col items-center no-underline">
            <span className="text-[0.8rem] block mb-2 uppercase tracking-[2px]">
              Scroll Down
            </span>
            <span className="block transform rotate-45 w-[15px] h-[15px] border-r-2 border-b-2 border-[var(--m-text)]"></span>
          </a>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; text-shadow: 0 0 20px var(--m-glow); }
          50% { opacity: 1; text-shadow: 0 0 30px var(--m-glow), 0 0 40px var(--m-glow); }
        }
        
        @keyframes expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-15px) translateX(-50%); }
          60% { transform: translateY(-10px) translateX(-50%); }
        }
        
        a.m-btn-primary::after, a.m-btn-secondary::after {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default MatrixHero;