import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { ExpenseListView } from './components/expenses/ExpenseListView';
import { AddExpenseView } from './components/expenses/AddExpenseView';
import { ProductMasterView } from './components/products/ProductMasterView';
import { CategoryManagerView } from './components/categories/CategoryManagerView';
import { StoreManagerView } from './components/stores/StoreManagerView';
import { ShoppingListView } from './components/shopping/ShoppingListView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { ExpenseDetailModal } from './components/expenses/ExpenseDetailModal';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { ReceiptViewerModal } from './components/receipts/ReceiptViewerModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { ToastContainer } from './components/common/Toast';
import { ShoppingBag, Loader2, DatabaseZap } from 'lucide-react';

const SplashScreen: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
      <ShoppingBag className="w-6 h-6" />
    </div>
    <div className="flex items-center gap-2 text-sm font-medium">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  </div>
);

const SupabaseNotConfigured: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
    <div className="max-w-md w-full space-y-4 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
        <DatabaseZap className="w-7 h-7" />
      </div>
      <h1 className="text-lg font-bold">Supabase isn't configured yet</h1>
      <p className="text-sm text-slate-400">
        This app stores all data in Supabase — there's no local/offline mode. Set{' '}
        <code className="text-emerald-400">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code> in your environment
        (see <code className="text-emerald-400">.env.example</code>), run{' '}
        <code className="text-emerald-400">supabase_schema.sql</code> against your Supabase project,
        then reload.
      </p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated, authStatus, isSupabaseConfigured } = useApp();
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);

  if (!isSupabaseConfigured) {
    return <SupabaseNotConfigured />;
  }

  if (authStatus === 'checking') {
    return <SplashScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  if (authStatus === 'loadingData') {
    return <SplashScreen label="Loading your data from Supabase..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Navbar 
        onOpenAuthModal={() => setIsOpenAuthModal(true)} 
        onToggleMobileSidebar={() => setIsOpenMobileSidebar(true)} 
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isOpenMobile={isOpenMobileSidebar} 
          onCloseMobile={() => setIsOpenMobileSidebar(false)} 
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'expenses' && <ExpenseListView />}
          {activeTab === 'add-expense' && <AddExpenseView />}
          {activeTab === 'products' && <ProductMasterView />}
          {activeTab === 'categories' && <CategoryManagerView />}
          {activeTab === 'stores' && <StoreManagerView />}
          {activeTab === 'shopping' && <ShoppingListView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <MobileNav />

      {/* Global Overlays & Modals */}
      <ExpenseDetailModal />
      <ProductDetailModal />
      <ReceiptViewerModal />
      <AuthModal isOpen={isOpenAuthModal} onClose={() => setIsOpenAuthModal(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
