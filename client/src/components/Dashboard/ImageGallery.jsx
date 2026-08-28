import { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

const ImageGallery = ({ attachments, onRemoveImage }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxIndex !== null) {
        closeLightbox();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return (
    <div className="image-gallery-container">
      <div className="image-gallery-grid">
        {attachments.map((attachment, idx) => (
          <div key={attachment._id || idx} className="gallery-item-wrapper">
            <img 
              src={attachment.url} 
              alt={attachment.filename || 'Note attachment'} 
              className="gallery-image"
              onClick={() => openLightbox(idx)}
            />
            <button 
              className="gallery-remove-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(attachment._id);
              }}
              aria-label="Remove image"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn icon-btn" 
              onClick={closeLightbox}
              aria-label="Close image preview"
            >
              <X size={24} />
            </button>
            <img 
              src={attachments[lightboxIndex].url} 
              alt={attachments[lightboxIndex].filename || 'Expanded preview'} 
              className="lightbox-image" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
