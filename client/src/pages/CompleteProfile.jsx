import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { countryCodes } from '../utils/countryCodes';
import '../index.css';

const CompleteProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName || displayName.trim().length < 2) {
      setError('Please enter a valid display name (min 2 characters).');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';
      await updateProfile({ displayName, bio, location, age, phone: fullPhone });
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="auth-form-container" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="auth-header animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="auth-brand">NNS<span className="auth-brand-accent">_</span></div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--orange-main)' }}>COMPLETE YOUR PROFILE</h2>
          <p className="auth-subtitle" style={{ fontSize: '0.9rem' }}>Let's set up your NNS profile.</p>
        </div>

        {error && <div className="ui-error-message" style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ui-input-group">
            <label className="ui-label" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)' }}>
              <span>DISPLAY NAME *</span>
            </label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ichigo"
              maxLength={50}
              required
              disabled={loading}
              className="ui-input"
            />
          </div>

          <div className="ui-input-group">
            <label className="ui-label" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)' }}>
              <span>BIO</span>
              <span style={{ color: bio.length > 160 ? 'var(--error)' : 'var(--text-muted)' }}>
                {bio.length} / 160
              </span>
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I build things and write notes."
              maxLength={160}
              rows={3}
              disabled={loading}
              className="ui-input"
              style={{ resize: 'none' }}
            />
          </div>

          <div className="ui-input-group">
            <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)' }}>LOCATION</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Karakura Town"
              maxLength={100}
              disabled={loading}
              className="ui-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="ui-input-group" style={{ flex: 1 }}>
              <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)' }}>AGE</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                min="0"
                max="120"
                disabled={loading}
                className="ui-input"
              />
            </div>
            
            <div className="ui-input-group" style={{ flex: 2 }}>
              <label className="ui-label" style={{ fontFamily: 'var(--font-pixel)' }}>PHONE</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="ui-input" 
                  style={{ width: '35%', paddingRight: '2rem' }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={loading}
                >
                  {countryCodes.map((c) => (
                    <option key={c.country + c.code} value={c.code}>
                      {c.code} ({c.country})
                    </option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5550198"
                  maxLength={15}
                  disabled={loading}
                  className="ui-input"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>

          <button  
            type="submit" 
            className="ui-button ui-button--primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> 
                SAVING...
              </>
            ) : 'CONTINUE TO NNS'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
