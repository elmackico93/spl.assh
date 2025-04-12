import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import CodeRain from '@/components/effects/CodeRain';
import GlitchText from '@/components/effects/GlitchText';
import { Button } from '@/components/ui/Button';

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
}) => {
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize matrix rain animation
  useEffect(() => {
    if (!rainCanvasRef.current) return;

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
      ctx.font = `${fontSize}px courier`;
      
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
      
      requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className={cn('relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden', className)}>
      {/* Digital Rain Canvas (for a custom, higher-performance rain effect) */}
      <canvas 
        ref={rainCanvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />
      
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
        
        <div className="flex flex-wrap gap-6 justify-center mt-8">
          <Button 
            variant="primary" 
            size="lg" 
            hasGlow
            className="min-w-[180px] font-bold tracking-wide relative overflow-hidden"
            onClick={() => window.location.href = primaryCta.href}
          >
            <span className="relative z-2">{primaryCta.text}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="min-w-[180px] font-bold tracking-wide"
            onClick={() => window.location.href = secondaryCta.href}
          >
            {secondaryCta.text}
          </Button>
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
          <a href="#features" className="text-[var(--m-text)] flex flex-col items-center">
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
      `}</style>
    </section>
  );
};

export default MatrixHero;