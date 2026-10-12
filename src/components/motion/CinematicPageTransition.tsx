'use client';

import React, { useState, useEffect } from 'react';
import { isReducedMotionPreferred } from '../../utils/motion';

interface CinematicPageTransitionProps {
  activeTab: string;
  children: React.ReactNode;
}

/**
 * CinematicPageTransition Component
 * Provides a fluid, hardware-accelerated transition between tabs/pages,
 * accompanied by the signature Wasl Islamic Emerald Light Sweep along the top border.
 */
export const CinematicPageTransition: React.FC<CinematicPageTransitionProps> = ({
  activeTab,
  children
}) => {
  const [isSweeping, setIsSweeping] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Avoid running sweep on the very first SSR mount
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    if (isReducedMotionPreferred()) return;

    setIsSweeping(true);
    const timer = setTimeout(() => {
      setIsSweeping(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [activeTab, isInitialMount]);

  return (
    <>
      {/* Signature Emerald & Gold Light Sweep (Only on tab transition) */}
      {isSweeping && (
        <div className="wasl-signature-sweep-container" aria-hidden="true">
          <div className="wasl-signature-sweep-bar" />
        </div>
      )}

      {/* Main Container with hardware-accelerated entrance */}
      <div
        key={activeTab}
        id={`tab-content-${activeTab}`}
        role="region"
        aria-live="polite"
        className="wasl-page-transition w-full min-h-[60vh]"
      >
        {children}
      </div>
    </>
  );
};
