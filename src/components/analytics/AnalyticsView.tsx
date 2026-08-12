import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { computePriceHistory, formatCurrency, formatDate } from '../../utils/mathUtils';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Store, Award, ShoppingBag, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export const AnalyticsView: React.FC = () => {
  const { expenses, products, stores, user } = useApp();

  const priceHistory = useMemo(() => computePriceHistory(expenses), [expenses]);

  // Price Changes analysis (Items with multiple purchases)
  const priceTrends = useMemo(() => {
    const prodMap: Record<string, number[]> = {};
    priceHistory.forEach((r) => {
      if (!prodMap[r.productName]) prodMap[r.productName] = [];
      prodMap[r.productName].push(r.unitPrice);
    });

    const increases: { name: string; oldPrice: number; newPrice: number; pct: number }[] = [];
    const decreases: { name: string; oldPrice: number; newPrice: number; pct: number }[] = [];

    Object.entries(prodMap).forEach(([name, prices]) => {
      if (prices.length >= 2) {
        const first = prices[0];
        const last = prices[prices.length - 1];
        const diff = last - first;
        const pct = Math.round((diff / first) * 100);

        if (diff > 0) {
          increases.push({ name, oldPrice: first, newPrice: last, pct });
        } else if (diff < 0) {
          decreases.push({ name, oldPrice: first, newPrice: last, pct: Math.abs(pct) });
        }
      }
    });

    return { increases, decreases };
  }, [priceHistory]);

  // Frequently purchased items
  const topProductsByFrequency = useMemo(() => {
    const map: Record<string, { count: number; totalSpent: number }> = {};
    expenses.forEach((e) => {
      e.items.forEach((item) => {
        if (!map[item.productName]) map[item.productName] = { count: 0, totalSpent: 0 };
        map[item.productName].count += item.quantity;
        map[item.productName].totalSpent += item.totalPrice;
      });
    });

    return Object.entries(map)
      .map(([name, val]) => ({ name, count: val.count, totalSpent: val.totalSpent }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [expenses]);

  // Most Expensive Products Purchased
  const mostExpensiveProducts = useMemo(() => {
    const map: Record<string, number> = {};
    priceHistory.forEach((r) => {
      if (!map[r.productName] || r.unitPrice > map[r.productName]) {
        map[r.productName] = r.unitPrice;
      }
    });

    return Object.entries(map)
      .map(([name, maxPrice]) => ({ name, maxPrice }))
      .sort((a, b) => b.maxPrice - a.maxPrice)
      .slice(0, 5);
  }, [priceHistory]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Analytics & Price Trends Hub</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          In-depth price inflation trackers, store comparison matrix, and expenditure analytics
        </p>
      </div>

      {/* Inflation Tracker: Price Increase vs Decrease */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Increases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                <span>Price Increases Detected</span>
              </h3>
              <p className="text-[11px] text-slate-400">Products with recent price inflation</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {priceTrends.increases.length} item(s)
            </span>
          </div>

          <div className="space-y-2">
            {priceTrends.increases.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No price increases logged yet.</p>
            ) : (
              priceTrends.increases.map((inc) => (
                <div key={inc.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{inc.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {formatCurrency(inc.oldPrice, user.currency)} → {formatCurrency(inc.newPrice, user.currency)}
                    </div>
                  </div>
                  <span className="font-bold text-rose-500 flex items-center gap-0.5">
                    +{inc.pct}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Price Decreases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                <span>Price Savings & Discounts</span>
              </h3>
              <p className="text-[11px] text-slate-400">Products with reduced purchase price</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {priceTrends.decreases.length} item(s)
            </span>
          </div>

          <div className="space-y-2">
            {priceTrends.decreases.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No price drops logged yet.</p>
            ) : (
              priceTrends.decreases.map((dec) => (
                <div key={dec.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{dec.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {formatCurrency(dec.oldPrice, user.currency)} → {formatCurrency(dec.newPrice, user.currency)}
                    </div>
                  </div>
                  <span className="font-bold text-emerald-500 flex items-center gap-0.5">
                    -{dec.pct}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Most Expensive Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Frequently Purchased */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Frequently Purchased Items
          </h3>
          <div className="space-y-2">
            {topProductsByFrequency.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.count} total units bought</div>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(p.totalSpent, user.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Expensive Single Products */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Highest Unit Price Products
          </h3>
          <div className="space-y-2">
            {mostExpensiveProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.maxPrice, user.currency)} / unit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
