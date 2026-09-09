import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { anonymousApi } from '../api/anonymous';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const AnonymousEntry = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateCode = (inputCode) => {
    const normalized = inputCode.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!normalized) return { valid: false, message: 'ENTER A CODE' };
    if (normalized.length < 3) return { valid: false, message: 'CODE MUST CONTAIN AT LEAST 3 CHARACTERS' };
    if (!/^[a-z0-9 _-]+$/.test(normalized)) return { valid: false, message: 'CODE CONTAINS INVALID CHARACTERS' };
    return { valid: true, normalized };
  };

  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    const { valid, message, normalized } = validateCode(code);
    if (!valid) {
      setError(message);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await anonymousApi.joinSpace(normalized);
      navigate('/anonymous/space', { replace: true });
    } catch (err) {
      if (err.status === 404) {
        setError('SPACE NOT FOUND');
      } else if (err.status === 429) {
        setError('TOO MANY ATTEMPTS, PLEASE TRY AGAIN LATER');
      } else {
        setError(err.data?.message || 'FAILED TO JOIN SPACE');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { valid, message, normalized } = validateCode(code);
    if (!valid) {
      setError(message);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await anonymousApi.createSpace(normalized);
      navigate('/anonymous/space', { replace: true });
    } catch (err) {
      if (err.status === 409) {
        setError('SPACE ALREADY EXISTS');
      } else if (err.status === 429) {
        setError('TOO MANY ATTEMPTS, PLEASE TRY AGAIN LATER');
      } else {
        setError(err.data?.message || 'FAILED TO CREATE SPACE');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-form-container" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="icon-btn" 
          style={{ position: 'absolute', top: '-40px', left: '-10px', color: 'var(--text-muted)' }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="auth-header animate-fade-in">
          <div className="auth-brand">
            NNS<span className="auth-brand-accent">_</span>
          </div>
          <p className="auth-subtitle" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>ANONYMOUS NOTES</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem', lineHeight: '1.5' }}>
            Enter a secret code to create or access<br/>a shared anonymous note space.
          </p>
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <form onSubmit={handleJoin}>
            <Input 
              label="SECRET CODE"
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. orange moon 27"
              required
              autoComplete="off"
            />
            
            {error && (
              <div className="ui-error-message" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                [ {error} ]
              </div>
            )}
            
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button type="submit" loading={loading} style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
                ENTER SPACE
              </Button>
              <Button type="button" onClick={handleCreate} loading={loading} variant="secondary" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                CREATE NEW SPACE
              </Button>
            </div>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-main)', paddingTop: '1rem' }}>
            Anyone with this code can access this space.<br/>Do not store sensitive information here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousEntry;
