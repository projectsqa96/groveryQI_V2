import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, Plus, Sun, Moon, Laptop, ShoppingBag, 
  User as UserIcon, X, SlidersHorizontal 
} from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onToggleMobileSidebar }) => {
  const { user, theme, setTheme, activeTab, setActiveTab, filters, setFilters, resetFilters, setEditingExpense } = useApp();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left section: App branding for mobile / mobile drawer toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">Grocery Tracker</span>
        </div>
      </div>

      {/* Center section: Search bar */}
      <div className="flex-1 max-w-xl mx-auto relative hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search expenses, products, stores, categories, payment methods..."
            className="w-full pl-10 pr-10 py-1.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all duration-150"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right section: Action Buttons & Theme & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Expense button */}
        <button
          onClick={() => { setEditingExpense(null); setActiveTab('add-expense'); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs sm:text-sm text-white shadow-sm transition-all duration-150 ${
            activeTab === 'add-expense'
              ? 'bg-emerald-700 dark:bg-emerald-600 ring-2 ring-emerald-500/50'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Purchase</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Current Theme: ${theme}`}
        >
          {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
          {theme === 'system' && <Laptop className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User Profile Avatar button */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:inline max-w-[100px] truncate">
            {user.name || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
};
