import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (password.length < 8) {
      setError('PASSWORD TOO SHORT (MIN 8)');
      return false;
    }
    if (password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password);
      navigate('/notes', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-form-container">
        <div className="auth-header animate-fade-in">
          <div className="auth-brand">
            NNS<span className="auth-brand-accent">_</span>
          </div>
          <p className="auth-subtitle">Initialize User</p>
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <form onSubmit={handleSubmit}>
            <Input 
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="user@system.com"
              required
              autoComplete="email"
            />
            
            <Input 
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
            
            <Input 
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Must match password"
              required
              autoComplete="new-password"
              error={confirmPassword && password !== confirmPassword ? 'PASSWORDS DO NOT MATCH' : ''}
            />
            
            {error && (
              <div className="ui-error-message" style={{ marginBottom: '1.5rem' }}>
                [ ERROR: {error} ]
              </div>
            )}
            
            <div style={{ marginTop: '2.5rem' }}>
              <Button type="submit" loading={loading} style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
                CREATE ACCOUNT
              </Button>
            </div>
          </form>
          
          <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: '1px', background: 'var(--border-main)', flex: 1 }}></div>
            <span style={{ margin: '0 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', fontSize: '1rem', letterSpacing: '2px' }}>OR</span>
            <div style={{ height: '1px', background: 'var(--border-main)', flex: 1 }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true);
                  setError('');
                  await loginWithGoogle(credentialResponse.credential);
                  navigate('/notes', { replace: true });
                } catch (err) {
                  setError(err.message || 'Google sign-up failed');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setError('Google sign-up was cancelled or failed.');
              }}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--orange-main)', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
