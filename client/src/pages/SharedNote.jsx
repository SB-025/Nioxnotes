import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shareApi } from '../api/shareApi';
import ImageGallery from '../components/Dashboard/ImageGallery';
import NoteStats from '../components/ui/NoteStats';
import { Loader2 } from 'lucide-react';

const SharedNote = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setLoading(true);
        const data = await shareApi.getSharedNote(token);
        setNote(data.note);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedNote();
  }, [token]);

  if (loading) {
    return (
      <div className="shared-note-loading">
        <Loader2 size={32} className="animate-spin" />
        <p>LOADING NOTE...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="shared-note-error">
        <div className="empty-state-content">
          <p className="empty-state-title" style={{ color: '#ff4a4a' }}>SHARED NOTE UNAVAILABLE</p>
          <p className="empty-state-subtitle" style={{ maxWidth: '400px' }}>
            This note may have been made private or the link may no longer be valid.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            BACK TO NNS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-note-container">
      <header className="shared-note-header">
        <div className="shared-note-logo">
          <h1>NNS</h1>
          <span className="shared-badge">SHARED NOTE</span>
        </div>
        <Link to="/" className="shared-note-open-nns">OPEN NNS</Link>
      </header>

      <main className="shared-note-content">
        <h1 className="shared-note-title">{note.title || 'Untitled Note'}</h1>
        
        {note.attachments && note.attachments.length > 0 && (
          <div className="shared-note-gallery">
            <ImageGallery attachments={note.attachments} onRemoveImage={null} />
          </div>
        )}
        
        <div className="shared-note-body">
          {/* Note: since text is plain text or basic markdown, we render as pre-wrap */}
          {note.content}
        </div>
      </main>

      <footer className="shared-note-footer">
        <NoteStats content={note.content || ''} />
        <div className="shared-note-watermark">Shared via NNS</div>
      </footer>
    </div>
  );
};

export default SharedNote;
