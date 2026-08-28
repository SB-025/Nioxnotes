import React from 'react';
import { isMacOs } from '../../hooks/useKeyboardShortcuts';
import '../../index.css';

const ShortcutKeycap = ({ children }) => {
  return (
    <kbd className="shortcut-keycap">
      {children}
    </kbd>
  );
};

export const ShortcutDisplay = ({ shortcut }) => {
  const isMac = isMacOs();
  
  let modifierKeycap = null;
  if (shortcut.modifier === 'primary') {
    modifierKeycap = isMac ? '⌘' : 'Ctrl';
  } else if (shortcut.modifier === 'primary+shift') {
    modifierKeycap = (
      <>
        <ShortcutKeycap>{isMac ? '⌘' : 'Ctrl'}</ShortcutKeycap>
        <span className="shortcut-plus">+</span>
        <ShortcutKeycap>{isMac ? '⇧' : 'Shift'}</ShortcutKeycap>
      </>
    );
  }

  const keyDisplay = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;

  return (
    <div className="shortcut-display">
      {modifierKeycap && (
        <>
          {typeof modifierKeycap === 'string' ? (
            <ShortcutKeycap>{modifierKeycap}</ShortcutKeycap>
          ) : (
            modifierKeycap
          )}
          <span className="shortcut-plus">+</span>
        </>
      )}
      <ShortcutKeycap>{keyDisplay}</ShortcutKeycap>
    </div>
  );
};

export default ShortcutKeycap;
