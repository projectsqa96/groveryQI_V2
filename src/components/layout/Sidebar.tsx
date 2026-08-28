import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, ReceiptText, PlusCircle, Package, 
  Tags, Store, ShoppingBag, BarChart3, FileSpreadsheet, 
  Settings, UserCheck, ShieldCheck, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, expenses, products, shoppingLists } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses List', icon: ReceiptText, badge: expenses.length },
    { id: 'add-expense', label: 'Add Purchase', icon: PlusCircle, isHighlight: true },
    { id: 'products', label: 'Products Master', icon: Package, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'stores', label: 'Stores & Platforms', icon: Store },
    { id: 'shopping', label: 'Shopping Lists', icon: ShoppingBag, badge: shoppingLists.filter(l => !l.isCompleted).length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Database & Settings', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden" 
          onClick={onCloseMobile} 
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Grocery Tracker</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Personal & Household</p>
          </div>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/15 font-semibold' 
                    : item.isHighlight 
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Supabase Ready</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">PostgreSQL Schema</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
