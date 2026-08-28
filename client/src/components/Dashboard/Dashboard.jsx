import { useState, useEffect, useRef } from 'react';
import { notesApi } from '../../api/notesApi';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import Editor from './Editor';
import Modal from '../ui/Modal';
import ShortcutsPanel from '../ui/ShortcutsPanel';
import { Menu } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { SHORTCUTS } from '../../config/shortcuts';
import '../../index.css';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showEditorMobile, setShowEditorMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Shortcuts Panel state
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotes = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getAll(search);
      setNotes(data.notes || []);
      if (selectedNote && !(data.notes || []).find(n => n._id === selectedNote._id)) {
        setSelectedNote(null);
      }
    } catch (err) {
      setError('FAILED TO FETCH NOTES');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      shortcut: SHORTCUTS.NEW_NOTE,
      handler: () => {
        handleCreateNote();
      },
      preventIfInputFocus: true
    },
    {
      shortcut: SHORTCUTS.SEARCH,
      handler: () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      },
      preventIfInputFocus: false
    }
  ]);

  const handleCreateNote = async () => {
    try {
      const data = await notesApi.create({ title: 'New Note', content: '' });
      setNotes([data.note, ...notes]);
      setSelectedNote(data.note);
      if (isMobile) setShowEditorMobile(true);
    } catch (err) {
      console.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id, updatedFields, options = {}) => {
    try {
      const data = await notesApi.update(id, updatedFields, options);
      setNotes(prevNotes => 
        prevNotes.map(n => n._id === id ? data.note : n).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      );
      setSelectedNote(data.note);
    } catch (err) {
      if (err.name !== 'AbortError' && err.message !== 'The user aborted a request.') {
        throw err;
      }
    }
  };

  const handleLocalUpdateNote = (id, updates) => {
    setNotes(prevNotes => 
      prevNotes.map(n => n._id === id ? { ...n, ...updates } : n)
    );
    if (selectedNote && selectedNote._id === id) {
      setSelectedNote(prev => ({ ...prev, ...updates }));
    }
  };

  const handleUploadImage = async (noteId, formData) => {
    try {
      const data = await notesApi.uploadImage(noteId, formData);
      setNotes(prevNotes => prevNotes.map(n => {
        if (n._id === noteId) {
          const updatedNote = { ...n, attachments: [...(n.attachments || []), data.attachment] };
          if (selectedNote && selectedNote._id === noteId) {
            setSelectedNote(updatedNote);
          }
          return updatedNote;
        }
        return n;
      }));
    } catch (err) {
      throw err;
    }
  };

  const handleRemoveImage = async (noteId, attachmentId) => {
    try {
      const data = await notesApi.deleteImage(noteId, attachmentId);
      setNotes(prevNotes => prevNotes.map(n => {
        if (n._id === noteId) {
          if (selectedNote && selectedNote._id === noteId) {
            setSelectedNote(data.note);
          }
          return data.note;
        }
        return n;
      }));
    } catch (err) {
      throw err;
    }
  };

  const initiateDelete = (id) => {
    setNoteToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await notesApi.delete(noteToDelete);
      setNotes(prevNotes => prevNotes.filter(n => n._id !== noteToDelete));
      if (selectedNote?._id === noteToDelete) {
        setSelectedNote(null);
        if (isMobile) setShowEditorMobile(false);
      }
    } catch (err) {
      console.error('Failed to delete note');
    } finally {
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    if (isMobile) setShowEditorMobile(true);
  };

  const handleBackToList = () => {
    setShowEditorMobile(false);
  };

  const showSidebarAndList = !isMobile || !showEditorMobile;
  const showEditor = !isMobile || showEditorMobile;

  return (
    <div className="dashboard">
      {/* Mobile App Header */}
      {isMobile && !showEditorMobile && (
        <div className="mobile-app-header">
          <button className="icon-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="sidebar-logo">
            NNS<span>_</span>
          </div>
          <div style={{ width: 40 }} /> {/* Spacer to balance flex */}
        </div>
      )}

      {/* 3-Column Layout rendering */}
      <Sidebar 
        onCreateNote={handleCreateNote}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      
      {showSidebarAndList && (
        <NoteList 
            notes={notes}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedNoteId={selectedNote?._id}
            onSelectNote={handleSelectNote}
            isMobile={isMobile}
            showEditorMobile={showEditorMobile}
            searchInputRef={searchInputRef}
          />
      )}
      
      {showEditor && (
        <div className="editor-container">
          <Editor 
            note={selectedNote} 
            onUpdate={handleUpdateNote}
            onLocalUpdate={handleLocalUpdateNote}
            onDelete={initiateDelete}
            isMobile={isMobile}
            onBack={handleBackToList}
            onCreateNote={handleCreateNote}
            onUploadImage={handleUploadImage}
            onRemoveImage={handleRemoveImage}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        </div>
      )}

      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="DELETE NOTE?"
        message="This action cannot be undone. Area you sure you want to permanently delete this record?"
        confirmText="DELETE"
        danger={true}
      />

      <ShortcutsPanel 
        isOpen={shortcutsOpen} 
        onClose={() => setShortcutsOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
