import { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, ArrowLeft, Pin, PinOff, FileText, ImagePlus, Keyboard, Share2 } from 'lucide-react';
import ImageGallery from './ImageGallery';
import NoteStats from '../ui/NoteStats';
import ShareModal from './ShareModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAutosave } from '../../hooks/useAutosave';
import { SHORTCUTS } from '../../config/shortcuts';

const Editor = ({ 
  note, 
  onUpdate, 
  onLocalUpdate,
  onDelete, 
  isMobile, 
  onBack, 
  onCreateNote,
  onUploadImage,
  onRemoveImage,
  onOpenShortcuts
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const fileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [initializedNoteId, setInitializedNoteId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

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
    
    // Clean up any old abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    await onUpdate(note._id, { title: currentTitle, content: currentContent }, { signal: abortController.signal });
  }, [note, onUpdate]);

  const { saveStatus, handleEdit, triggerManualSave } = useAutosave({
    initialContent: note?.content || '',
    initialTitle: note?.title || '',
    onSave: handleSaveAction,
    debounceMs: 1200
  });

  const handleTogglePin = async () => {
    try {
      await onUpdate(note._id, { title, content, isPinned: !note.isPinned });
    } catch (err) {
      console.error(err);
    }
  };

  // Cleanup abort controller on unmount
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
    
    // Toggle logic: if text is already wrapped, unwrap it
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);

    let newContent;
    let newCursorPos;

    if (beforeSelection.endsWith(prefix) && afterSelection.startsWith(suffix)) {
      // Unwrap
      newContent = beforeSelection.slice(0, -prefix.length) + selectedText + afterSelection.slice(suffix.length);
      newCursorPos = start - prefix.length + selectedText.length;
    } else {
      // Wrap
      newContent = beforeSelection + prefix + selectedText + suffix + afterSelection;
      newCursorPos = start + prefix.length + selectedText.length;
    }

    setContent(newContent);
    handleEdit(title, newContent);
    
    // Maintain focus and set cursor
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
      preventIfInputFocus: false // We want save to work when typing in title/content
    },
    {
      shortcut: SHORTCUTS.TOGGLE_PIN,
      handler: () => {
        handleTogglePin();
      },
      preventIfInputFocus: false // Can toggle pin while focused
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
  ], !!note); // Only active if a note is selected

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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10 MB.'); // Simple fallback, or use toast if available
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      await onUploadImage(note._id, formData);
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleShareStatusChange = (statusUpdates) => {
    // Notify parent component about update locally
    if (onLocalUpdate) {
      onLocalUpdate(note._id, statusUpdates);
    }
  };

  if (!note) {
    return (
      <div className="editor-container empty-editor">
        <div className="empty-state-content">
          <div className="empty-state-icon-wrapper">
            <FileText size={28} className="empty-state-icon" />
          </div>
          <p className="empty-state-title">NO NOTE SELECTED</p>
          <p className="empty-state-subtitle">Select a note to start writing<br/>or create a new note.</p>
          {onCreateNote && (
            <button className="empty-state-action-btn" onClick={onCreateNote}>
              + NEW NOTE
            </button>
          )}
        </div>
        <div className="empty-editor-header">
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
    );
  }

  return (
    <div className="editor-container">
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
            {isUploading && <span className="status-saving">UPLOADING...</span>}
            {!isUploading && saveStatus === 'dirty' && <span className="status-dirty">CHANGES UNSAVED</span>}
            {!isUploading && saveStatus === 'saving' && <span className="status-saving"><span className="pulse-dot"></span> SAVING...</span>}
            {!isUploading && saveStatus === 'saved' && <span className="status-saved"><span className="saved-dot"></span> SAVED</span>}
            {!isUploading && saveStatus === 'error' && <button className="status-error" onClick={triggerManualSave} aria-label="Retry Save" title="Click to retry">⚠ SAVE FAILED</button>}
          </div>
          
          <button 
            className="icon-btn" 
            onClick={onOpenShortcuts} 
            title="Keyboard Shortcuts"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={18} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/jpeg, image/png, image/webp, image/gif" 
            style={{ display: 'none' }} 
          />
          <button 
            className="icon-btn" 
            onClick={() => fileInputRef.current?.click()} 
            title="Add image"
            aria-label="Add image"
          >
            <ImagePlus size={18} />
          </button>
          <button 
            className={`icon-btn ${note.isPinned ? 'active' : ''}`} 
            onClick={handleTogglePin} 
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            aria-label={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            {note.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
          <button 
            className="icon-btn"
            onClick={() => setShowShareModal(true)}
            title="Share Note"
            aria-label="Share Note"
          >
            <Share2 size={18} />
          </button>
          <button 
            className="icon-btn icon-btn--danger" 
            onClick={() => onDelete(note._id)} 
            title="Delete Note"
            aria-label="Delete Note"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="editor-body">
        <ImageGallery 
          attachments={note.attachments} 
          onRemoveImage={(attachmentId) => onRemoveImage(note._id, attachmentId)} 
        />
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

      {showShareModal && (
        <ShareModal 
          note={note} 
          onClose={() => setShowShareModal(false)} 
          onShareStatusChange={handleShareStatusChange}
        />
      )}
    </div>
  );
};

export default Editor;
