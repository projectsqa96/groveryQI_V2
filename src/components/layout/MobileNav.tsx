import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ReceiptText, PlusCircle, Package, ShoppingBag } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'add-expense', label: 'Add', icon: PlusCircle, isCenter: true },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center -mt-5 bg-emerald-600 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
