import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { computePriceHistory, computeProductStats, formatCurrency, formatDate, parseLocalDate } from '../../utils/mathUtils';
import { X, TrendingUp, DollarSign, Store, ShoppingBag, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, expenses, stores, user } = useApp();
  const [historySearch, setHistorySearch] = useState('');

  const priceHistory = useMemo(() => computePriceHistory(expenses), [expenses]);

  const product = selectedProductForModal;

  const stats = useMemo(() => {
    if (!product) return null;
    return computeProductStats(product.id, priceHistory);
  }, [product, priceHistory]);

  // Chart 1: Price Trend Over Time
  const priceTrendChartData = useMemo(() => {
    if (!stats || !stats.records) return [];
    return [...stats.records]
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
      .map((r) => ({
        date: formatDate(r.date),
        unitPrice: r.unitPrice,
        store: r.storeName
      }));
  }, [stats]);

  // Chart 2: Avg Price Per Store Comparison
  const storeComparisonData = useMemo(() => {
    if (!stats || !stats.records) return [];
    const map: Record<string, { sum: number; count: number }> = {};
    stats.records.forEach((r) => {
      if (!map[r.storeName]) map[r.storeName] = { sum: 0, count: 0 };
      map[r.storeName].sum += r.unitPrice;
      map[r.storeName].count += 1;
    });

    return Object.entries(map).map(([storeName, val]) => ({
      store: storeName,
      avgUnitPrice: parseFloat((val.sum / val.count).toFixed(2))
    }));
  }, [stats]);

  // Chart 3: Avg Price Per Platform Comparison
  const platformComparisonData = useMemo(() => {
    if (!stats || !stats.records) return [];
    const map: Record<string, { sum: number; count: number }> = {};
    stats.records.forEach((r) => {
      if (!map[r.platform]) map[r.platform] = { sum: 0, count: 0 };
      map[r.platform].sum += r.unitPrice;
      map[r.platform].count += 1;
    });

    return Object.entries(map).map(([platform, val]) => ({
      platform,
      avgUnitPrice: parseFloat((val.sum / val.count).toFixed(2))
    }));
  }, [stats]);

  // Search history log
  const filteredRecords = useMemo(() => {
    if (!stats) return [];
    return stats.records.filter((r) => {
      if (!historySearch) return true;
      const q = historySearch.toLowerCase();
      return (
        r.storeName.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        r.unitPrice.toString().includes(q)
      );
    });
  }, [stats, historySearch]);

  if (!product || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Product Analytics
              </span>
              <span className="text-xs text-slate-400">{product.brand}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{product.name}</h3>
          </div>

          <button
            onClick={() => setSelectedProductForModal(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Average Price</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {stats.avgPrice > 0 ? formatCurrency(stats.avgPrice, user.currency) : 'N/A'}
              </span>
            </div>

            <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> Lowest Price
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                {stats.lowestPrice > 0 ? formatCurrency(stats.lowestPrice, user.currency) : 'N/A'}
              </span>
            </div>

            <div className="bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-semibold flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> Highest Price
              </span>
              <span className="text-base font-bold text-rose-700 dark:text-rose-400">
                {stats.highestPrice > 0 ? formatCurrency(stats.highestPrice, user.currency) : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Last Purchased</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {stats.lastPurchasedDate ? formatDate(stats.lastPurchasedDate) : 'Never'}
              </span>
            </div>
          </div>

          {/* Price Trend Chart */}
          {priceTrendChartData.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Price Trend Over Time</h4>
              <p className="text-[10px] text-slate-400 mb-3">Unit price evolution across purchases</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceTrendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Unit Price']} />
                    <Line type="monotone" dataKey="unitPrice" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Store & Platform Price Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storeComparisonData.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Avg Price Per Store</h4>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storeComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="store" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Avg Unit Price']} />
                      <Bar dataKey="avgUnitPrice" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {platformComparisonData.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Avg Price Per Platform</h4>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="platform" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Avg Unit Price']} />
                      <Bar dataKey="avgUnitPrice" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Searchable Purchase History Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Purchase History ({filteredRecords.length})
              </h4>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search store or date..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border-0"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Store</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{formatDate(r.date)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{r.storeName}</td>
                      <td className="py-2 px-3 text-slate-500">{r.platform}</td>
                      <td className="py-2 px-3 text-center font-medium">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(r.unitPrice, user.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
