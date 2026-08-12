import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, Mail, Home, DollarSign, ShieldCheck, Sun, Moon, Laptop, LogOut, 
  CheckCircle2, Save, KeyRound, Loader2, Calendar, Hash, Sparkles, Database
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    user, theme, setTheme, logout, updateProfile, isAuthenticated,
    categories, stores, products, resetToDemoData
  } = useApp();

  // Local form state initialized from user context
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [household, setHousehold] = useState(user.householdName || '');
  const [currency, setCurrency] = useState(user.currency || '$');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setHousehold(user.householdName || '');
    setCurrency(user.currency || '$');
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name,
      email,
      householdName: household,
      currency
    });
    setIsSaving(false);
  };

  const handleLoadDefaults = async () => {
    setIsLoadingDefaults(true);
    await resetToDemoData();
    setIsLoadingDefaults(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            User Account & Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your registered account details, currency settings, and household configuration
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/30 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cloud Database Active
        </span>
      </div>

      {/* 1. Account Identity Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{user.name || 'Account User'}</h3>
                {isAuthenticated && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Verified User
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Home className="w-3 h-3 text-emerald-400" /> {user.householdName || 'My Household'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Currency: <strong className="text-white">{user.currency || '$'}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Details Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
          <div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Account ID</span>
            <span className="font-mono text-slate-300 text-[10px] truncate block" title={user.id}>{user.id}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Auth Provider</span>
            <span className="text-slate-300 font-semibold">Supabase Auth</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Active Household</span>
            <span className="text-slate-300 font-semibold">{user.householdName || 'Default'}</span>
          </div>
        </div>
      </div>

      {/* 2. Editable User Profile Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> Edit Registered Profile Details
          </h3>
          <span className="text-[11px] text-slate-400">Changes reflect instantly across all reports</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400" /> Household Name
              </label>
              <input
                type="text"
                value={household}
                onChange={(e) => setHousehold(e.target.value)}
                placeholder="e.g. My Household"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="₹">₹ (INR / Rupee)</option>
                <option value="€">€ (EUR / Euro)</option>
                <option value="£">£ (GBP / Pound)</option>
                <option value="¥">¥ (JPY / Yuan)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Appearance & Theme Settings Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Appearance Theme
        </h3>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-semibold transition-all ${
              theme === 'light'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" /> Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-semibold transition-all ${
              theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" /> Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-semibold transition-all ${
              theme === 'system'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-500" /> System
          </button>
        </div>
      </div>

      {/* 4. Data Management Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-3.5 h-3.5" /> Data Management
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Starter categories, stores & products
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              You currently have {categories.length} categories, {stores.length} stores, and {products.length} products.
              This adds a set of common defaults on top of what you already have &mdash; it won't remove or duplicate anything.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadDefaults}
            disabled={isLoadingDefaults}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {isLoadingDefaults ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Load Default Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
