import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToExcel, exportToPDFPrint } from '../../utils/exportUtils';
import { formatCurrency, formatDate } from '../../utils/mathUtils';
import { FileSpreadsheet, Download, Printer, FileText, Calendar, Filter, Check } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { expenses, categories, stores, platforms, user } = useApp();

  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'category' | 'store' | 'platform'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');

  // Filter expenses for report
  const reportExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (reportType === 'monthly') {
        return e.date.startsWith(selectedMonth);
      }
      if (reportType === 'yearly') {
        return e.date.startsWith(selectedYear);
      }
      if (reportType === 'category') {
        if (selectedCategoryId === 'all') return true;
        return e.items.some((i) => i.categoryId === selectedCategoryId);
      }
      if (reportType === 'store') {
        if (selectedStoreId === 'all') return true;
        return e.storeId === selectedStoreId;
      }
      return true;
    });
  }, [expenses, reportType, selectedMonth, selectedYear, selectedCategoryId, selectedStoreId]);

  const totalSpent = useMemo(() => reportExpenses.reduce((sum, e) => sum + e.grandTotal, 0), [reportExpenses]);
  const totalTax = useMemo(() => reportExpenses.reduce((sum, e) => sum + e.tax, 0), [reportExpenses]);
  const totalDiscount = useMemo(() => reportExpenses.reduce((sum, e) => sum + e.discount, 0), [reportExpenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Reports & Export Hub</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate custom monthly, yearly, category, and store expenditure reports with 1-click export
        </p>
      </div>

      {/* Report Filter Controls Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Report Type */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="category">Category Report</option>
              <option value="store">Store Report</option>
            </select>
          </div>

          {/* Conditional selector */}
          {reportType === 'monthly' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          )}

          {reportType === 'yearly' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          )}

          {reportType === 'category' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'store' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store</label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="all">All Stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Export Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportToCSV(reportExpenses, user.currency)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(reportExpenses, user.currency)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportToPDFPrint(reportExpenses, user.currency, `Grocery Report - ${reportType}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Overview Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Expenditure</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalSpent, user.currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{reportExpenses.length} transaction(s)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Discounts Claimed</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalDiscount, user.currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Savings achieved</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Tax / GST</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalTax, user.currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Government levies</span>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Report Line Items ({reportExpenses.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Store</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Items Purchased</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {reportExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected report filter.
                  </td>
                </tr>
              ) : (
                reportExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium">{formatDate(exp.date)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{exp.storeName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{exp.platform}</td>
                    <td className="py-2.5 px-3 text-slate-500">{exp.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {exp.items.map((i) => i.productName).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(exp.grandTotal, user.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
