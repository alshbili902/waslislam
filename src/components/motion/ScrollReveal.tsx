'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isReducedMotionPreferred } from '../../utils/motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'up' | 'scale';
  delayMs?: number;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
}

/**
 * ScrollReveal Component
 * Efficiently reveals sections or card groups as they scroll into view.
 * Uses a single-shot IntersectionObserver to prevent memory leaks and unnecessary rerenders.
 * Automatically bypasses animation if reduced motion is requested.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'up',
  delayMs = 0,
  threshold = 0.12,
  className = '',
  as: Component = 'div'
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // If reduced motion is preferred, reveal immediately without animation
    if (isReducedMotionPreferred()) {
      setIsRevealed(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              const timer = setTimeout(() => {
                setIsRevealed(true);
              }, delayMs);
              observer.unobserve(entry.target);
              return () => clearTimeout(timer);
            } else {
              setIsRevealed(true);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px' // Trigger slightly before element reaches bottom
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [delayMs, threshold]);

  const baseClass = variant === 'scale' ? 'wasl-scroll-reveal-scale' : 'wasl-scroll-reveal';
  const revealedClass = isRevealed ? 'is-revealed' : '';

  return (
    <Component
      ref={elementRef}
      className={`${baseClass} ${revealedClass} ${className}`}
      style={delayMs > 0 && !isRevealed ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Component>
  );
};
