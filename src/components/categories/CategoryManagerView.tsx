import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/mathUtils';
import { Tags, Plus, Trash2, Edit3, ShoppingBag } from 'lucide-react';
import { Category } from '../../types';

const COLOR_OPTIONS = [
  { value: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30', label: 'Purple Badge' },
  { value: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', label: 'Emerald Badge' },
  { value: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Amber Badge' },
  { value: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30', label: 'Cyan Badge' },
  { value: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30', label: 'Rose Badge' },
  { value: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30', label: 'Sky Badge' },
];

export const CategoryManagerView: React.FC = () => {
  const { categories, expenses, user, addCategory, updateCategory, deleteCategory } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  // Compute total spent and item count per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { totalSpent: number; itemsCount: number }> = {};

    categories.forEach((c) => {
      stats[c.id] = { totalSpent: 0, itemsCount: 0 };
    });

    expenses.forEach((e) => {
      e.items.forEach((item) => {
        const catId = item.categoryId || 'cat-others';
        if (!stats[catId]) {
          stats[catId] = { totalSpent: 0, itemsCount: 0 };
        }
        stats[catId].totalSpent += item.totalPrice;
        stats[catId].itemsCount += item.quantity;
      });
    });

    return stats;
  }, [categories, expenses]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setColor(COLOR_OPTIONS[0].value);
    setShowModal(true);
  };

  const openEditModal = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setColor(c.color || COLOR_OPTIONS[0].value);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateCategory(editingId, { name, color });
    } else {
      addCategory({ name, icon: 'Tag', color, isDefault: false });
    }

    setShowModal(false);
    setEditingId(null);
    setName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Category Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {categories.length} default & custom grocery categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => {
          const stat = categoryStats[c.id] || { totalSpent: 0, itemsCount: 0 };

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${c.color}`}>
                    <Tags className="w-3.5 h-3.5" />
                    <span>{c.name}</span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1 text-slate-400 hover:text-emerald-500 rounded-lg"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Total Expenditure:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stat.totalSpent, user.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Purchased Items:</span>
                    <span>{stat.itemsCount} units</span>
                  </div>
                </div>
              </div>

              {c.isDefault && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                  System Default Category
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingId ? 'Edit Category' : 'Add Custom Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Gourmet & Nuts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Theme Style</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {editingId ? 'Save Changes' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
