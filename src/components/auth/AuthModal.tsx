import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, User, Mail, Lock, ShieldCheck, LogOut, Check, 
  Sparkles, Eye, EyeOff, Loader2, AlertCircle, Home, KeyRound 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, login, register, logout, resetPassword, 
    updateProfile 
  } = useApp();

  // The modal is only reachable once already signed in (App.tsx gates
  // everything else behind AuthPage), so it always opens on the profile view.
  const [mode, setMode] = useState<'profile' | 'login' | 'register' | 'forgot'>('profile');

  useEffect(() => {
    if (isOpen) {
      setMode('profile');
      setErrorMsg('');
      setInfoMsg('');
    }
  }, [isOpen]);

  // Form states
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user.name || '');
  const [household, setHousehold] = useState(user.householdName || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await updateProfile({
        name,
        email,
        householdName: household
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const res = await register(email, password, name, household);
    setLoading(false);
    if (res.success) {
      if (res.message) {
        setInfoMsg(res.message);
      } else {
        onClose();
      }
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  const handleLogoutClick = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    onClose();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setInfoMsg(res.message || 'Password reset link sent to your email.');
    } else {
      setErrorMsg(res.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {mode === 'profile' && 'User Account & Household'}
              {mode === 'login' && 'Account Sign In'}
              {mode === 'register' && 'Create New Account'}
              {mode === 'forgot' && 'Reset Account Password'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth status indicator banner */}
        <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
          <span>Authentication Mode:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Supabase Backend Auth
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Info / Success Alert */}
        {infoMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">{infoMsg}</div>
          </div>
        )}

        {/* PROFILE MODE */}
        {mode === 'profile' && (
          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-md shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400" /> Household Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rivera Family Household"
                value={household}
                onChange={(e) => setHousehold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold text-xs hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300"
                >
                  Switch Account
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* LOGIN MODE / REGISTER MODE */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Household Name (Optional)</label>
                <div className="relative flex items-center">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Rivera Family Household"
                    value={household}
                    onChange={(e) => setHousehold(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your account email address below to receive a secure password reset link.
            </p>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="w-full text-center text-slate-500 text-[11px] hover:underline"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
