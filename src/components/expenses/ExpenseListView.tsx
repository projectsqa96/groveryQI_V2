import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/mathUtils';
import { exportToCSV, exportToExcel, exportToPDFPrint } from '../../utils/exportUtils';
import { 
  Search, SlidersHorizontal, Eye, Trash2, Edit3, 
  Download, FileText, FileSpreadsheet, Printer, Plus, 
  ChevronLeft, ChevronRight, X, Calendar, CheckSquare, Square 
} from 'lucide-react';

export const ExpenseListView: React.FC = () => {
  const { 
    expenses, user, categories, stores, deleteExpense, 
    setSelectedExpenseForModal, setActiveTab, filters, setFilters, resetFilters 
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'grandTotal' | 'storeName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Search Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Global Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchStore = e.storeName.toLowerCase().includes(q);
        const matchPlatform = e.platform.toLowerCase().includes(q);
        const matchPayment = e.paymentMethod.toLowerCase().includes(q);
        const matchNotes = (e.notes || '').toLowerCase().includes(q);
        const matchTag = e.tags.some((t) => t.toLowerCase().includes(q));
        const matchItem = e.items.some(
          (i) => i.productName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)
        );
        const matchDate = e.date.includes(q);
        const matchPrice = e.grandTotal.toString().includes(q);

        if (!matchStore && !matchPlatform && !matchPayment && !matchNotes && !matchTag && !matchItem && !matchDate && !matchPrice) {
          return false;
        }
      }

      // Date Range
      if (filters.dateRange.start && e.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && e.date > filters.dateRange.end) return false;

      // Category filter
      if (filters.categories.length > 0) {
        const hasCat = e.items.some((i) => filters.categories.includes(i.categoryId));
        if (!hasCat) return false;
      }

      // Store filter
      if (filters.stores.length > 0 && !filters.stores.includes(e.storeId)) return false;

      // Platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes(e.platform)) return false;

      // Payment method filter
      if (filters.paymentMethods.length > 0 && !filters.paymentMethods.includes(e.paymentMethod)) return false;

      // Price range
      if (filters.minPrice !== null && e.grandTotal < filters.minPrice) return false;
      if (filters.maxPrice !== null && e.grandTotal > filters.maxPrice) return false;

      return true;
    });
  }, [expenses, filters]);

  // Sorting
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        valB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / pageSize) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedExpenses.slice(start, start + pageSize);
  }, [sortedExpenses, currentPage, pageSize]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.grandTotal, 0);
  }, [filteredExpenses]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedExpenses.map((e) => e.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected expenses?`)) {
      selectedIds.forEach((id) => deleteExpense(id));
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Expenses & Purchases</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredExpenses.length} purchases totaling{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalFilteredAmount, user.currency)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add purchase button */}
          <button
            onClick={() => setActiveTab('add-expense')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Purchase</span>
          </button>

          {/* Export Dropdown buttons */}
          <button
            onClick={() => exportToCSV(filteredExpenses, user.currency)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            title="Export to CSV"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(filteredExpenses, user.currency)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => exportToPDFPrint(filteredExpenses, user.currency)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            title="Print / PDF Report"
          >
            <Printer className="w-3.5 h-3.5 text-purple-500" />
            <span>Print PDF</span>
          </button>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              showFilterDrawer || filters.categories.length > 0 || filters.stores.length > 0
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Drawer Panel */}
      {showFilterDrawer && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Advanced Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:underline font-medium"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Start */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))
                }
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))
                }
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Store Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Store
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    stores: val ? [val] : []
                  }));
                }}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Platform
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFilters((prev) => ({
                    ...prev,
                    platforms: val ? [val] : []
                  }));
                }}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Platforms</option>
                <option value="Offline">Offline</option>
                <option value="Instamart">Instamart</option>
                <option value="Blinkit">Blinkit</option>
                <option value="BigBasket">BigBasket</option>
                <option value="Amazon Fresh">Amazon Fresh</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl flex items-center justify-between shadow-md text-xs">
          <span>{selectedIds.length} expense(s) selected</span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Main Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length === paginatedExpenses.length && paginatedExpenses.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  onClick={() => { setSortField('storeName'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                >
                  Store
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                >
                  Date & Time
                </th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3">Receipt</th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  onClick={() => { setSortField('grandTotal'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                >
                  Grand Total
                </th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No grocery expenses match your filter query.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((exp) => {
                  const isSelected = selectedIds.includes(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button onClick={() => toggleSelectRow(exp.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {exp.storeName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {formatDate(exp.date)} {exp.time}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {exp.platform}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {exp.paymentMethod}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {exp.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        {exp.receipts && exp.receipts.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                            {exp.receipts.length} File(s)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(exp.grandTotal, user.currency)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedExpenseForModal(exp)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingExpense(exp); setActiveTab('add-expense'); }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Page {currentPage} of {totalPages} ({filteredExpenses.length} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
