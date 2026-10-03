import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (targetRole: 'CUSTOMER' | 'ADMIN') => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(targetRole);
      onClose();
    } catch (err: any) {
      setError('Quick login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button onClick={onClose} className="modal-close-btn">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister
              ? 'Join Gourmet Haven to place and track orders'
              : 'Sign in to access your orders and privileges'}
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Options */}
        <div className="demo-section mb-6">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2 text-center">
            ⚡ Quick Demo Auto-Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('CUSTOMER')}
              className="btn-demo-card customer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="font-semibold text-xs text-slate-200">Customer Demo</span>
              <span className="text-[10px] text-slate-400">customer@gourmet.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('ADMIN')}
              className="btn-demo-card admin"
            >
              <CheckCircle className="w-4 h-4 text-amber-400 mb-1" />
              <span className="font-semibold text-xs text-slate-200">Admin Demo</span>
              <span className="text-[10px] text-slate-400">admin@gourmet.com</span>
            </button>
          </div>
        </div>

        <div className="divider-text mb-6">
          <span>or use your email</span>
        </div>

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

          {isRegister && (
            <div>
              <label className="input-label">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'ADMIN')}
                className="input-field"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Restaurant Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 mt-4"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-amber-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
