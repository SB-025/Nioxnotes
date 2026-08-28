import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import Sidebar from '../components/Dashboard/Sidebar';
import { Loader2, User, Menu } from 'lucide-react';
import { countryCodes } from '../utils/countryCodes';
import '../index.css';

const Profile = () => {
  const { user: contextUser, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', location: '', age: '', countryCode: '+1', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authApi.me();
        setProfileData(data.user);
        
        // Parse existing phone if it has a country code
        let initialCountryCode = '+1';
        let initialPhone = '';
        if (data.user.phone) {
          const parts = data.user.phone.split(' ');
          if (parts.length > 1 && parts[0].startsWith('+')) {
            initialCountryCode = parts[0];
            initialPhone = parts.slice(1).join('');
          } else {
            initialPhone = data.user.phone;
          }
        }
        
        setEditForm({
          displayName: data.user.displayName || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          age: data.user.age !== undefined && data.user.age !== null ? data.user.age : '',
          countryCode: initialCountryCode,
          phone: initialPhone
        });
      } catch (err) {
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const getAuthProvider = () => {
    if (!profileData) return '—';
    if (profileData.googleId && profileData.passwordHash === undefined) return 'Google';
    if (profileData.googleId) return 'Google / Email & Password';
    return 'Email & Password';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    if (!editForm.displayName || editForm.displayName.trim().length < 2) {
      setSaveError('Please enter a valid display name (min 2 characters).');
      return;
    }
    try {
      setSaving(true);
      const fullPhone = editForm.phone.trim() ? `${editForm.countryCode} ${editForm.phone.trim()}` : '';
      const payload = { ...editForm, phone: fullPhone };
      await updateProfile(payload);
      const data = await authApi.me();
      setProfileData(data.user);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Mobile App Header for Profile */}
      {isMobile && (
        <div className="mobile-app-header">
          <button className="icon-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="sidebar-logo">
            NNS<span>_</span>
          </div>
          <div style={{ width: 40 }} /> {/* Spacer */}
        </div>
      )}

      <Sidebar 
        isMobile={isMobile} 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', margin: 0 }}>PROFILE</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--orange-main)' }} />
              <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-pixel)' }}>LOADING PROFILE...</span>
            </div>
          ) : error ? (
            <div className="ui-error-message">{error}</div>
          ) : profileData ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* Avatar Section */}
              <div style={{ 
                background: 'var(--surface)', 
                border: '1px solid var(--border-main)', 
                borderRadius: '8px', 
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--border-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontFamily: 'var(--font-pixel)',
                  color: 'var(--orange-main)',
                  marginBottom: '1rem'
                }}>
                  {profileData.email.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {profileData.displayName || profileData.email}
                </div>
              </div>

              {/* Details Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', margin: 0, color: 'var(--text-secondary)' }}>ACCOUNT</h3>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--orange-main)',
                      color: 'var(--orange-main)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    EDIT PROFILE
                  </button>
                )}
              </div>
              
              {saveError && <div className="ui-error-message" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{saveError}</div>}

              {isEditing ? (
                <form onSubmit={handleSave} style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border-main)', 
                  borderRadius: '8px', 
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div className="ui-input-group">
                    <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DISPLAY NAME</label>
                    <input type="text" value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="ui-input" maxLength={50} required />
                  </div>
                  <div className="ui-input-group">
                    <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BIO</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="ui-input" maxLength={160} rows={3} style={{ resize: 'none' }} />
                  </div>
                  <div className="ui-input-group">
                    <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LOCATION</label>
                    <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="ui-input" maxLength={100} />
                  </div>
                  <div className="profile-form-row">
                    <div className="ui-input-group" style={{ flex: 1, minWidth: '80px' }}>
                      <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AGE</label>
                      <input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="ui-input" min="0" max="120" />
                    </div>
                    <div className="ui-input-group" style={{ flex: 2, minWidth: '200px' }}>
                      <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PHONE</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                          className="ui-input" 
                          style={{ width: '35%', paddingRight: '2rem' }}
                          value={editForm.countryCode}
                          onChange={(e) => setEditForm({...editForm, countryCode: e.target.value})}
                        >
                          {countryCodes.map((c) => (
                            <option key={c.country + c.code} value={c.code}>
                              {c.code} ({c.country})
                            </option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={editForm.phone} 
                          onChange={e => setEditForm({...editForm, phone: e.target.value.replace(/\D/g, '')})} 
                          className="ui-input" 
                          maxLength={15}
                          style={{ width: '65%' }}
                          placeholder="5550198"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="profile-form-row" style={{ marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsEditing(false)} className="ui-button ui-button--secondary" style={{ flex: 1, minWidth: '140px' }} disabled={saving}>CANCEL</button>
                    <button type="submit" className="ui-button ui-button--primary" style={{ flex: 1, minWidth: '140px' }} disabled={saving}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
                  </div>
                </form>
              ) : (
                <div style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border-main)', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  marginBottom: '2rem'
                }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Display Name</div>
                    <div>{profileData.displayName || '—'}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Bio</div>
                    <div>{profileData.bio || '—'}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Location</div>
                    <div>{profileData.location || '—'}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Age</div>
                    <div>{profileData.age !== undefined && profileData.age !== null ? profileData.age : '—'}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Phone</div>
                    <div>{profileData.phone || '—'}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Email</div>
                    <div>{profileData.email}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Authentication</div>
                    <div>{getAuthProvider()}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-pixel)' }}>Created</div>
                    <div>{profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              )}

              {/* Statistics Section */}
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>STATISTICS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-pixel)', color: 'var(--orange-main)', marginBottom: '0.5rem' }}>
                    {profileData.stats?.totalNotes ?? '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL NOTES</div>
                </div>
                
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-pixel)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {profileData.stats?.pinnedNotes ?? '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PINNED</div>
                </div>
                
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-pixel)', color: '#ff4d4d', marginBottom: '0.5rem' }}>
                    {profileData.stats?.deletedNotes ?? '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RECENTLY DELETED</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Profile;
