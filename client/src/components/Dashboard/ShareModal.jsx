import React, { useState } from 'react';
import { X, Copy, Share2, Check, Loader2 } from 'lucide-react';
import { notesApi } from '../../api/notesApi';
import Button from '../ui/Button';

const ShareModal = ({ note, onClose, onShareStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = note?.shareToken ? `${window.location.origin}/share/${note.shareToken}` : '';

  const handleEnableShare = async () => {
    try {
      setLoading(true);
      const res = await notesApi.enableShare(note._id);
      onShareStatusChange({ isShared: true, shareToken: res.shareToken });
    } catch (err) {
      console.error(err);
      alert('Failed to enable sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableShare = async () => {
    const confirm = window.confirm('DISABLE SHARING?\n\nAnyone currently using this link will no longer be able to view this note.');
    if (!confirm) return;

    try {
      setLoading(true);
      await notesApi.disableShare(note._id);
      onShareStatusChange({ isShared: false, shareToken: null });
    } catch (err) {
      console.error(err);
      alert('Failed to disable sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('COPY FAILED');
    }
  };

  if (!note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2 className="modal-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} /> SHARE NOTE
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {!note.isShared ? (
            <div className="share-off-state">
              <p>Share this note with anyone who has the link.</p>
              <div className="share-status-badge off">SHARING OFF</div>
              
              <Button 
                variant="primary" 
                className="share-action-btn" 
                onClick={handleEnableShare}
                loading={loading}
              >
                ENABLE SHARING
              </Button>
            </div>
          ) : (
            <div className="share-on-state">
              <div className="share-status-badge on">SHARING ENABLED</div>
              <p>Anyone with this link can view this note.</p>
              
              <div className="share-link-box">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="share-link-input"
                  onClick={(e) => e.target.select()}
                />
              </div>
              
              <div className="share-actions-row">
                <Button 
                  variant="secondary"
                  className="share-copy-btn" 
                  onClick={handleCopyLink}
                  icon={copied ? Check : Copy}
                >
                  {copied ? 'LINK COPIED' : 'COPY LINK'}
                </Button>
                <Button 
                  variant="danger"
                  className="share-disable-btn" 
                  onClick={handleDisableShare}
                  loading={loading}
                >
                  DISABLE SHARING
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
