'use client';

import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  className?: string;
}

export default function Logo({ size = 'md', subtitle, className = '' }: LogoProps) {
  const animationContainer = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<AnimationItem | null>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-10 h-10 sm:w-12 sm:h-12 -ml-2',
      text: 'text-xl sm:text-2xl',
      subtitle: 'text-xs sm:text-sm',
    },
    md: {
      container: 'w-12 h-12 sm:w-16 sm:h-16 -ml-2',
      text: 'text-2xl sm:text-3xl',
      subtitle: 'text-sm sm:text-base',
    },
    lg: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 -ml-3',
      text: 'text-3xl sm:text-4xl',
      subtitle: 'text-base sm:text-lg',
    },
    xl: {
      container: 'w-24 h-24 sm:w-28 sm:h-28 -ml-3',
      text: 'text-4xl sm:text-5xl',
      subtitle: 'text-lg sm:text-xl',
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (animationContainer.current && !animationInstance.current) {
      animationInstance.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/diamond.json',
      });
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.destroy();
        animationInstance.current = null;
      }
    };
  }, []);

  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center mb-2">
        <span className={`${config.text} font-bold text-gray-900`}>AuramX</span>
        <div ref={animationContainer} className={config.container} />
      </div>
      {subtitle && (
        <p className={`${config.subtitle} text-gray-600`}>{subtitle}</p>
      )}
    </div>
  );
}
