import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, parseLocalDate } from '../../utils/mathUtils';
import { 
  TrendingUp, Calendar, ShoppingBag, CreditCard, 
  Store, Award, Tag, ArrowUpRight, Plus, Eye 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export const DashboardView: React.FC = () => {
  const { expenses, user, categories, stores, setActiveTab, setSelectedExpenseForModal, setEditingExpense } = useApp();

  // Metrics Calculations
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let todayExp = 0;
    let thisMonthExp = 0;
    let lastMonthExp = 0;
    let totalPurchasesCount = expenses.length;
    let totalProductsPurchasedCount = 0;

    const categoryTotals: Record<string, number> = {};
    const storeTotals: Record<string, number> = {};
    const platformTotals: Record<string, number> = {};
    const paymentTotals: Record<string, number> = {};
    const productFrequency: Record<string, { count: number; name: string }> = {};

    expenses.forEach((e) => {
      const expDate = parseLocalDate(e.date);
      const isToday = e.date === todayStr;
      const isThisMonth = expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      const isLastMonth = expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;

      if (isToday) todayExp += e.grandTotal;
      if (isThisMonth) thisMonthExp += e.grandTotal;
      if (isLastMonth) lastMonthExp += e.grandTotal;

      storeTotals[e.storeName] = (storeTotals[e.storeName] || 0) + e.grandTotal;
      platformTotals[e.platform] = (platformTotals[e.platform] || 0) + e.grandTotal;
      paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + e.grandTotal;

      e.items.forEach((item) => {
        totalProductsPurchasedCount += item.quantity;
        const catName = categories.find((c) => c.id === item.categoryId)?.name || 'Others';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + item.totalPrice;

        if (!productFrequency[item.productName]) {
          productFrequency[item.productName] = { count: 0, name: item.productName };
        }
        productFrequency[item.productName].count += item.quantity;
      });
    });

    const daysInCurrentMonth = now.getDate() || 1;
    const avgDailyExpense = thisMonthExp / daysInCurrentMonth;

    // Top product
    const sortedProducts = Object.values(productFrequency).sort((a, b) => b.count - a.count);
    const mostPurchasedProduct = sortedProducts[0]?.name || 'N/A';

    // Highest spending category
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0] || 'N/A';

    // Top store
    const sortedStores = Object.entries(storeTotals).sort((a, b) => b[1] - a[1]);
    const topStore = sortedStores[0]?.[0] || 'N/A';

    return {
      todayExp,
      thisMonthExp,
      lastMonthExp,
      avgDailyExpense,
      totalPurchasesCount,
      totalProductsPurchasedCount,
      mostPurchasedProduct,
      topCategory,
      topStore,
      categoryTotals,
      storeTotals,
      platformTotals,
      paymentTotals
    };
  }, [expenses, categories]);

  // Chart Data preparation
  const monthlyTrendData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const monthKey = e.date.slice(0, 7); // YYYY-MM
      monthMap[monthKey] = (monthMap[monthKey] || 0) + e.grandTotal;
    });

    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([m, amount]) => {
        const [year, month] = m.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          amount: parseFloat(amount.toFixed(2))
        };
      });
  }, [expenses]);

  const categoryChartData = useMemo(() => {
    return Object.entries(metrics.categoryTotals)
      .map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [metrics.categoryTotals]);

  const storeChartData = useMemo(() => {
    return Object.entries(metrics.storeTotals)
      .map(([name, amount]) => ({ name, amount: parseFloat((amount as number).toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [metrics.storeTotals]);

  const platformChartData = useMemo(() => {
    return Object.entries(metrics.platformTotals)
      .map(([name, amount]) => ({ name, amount: parseFloat((amount as number).toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);
  }, [metrics.platformTotals]);

  const paymentChartData = useMemo(() => {
    return Object.entries(metrics.paymentTotals)
      .map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [metrics.paymentTotals]);

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()).slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-900/90 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {user.name || 'User'}!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            Track your grocery spending, compare product prices across stores, and stay within your budget.
          </p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setActiveTab('add-expense'); }}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Key Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Monthly Expense */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">This Month</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(metrics.thisMonthExp, user.currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Last month:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(metrics.lastMonthExp, user.currency)}
            </span>
          </div>
        </div>

        {/* Today's Expense */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(metrics.todayExp, user.currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Daily avg: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(metrics.avgDailyExpense, user.currency)}
            </span>
          </div>
        </div>

        {/* Purchases Count */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchases</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metrics.totalPurchasesCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{metrics.totalProductsPurchasedCount} items purchased</span>
          </div>
        </div>

        {/* Top Store */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Store</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 truncate" title={metrics.topStore}>
            {metrics.topStore}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
            <span>Top Cat:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{metrics.topCategory}</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Spending Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historical grocery expenditure trajectory</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              View Detailed Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Expense']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Category Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Spending distribution by food category</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {categoryChartData.slice(0, 4).map((c, idx) => (
              <div key={c.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Store & Platform & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Store Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Top Stores</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Expenses per merchant</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Spent']} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Platforms (Online vs Offline)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Delivery apps vs in-store</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Spent']} />
                <Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Payment Methods</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">UPI, Cards, Cash usage</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentChartData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-p-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${user.currency}${val.toFixed(2)}`, 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Purchases</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest recorded grocery expenses</p>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All Purchases ({expenses.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="pb-3 px-2">Store</th>
                <th className="pb-3 px-2">Date & Time</th>
                <th className="pb-3 px-2">Platform</th>
                <th className="pb-3 px-2">Payment</th>
                <th className="pb-3 px-2">Items</th>
                <th className="pb-3 px-2 text-right">Grand Total</th>
                <th className="pb-3 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">
                    {exp.storeName}
                  </td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                    {formatDate(exp.date)} {exp.time}
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exp.platform}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                    {exp.paymentMethod}
                  </td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {exp.items.map((i) => i.productName).join(', ')}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(exp.grandTotal, user.currency)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setSelectedExpenseForModal(exp)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
