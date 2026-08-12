import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, Mail, Lock, User, Home, DollarSign,
  ArrowRight, CheckCircle2, Sparkles, Eye, EyeOff, Loader2, AlertCircle,
  BarChart3, Receipt, Check, Sun, Moon
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    login, register, resetPassword, setActiveTab, theme, setTheme 
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [household, setHousehold] = useState('');
  const [currency, setCurrency] = useState('$');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      setActiveTab('dashboard');
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

    const res = await register(email, password, name, household || `${name}'s Household`, currency);
    setLoading(false);

    if (res.success) {
      if (res.message) {
        setInfoMsg(res.message);
      } else {
        setActiveTab('dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Price Tracker & Grocery Log
            </h1>
            <p className="text-[11px] text-slate-400">Household Expense Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Supabase Cloud Active
          </span>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Side: Product Branding & Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Personal & Household Finance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage your groceries, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                track prices & expenses.
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Create your account to organize household spending, save store items, compare price trends across platforms, and attach digital receipts.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Price Trend Analytics</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Track cost inflation across offline and online stores.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Receipt Vault</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Attach and store receipt photos for quick warranty lookup.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Household Profiles</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Separate item lists per household account with customized currency.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Shopping Lists</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Convert planned lists straight into logged expenses in one tap.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card (Login / Signup) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-slate-800/90 border border-slate-700/80 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              
              {/* Mode Switcher Tabs */}
              {mode !== 'forgot' && (
                <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      mode === 'login'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      mode === 'register'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Title Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'register' && 'Create Your Account'}
                  {mode === 'forgot' && 'Reset Account Password'}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === 'login' && 'Enter your email address and password to log in'}
                  {mode === 'register' && 'Fill in your details below to set up your profile'}
                  {mode === 'forgot' && 'Enter your registered email address to receive a password reset link'}
                </p>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMsg}</div>
                </div>
              )}

              {infoMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{infoMsg}</div>
                </div>
              )}

              {/* SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-emerald-400 hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400" /> Household
                      </label>
                      <input
                        type="text"
                        placeholder="Johnson Family"
                        value={household}
                        onChange={(e) => setHousehold(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="$">$ (USD)</option>
                        <option value="₹">₹ (INR)</option>
                        <option value="€">€ (EUR)</option>
                        <option value="£">£ (GBP)</option>
                        <option value="¥">¥ (JPY)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Sign Up</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs text-slate-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
        Price Tracker & Grocery Log — Safe & Encrypted Household Finance
      </footer>
    </div>
  );
};
