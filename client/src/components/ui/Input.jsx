import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  id, 
  className = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`ui-input-group ${className}`}>
      {label && <label htmlFor={id} className="ui-label">{label}</label>}
      <div className="ui-input-wrapper">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`ui-input ${error ? 'ui-input--error' : ''} ${isPasswordType ? 'ui-input--password' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            className="ui-input-icon-btn"
            onClick={togglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="ui-error-message" role="alert">
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
