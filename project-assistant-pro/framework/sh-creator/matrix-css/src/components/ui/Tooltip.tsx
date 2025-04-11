import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone the child element and add event handlers
  const childWithProps = React.cloneElement(children, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  });

  // Positioning classes
  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+5px)]',
    right: 'translate-y-[-50%] translate-x-[5px] top-1/2 left-full',
    bottom: '-translate-x-1/2 translate-y-[5px] left-1/2 top-full',
    left: 'translate-y-[-50%] -translate-x-full top-1/2 right-[calc(100%+5px)]',
  };

  // Arrow positioning classes
  const arrowClasses = {
    top: 'left-1/2 -translate-x-1/2 bottom-full border-t-[5px] border-l-[5px] border-r-[5px] border-b-0 border-transparent border-t-matrix-panel',
    right: 'top-1/2 -translate-y-1/2 left-full border-r-[5px] border-t-[5px] border-b-[5px] border-l-0 border-transparent border-r-matrix-panel',
    bottom: 'left-1/2 -translate-x-1/2 top-full border-b-[5px] border-l-[5px] border-r-[5px] border-t-0 border-transparent border-b-matrix-panel',
    left: 'top-1/2 -translate-y-1/2 right-full border-l-[5px] border-t-[5px] border-b-[5px] border-r-0 border-transparent border-l-matrix-panel',
  };

  return (
    <div className="relative inline-block">
      {childWithProps}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 w-max max-w-xs px-2 py-1 text-sm rounded bg-matrix-panel text-matrix-text border border-matrix-border pointer-events-none',
            'opacity-0 animate-[fade-in_0.15s_ease-in-out_forwards]',
            positionClasses[position],
            className
          )}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 pointer-events-none',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

