import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/mathUtils';
import { exportToPDFPrint } from '../../utils/exportUtils';
import { X, Printer, Store, Calendar, CreditCard, Tag, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

export const ExpenseDetailModal: React.FC = () => {
  const { selectedExpenseForModal, setSelectedExpenseForModal, setSelectedReceiptForModal, user } = useApp();

  if (!selectedExpenseForModal) return null;

  const exp = selectedExpenseForModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Invoice</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{exp.storeName}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDFPrint([exp], user.currency, `Expense Receipt - ${exp.storeName}`)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedExpenseForModal(null)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Date & Time</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(exp.date)} {exp.time}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Platform</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{exp.platform}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Payment Method</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{exp.paymentMethod}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Grand Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(exp.grandTotal, user.currency)}
              </span>
            </div>
          </div>

          {/* Tags */}
          {exp.tags && exp.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {exp.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Purchased Items ({exp.items.length})</h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Brand</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {exp.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{item.productName}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{item.brand}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.unitPrice, user.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.totalPrice, user.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span>{formatCurrency(exp.subtotal, user.currency)}</span>
            </div>
            {exp.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-{formatCurrency(exp.discount, user.currency)}</span>
              </div>
            )}
            {exp.deliveryCharge > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Fee:</span>
                <span>+{formatCurrency(exp.deliveryCharge, user.currency)}</span>
              </div>
            )}
            {exp.tax > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax / GST:</span>
                <span>+{formatCurrency(exp.tax, user.currency)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-slate-100 text-sm">
              <span>Grand Total:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(exp.grandTotal, user.currency)}</span>
            </div>
          </div>

          {/* Receipts Preview gallery */}
          {exp.receipts && exp.receipts.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Attached Receipt Documents</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {exp.receipts.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReceiptForModal(r.url)}
                    className="group relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    {r.type === 'image' ? (
                      <img src={r.url} alt={r.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-28 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-8 h-8 text-rose-500 mb-1" />
                        <span className="text-[10px] font-semibold truncate w-full">{r.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      <ExternalLink className="w-4 h-4 mr-1" /> View
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {exp.notes && (
            <div className="text-slate-500 dark:text-slate-400 italic text-[11px] bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
              Note: {exp.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
