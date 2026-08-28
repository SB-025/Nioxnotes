import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, FileText, Trash2, User, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ onCreateNote, isMobile, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const drawerClass = isMobile ? (isOpen ? 'drawer-open' : 'drawer-closed') : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        if (isMobile && onClose) onClose();
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu]);

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  return (
    <>
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <div className={`sidebar ${drawerClass}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sidebar-logo" onClick={() => handleNavClick('/notes')} style={{ cursor: 'pointer' }}>
              NNS<span>_</span>
            </div>
            {isMobile && (
              <button className="icon-btn" onClick={onClose} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            )}
          </div>
        {onCreateNote && (
          <button className="new-note-btn" onClick={onCreateNote} title="New Note" aria-label="Create new note">
            <Plus size={18} /> NEW NOTE
          </button>
        )}
      </div>

      <div className="sidebar-nav">
        <div 
          className="nav-item" 
          style={{ 
            color: location.pathname === '/notes' ? 'var(--text-primary)' : 'var(--text-secondary)', 
            background: location.pathname === '/notes' ? 'var(--surface)' : 'transparent' 
          }}
          onClick={() => handleNavClick('/notes')}
        >
          <FileText size={18} /> All Notes
        </div>
        <div 
          className="nav-item" 
          style={{ 
            color: location.pathname === '/notes/trash' ? 'var(--text-primary)' : 'var(--text-secondary)', 
            background: location.pathname === '/notes/trash' ? 'var(--surface)' : 'transparent' 
          }}
          onClick={() => handleNavClick('/notes/trash')}
        >
          <Trash2 size={18} /> Recently Deleted
        </div>
      </div>

      <div className="sidebar-footer" ref={menuRef} style={{ position: 'relative' }}>
        {showMenu && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            width: '100%',
            marginBottom: '0.5rem',
            background: 'var(--surface)',
            border: '1px solid var(--border-main)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
            padding: '0.5rem 0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button 
              className="nav-item" 
              style={{ background: 'transparent', width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '0.5rem 1rem' }}
              onClick={() => { setShowMenu(false); handleNavClick('/profile'); }}
            >
              <User size={16} style={{ marginRight: '0.5rem' }} /> PROFILE
            </button>
            <div style={{ height: '1px', background: 'var(--border-main)', margin: '0.25rem 0' }}></div>
            <button 
              className="nav-item" 
              style={{ background: 'transparent', width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '0.5rem 1rem', color: '#ff4d4d' }}
              onClick={() => { setShowMenu(false); logout(); }}
            >
              <LogOut size={16} style={{ marginRight: '0.5rem' }} /> LOG OUT
            </button>
          </div>
        )}
        <div 
          className="user-info" 
          onClick={() => setShowMenu(!showMenu)} 
          style={{ cursor: 'pointer', flex: 1, padding: '0.5rem', borderRadius: '4px', background: showMenu ? 'var(--surface)' : 'transparent', transition: 'background 0.2s' }}
        >
          <div className="user-avatar">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="user-email">
            {user?.email}
          </span>
        </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
