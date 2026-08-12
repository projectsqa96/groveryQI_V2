import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingList, ShoppingListItem, PlatformType, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/mathUtils';
import { 
  ShoppingBag, Plus, CheckSquare, Square, Trash2, 
  ArrowRight, Store, Calendar, CheckCircle, Clock 
} from 'lucide-react';

export const ShoppingListView: React.FC = () => {
  const { 
    shoppingLists, stores, products, categories, user, 
    addShoppingList, deleteShoppingList, toggleShoppingItemComplete, 
    convertShoppingListToExpense 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');

  // Convert list to purchase modal state
  const [convertModalListId, setConvertModalListId] = useState<string | null>(null);
  const [convertStoreId, setConvertStoreId] = useState(stores[0]?.id || '');
  const [convertPlatform, setConvertPlatform] = useState<PlatformType>('Offline');
  const [convertPayment, setConvertPayment] = useState<PaymentMethod>('UPI');

  // Dynamic new list items
  const [items, setItems] = useState<Omit<ShoppingListItem, 'id' | 'isCompleted'>[]>([
    { productName: 'Fresh Milk 1L', categoryId: 'cat-milk', quantity: 2, unit: 'L', estimatedPrice: 5.60 },
    { productName: 'Vine Tomatoes 1kg', categoryId: 'cat-veg', quantity: 1, unit: 'kg', estimatedPrice: 3.50 }
  ]);

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productName: '', categoryId: categories[0]?.id || 'cat-veg', quantity: 1, unit: 'pcs', estimatedPrice: 3.00 }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listTitle.trim()) return;

    const formattedItems: ShoppingListItem[] = items
      .filter((i) => i.productName.trim().length > 0)
      .map((i, idx) => ({
        ...i,
        id: `sitem-${Date.now()}-${idx}`,
        isCompleted: false
      }));

    addShoppingList({
      title: listTitle,
      date: new Date().toISOString().slice(0, 10),
      storeId: selectedStoreId,
      items: formattedItems,
      isCompleted: false
    });

    setListTitle('');
    setShowAddModal(false);
  };

  const handleConfirmConvert = () => {
    if (!convertModalListId) return;
    convertShoppingListToExpense(convertModalListId, convertStoreId, convertPlatform, convertPayment);
    setConvertModalListId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Shopping Lists</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize upcoming grocery runs and automatically convert completed lists into real purchases
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New List</span>
        </button>
      </div>

      {/* Shopping Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shoppingLists.map((list) => {
          const completedCount = list.items.filter((i) => i.isCompleted).length;
          const progressPct = list.items.length > 0 ? Math.round((completedCount / list.items.length) * 100) : 0;
          const totalEstimated = list.items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);
          const store = stores.find((s) => s.id === list.storeId);

          return (
            <div
              key={list.id}
              className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                list.isCompleted
                  ? 'border-slate-200 dark:border-slate-800 opacity-75'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{list.title}</h3>
                      {list.isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Target Date: {list.date}</span>
                      {store && <span>• Store: {store.name}</span>}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteShoppingList(list.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>
                      {completedCount} of {list.items.length} items checked
                    </span>
                    <span className="font-semibold">{progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {list.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleShoppingItemComplete(list.id, item.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        item.isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-transparent text-slate-400 line-through'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-medium">{item.productName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">
                          {item.quantity} {item.unit}
                        </span>
                        {item.estimatedPrice && (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(item.estimatedPrice, user.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action convert bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Estimated Total: </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalEstimated, user.currency)}
                  </span>
                </div>

                {!list.isCompleted && (
                  <button
                    onClick={() => {
                      setConvertModalListId(list.id);
                      setConvertStoreId(list.storeId || stores[0]?.id || '');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>Convert to Purchase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Shopping List */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create New Shopping List</h3>

            <form onSubmit={handleCreateList} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">List Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Farmers Market Staples"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Preferred Store</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase">Items To Buy</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={it.productName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, productName: val } : item)));
                      }}
                      className="col-span-6 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item)));
                      }}
                      className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Est. Price"
                      value={it.estimatedPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, estimatedPrice: val } : item)));
                      }}
                      className="col-span-3 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="col-span-1 text-slate-400 hover:text-rose-500 text-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Convert List to Expense */}
      {convertModalListId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Convert List to Purchase Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select store and payment details to record this completed list as an actual expense.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Store Purchased At</label>
                <select
                  value={convertStoreId}
                  onChange={(e) => setConvertStoreId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Platform</label>
                <select
                  value={convertPlatform}
                  onChange={(e) => setConvertPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Offline">Offline</option>
                  <option value="Instamart">Instamart</option>
                  <option value="Blinkit">Blinkit</option>
                  <option value="BigBasket">BigBasket</option>
                  <option value="Amazon Fresh">Amazon Fresh</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Payment Method</label>
                <select
                  value={convertPayment}
                  onChange={(e) => setConvertPayment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertModalListId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConvert}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Convert & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
