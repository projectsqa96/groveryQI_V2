import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/mathUtils';
import { Store as StoreIcon, Plus, Star, MapPin, Trash2, Smartphone, Globe, Edit3 } from 'lucide-react';
import { Store } from '../../types';

export const StoreManagerView: React.FC = () => {
  const { stores, platforms, expenses, user, addStore, updateStore, deleteStore, toggleStoreFavorite } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'Offline' | 'Online' | 'Hybrid'>('Offline');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Store Spending Stats
  const storeStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    stores.forEach((s) => (stats[s.id] = { total: 0, count: 0 }));

    expenses.forEach((e) => {
      if (!stats[e.storeId]) {
        stats[e.storeId] = { total: 0, count: 0 };
      }
      stats[e.storeId].total += e.grandTotal;
      stats[e.storeId].count += 1;
    });

    return stats;
  }, [stores, expenses]);

  const resetForm = () => {
    setName('');
    setType('Offline');
    setAddress('');
    setNotes('');
  };

  const openAddModal = () => {
    setEditingId(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (s: Store) => {
    setEditingId(s.id);
    setName(s.name);
    setType(s.type as 'Offline' | 'Online' | 'Hybrid');
    setAddress(s.address || '');
    setNotes(s.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateStore(editingId, { name, type, address, notes });
    } else {
      addStore({ name, type, address, notes, isFavorite: false });
    }

    resetForm();
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Stores & Delivery Platforms</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stores.length} physical stores and instant delivery apps
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Store</span>
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stores.map((s) => {
          const stat = storeStats[s.id] || { total: 0, count: 0 };

          return (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {s.type === 'Online' ? <Smartphone className="w-4 h-4" /> : <StoreIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{s.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {s.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStoreFavorite(s.id)}
                      className="p-1 text-slate-300 hover:text-amber-500 dark:text-slate-600"
                    >
                      <Star className={`w-4 h-4 ${s.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1 text-slate-300 hover:text-emerald-500 dark:text-slate-600"
                      title="Edit Store"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStore(s.id)}
                      className="p-1 text-slate-300 hover:text-rose-500"
                      title="Delete Store"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {s.address && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 my-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </p>
                )}

                {/* Spending Stats */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Total Spent:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stat.total, user.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Total Orders:</span>
                    <span>{stat.count} purchases</span>
                  </div>
                </div>
              </div>

              {s.notes && <p className="text-[10px] text-slate-400 italic line-clamp-1">"{s.notes}"</p>}
            </div>
          );
        })}
      </div>

      {/* Platforms Reference List */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Supported Delivery & Purchase Platforms
        </h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <span
              key={p.id}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              {p.isOnline ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Globe className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{p.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Add / Edit Store Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingId ? 'Edit Store' : 'Add New Store'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Heritage Market"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Store Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Offline">Offline (Physical Store)</option>
                  <option value="Online">Online Delivery App</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Address / Location</label>
                <input
                  type="text"
                  placeholder="Street or mall location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Notes</label>
                <input
                  type="text"
                  placeholder="Operating hours, member discount notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
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
                  {editingId ? 'Save Changes' : 'Save Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
