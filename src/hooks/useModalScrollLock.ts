import React, { useEffect, useRef } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

export interface UseModalScrollLockOptions {
  onClose?: () => void;
  closeOnEsc?: boolean;
  modalRef?: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocus?: boolean;
}

/**
 * Custom hook to manage Modal Scroll Locking and Keyboard Accessibility.
 * 
 * @param isOpen Whether the modal is currently open
 * @param options Configuration options including close callback and escape key handling
 */
export function useModalScrollLock(
  isOpen: boolean,
  options: UseModalScrollLockOptions = {}
): void {
  const {
    onClose,
    closeOnEsc = true,
    modalRef,
    initialFocusRef,
    returnFocus = true,
  } = options;

  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Save currently focused element to return to after closing
    if (typeof document !== 'undefined' && returnFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
    }

    // 2. Lock body scroll with iOS position:fixed & scroll restoration
    lockBodyScroll();

    // 3. Set focus to initial element or modal container
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef?.current) {
        modalRef.current.focus();
      }
    }, 50);

    // 4. Handle Escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && onClose) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();

      // Return focus to previously active element
      if (returnFocus && previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        try {
          previousActiveElement.current.focus();
        } catch {}
      }
    };
  }, [isOpen, onClose, closeOnEsc, modalRef, initialFocusRef, returnFocus]);
}
