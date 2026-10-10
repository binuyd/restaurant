import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay auth-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-md w-full">
        <button onClick={onClose} className="modal-close-btn">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">
            {isRegister ? 'Create Account' : 'Welcome to Gourmet Haven'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister
              ? 'Create a customer account'
              : 'Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="error-banner mb-4">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@gourmet.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 mt-4"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-amber-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
