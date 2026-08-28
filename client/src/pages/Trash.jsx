import { useState, useEffect } from 'react';
import { notesApi } from '../api/notesApi';
import Sidebar from '../components/Dashboard/Sidebar';
import Modal from '../components/ui/Modal';
import { Loader2, RotateCcw, X, FileText } from 'lucide-react';
import '../index.css';

const Trash = () => {
  const [trashNotes, setTrashNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getTrash();
      setTrashNotes(data.notes || []);
    } catch (err) {
      setError('Unable to load recently deleted notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await notesApi.restore(id);
      setTrashNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert('Unable to restore this note.');
    }
  };

  const initiatePermanentDelete = (id) => {
    setNoteToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!noteToDelete) return;
    try {
      await notesApi.permanentDelete(noteToDelete);
      setTrashNotes(prev => prev.filter(n => n._id !== noteToDelete));
    } catch (err) {
      alert('Unable to permanently delete this note.');
    } finally {
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar isMobile={isMobile} showEditorMobile={false} />
      
      <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', margin: 0 }}>RECENTLY DELETED</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--orange-main)' }} />
              <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-pixel)' }}>LOADING TRASH...</span>
            </div>
          ) : error ? (
            <div className="ui-error-message">{error}</div>
          ) : trashNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', marginBottom: '1rem' }}>TRASH EMPTY</div>
              <div>Nothing has been deleted recently.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {trashNotes.map(note => (
                <div key={note._id} style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border-main)', 
                  borderRadius: '4px', 
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <FileText size={16} style={{ color: 'var(--orange-main)', marginRight: '0.5rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                    {note.content ? (note.content.substring(0, 60) + (note.content.length > 60 ? '...' : '')) : 'No content'}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontFamily: 'var(--font-pixel)' }}>
                    Deleted: {new Date(note.deletedAt).toLocaleDateString()}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleRestore(note._id)}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '0.5rem', 
                        background: 'transparent', 
                        border: '1px solid var(--orange-main)', 
                        color: 'var(--orange-main)', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <RotateCcw size={14} style={{ marginRight: '0.5rem' }} /> RESTORE
                    </button>
                    <button 
                      onClick={() => initiatePermanentDelete(note._id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '0.5rem', 
                        background: 'transparent', 
                        border: '1px solid #ff4d4d', 
                        color: '#ff4d4d', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-pixel)'
                      }}
                      title="Permanent Delete"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        title="PERMANENTLY DELETE?"
        message="This note cannot be recovered after permanent deletion."
        confirmText="DELETE FOREVER"
        danger={true}
      />
    </div>
  );
};

export default Trash;
