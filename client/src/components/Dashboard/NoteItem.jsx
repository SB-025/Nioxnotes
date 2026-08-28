

import { Pin } from 'lucide-react';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
};

const NoteItem = ({ note, isSelected, onClick }) => {
  const previewText = note.content 
    ? (note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content)
    : '';

  return (
    <div 
      className={`note-item ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      <div className="note-item-header">
        <h3 className="note-title">{note.title || 'UNTITLED'}</h3>
        {note.isPinned && <Pin size={14} className="pinned-icon" fill="currentColor" />}
      </div>
      <p className="note-preview">{previewText || <span style={{ opacity: 0.5 }}>NO ADDITIONAL TEXT</span>}</p>
      <span className="note-date">{formatTime(note.updatedAt)}</span>
    </div>
  );
};

export default NoteItem;
