import NoteItem from './NoteItem';
import { Search, Loader2 } from 'lucide-react';

const NoteList = ({ 
  notes, 
  loading, 
  error, 
  searchQuery, 
  setSearchQuery, 
  selectedNoteId, 
  onSelectNote,
  isMobile,
  showEditorMobile,
  searchInputRef
}) => {
  const hiddenOnMobile = isMobile && showEditorMobile ? 'mobile-hidden' : '';

  return (
    <div className={`note-list-container ${hiddenOnMobile}`}>
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            ref={searchInputRef}
            className="search-input"
            placeholder="search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
      </div>

      <div className="notes-list">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', color: 'var(--error)', textAlign: 'center', fontSize: '0.9rem' }}>
            [ ERROR ]<br/>{error}
          </div>
        ) : notes.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>
            {searchQuery ? '> NO MATCHES' : '> EMPTY DIRECTORY'}
          </div>
        ) : (
          notes.map(note => (
            <NoteItem 
              key={note._id} 
              note={note} 
              isSelected={selectedNoteId === note._id}
              onClick={() => onSelectNote(note)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;
