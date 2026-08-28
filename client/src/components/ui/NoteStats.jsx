import React from 'react';
import { calculateNoteStats } from '../../utils/textStats';
import '../../index.css';

const NoteStats = ({ content }) => {
  const { words, characters } = calculateNoteStats(content);
  
  return (
    <div className="note-stats">
      <span className="stat-item">{words.toLocaleString()} WORD{words !== 1 ? 'S' : ''}</span>
      <span className="stat-separator">•</span>
      <span className="stat-item">{characters.toLocaleString()} CHARACTER{characters !== 1 ? 'S' : ''}</span>
    </div>
  );
};

export default NoteStats;
