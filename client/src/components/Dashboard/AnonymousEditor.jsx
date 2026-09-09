import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard } from 'lucide-react';
import NoteStats from '../ui/NoteStats';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAutosave } from '../../hooks/useAutosave';
import { SHORTCUTS } from '../../config/shortcuts';

const AnonymousEditor = ({ 
  note, 
  onUpdate,
  onOpenShortcuts
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentTextareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  const [initializedNoteId, setInitializedNoteId] = useState(null);

  useEffect(() => {
    if (note) {
      if (note._id !== initializedNoteId) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setInitializedNoteId(note._id);
      }
    }
  }, [note, initializedNoteId]);

  const handleSaveAction = useCallback(async (currentTitle, currentContent) => {
    if (!note) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    await onUpdate({ title: currentTitle, content: currentContent, revision: note.revision }, { signal: abortController.signal });
  }, [note, onUpdate]);

  const { saveStatus, handleEdit, triggerManualSave } = useAutosave({
    initialContent: note?.content || '',
    initialTitle: note?.title || '',
    onSave: handleSaveAction,
    debounceMs: 1200
  });

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleFormatText = (prefix, suffix = prefix) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);

    let newContent;
    let newCursorPos;

    if (beforeSelection.endsWith(prefix) && afterSelection.startsWith(suffix)) {
      newContent = beforeSelection.slice(0, -prefix.length) + selectedText + afterSelection.slice(suffix.length);
      newCursorPos = start - prefix.length + selectedText.length;
    } else {
      newContent = beforeSelection + prefix + selectedText + suffix + afterSelection;
      newCursorPos = start + prefix.length + selectedText.length;
    }

    setContent(newContent);
    handleEdit(title, newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useKeyboardShortcuts([
    {
      shortcut: SHORTCUTS.SAVE,
      handler: () => {
        triggerManualSave();
      },
      preventIfInputFocus: false
    },
    {
      shortcut: SHORTCUTS.BOLD,
      handler: () => {
        if (document.activeElement === contentTextareaRef.current) {
          handleFormatText('**');
        }
      },
      preventIfInputFocus: false
    },
    {
      shortcut: SHORTCUTS.ITALIC,
      handler: () => {
        if (document.activeElement === contentTextareaRef.current) {
          handleFormatText('_');
        }
      },
      preventIfInputFocus: false
    }
  ], !!note);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleEdit(newTitle, content);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    handleEdit(title, newContent);
  };

  if (!note) return null;

  return (
    <div className="editor-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', height: '100%', border: 'none' }}>
      <div className="editor-header">
        <div className="editor-header-left">
          <input 
            type="text" 
            className="title-input" 
            value={title} 
            onChange={handleTitleChange} 
            placeholder="NOTE TITLE..."
          />
        </div>
        <div className="editor-actions">
          <div className="save-status">
            {saveStatus === 'dirty' && <span className="status-dirty">CHANGES UNSAVED</span>}
            {saveStatus === 'saving' && <span className="status-saving"><span className="pulse-dot"></span> SAVING...</span>}
            {saveStatus === 'saved' && <span className="status-saved"><span className="saved-dot"></span> SAVED</span>}
            {saveStatus === 'error' && <button className="status-error" onClick={triggerManualSave} aria-label="Retry Save" title="Click to retry">⚠ SAVE FAILED</button>}
          </div>
          
          <button 
            className="icon-btn" 
            onClick={onOpenShortcuts} 
            title="Keyboard Shortcuts"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={18} />
          </button>
        </div>
      </div>
      <div className="editor-body">
        <textarea 
          ref={contentTextareaRef}
          className="content-textarea" 
          value={content} 
          onChange={handleContentChange}
          placeholder="Start typing..."
        />
      </div>
      <div className="editor-footer">
        <NoteStats content={content} />
      </div>
    </div>
  );
};

export default AnonymousEditor;
