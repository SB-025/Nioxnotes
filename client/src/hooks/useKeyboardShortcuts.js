import { useEffect } from 'react';

// Safely detect if the platform is macOS
export const isMacOs = () => {
  if (typeof navigator === 'undefined') return false;
  // Use userAgentData if available, fallback to deprecated platform string
  if (navigator.userAgentData) {
    return navigator.userAgentData.platform.toLowerCase().includes('mac');
  }
  return navigator.platform.toLowerCase().includes('mac');
};

export const getPrimaryModifierKey = () => {
  return isMacOs() ? 'metaKey' : 'ctrlKey';
};

/**
 * Custom hook for registering keyboard shortcuts.
 * 
 * @param {Array} shortcutHandlers - Array of objects: { shortcut: Object (from SHORTCUTS), handler: Function, preventDefault: boolean, preventIfInputFocus: boolean }
 * @param {boolean} isActive - Whether the shortcuts in this hook should currently be active
 */
export const useKeyboardShortcuts = (shortcutHandlers, isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Helper to check if an input is currently focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.isContentEditable
      );

      for (const { shortcut, handler, preventDefault = true, preventIfInputFocus = false } of shortcutHandlers) {
        // If this shortcut shouldn't fire while typing in an input, skip it
        if (preventIfInputFocus && isInputFocused) {
          continue;
        }

        // Check key match (case-insensitive for letters)
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        
        // Check modifiers
        let modifiersMatch = false;
        
        if (shortcut.modifier === 'none') {
          modifiersMatch = !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
        } else if (shortcut.modifier === 'primary') {
          const primaryKey = getPrimaryModifierKey();
          modifiersMatch = e[primaryKey] && !e.shiftKey && !e.altKey;
        } else if (shortcut.modifier === 'primary+shift') {
          const primaryKey = getPrimaryModifierKey();
          modifiersMatch = e[primaryKey] && e.shiftKey && !e.altKey;
        }

        if (keyMatch && modifiersMatch) {
          if (preventDefault) {
            e.preventDefault();
          }
          handler(e);
          // If we matched a shortcut, we generally don't want to process others for the same keypress
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcutHandlers, isActive]);
};
