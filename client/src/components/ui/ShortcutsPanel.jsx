import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SHORTCUTS } from '../../config/shortcuts';
import { ShortcutDisplay } from './ShortcutKeycap';
import '../../index.css';

const ShortcutsPanel = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts
  const generalShortcuts = Object.values(SHORTCUTS).filter(s => s.group === 'GENERAL');
  const editorShortcuts = Object.values(SHORTCUTS).filter(s => s.group === 'EDITOR');

  return (
    <div className="shortcuts-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="shortcuts-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
      >
        <div className="shortcuts-header">
          <h2 id="shortcuts-title" className="shortcuts-title">KEYBOARD SHORTCUTS</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close shortcuts panel">
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-content">
          <div className="shortcuts-section">
            <h3 className="shortcuts-section-title">GENERAL</h3>
            <div className="shortcuts-list">
              {generalShortcuts.map(shortcut => (
                <div className="shortcut-row" key={shortcut.id}>
                  <span className="shortcut-label">{shortcut.label}</span>
                  <ShortcutDisplay shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>

          <div className="shortcuts-section">
            <h3 className="shortcuts-section-title">EDITOR</h3>
            <div className="shortcuts-list">
              {editorShortcuts.map(shortcut => (
                <div className="shortcut-row" key={shortcut.id}>
                  <span className="shortcut-label">{shortcut.label}</span>
                  <ShortcutDisplay shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsPanel;
