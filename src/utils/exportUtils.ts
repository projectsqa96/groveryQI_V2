import { Expense } from '../types';
import { formatCurrency } from './mathUtils';

// Escapes user-controlled text before it is interpolated into a raw HTML
// string (used by the print/PDF export below). Without this, a store name,
// product name, or note containing HTML/script could execute in the print
// window (XSS via document.write).
const escapeHtml = (value: unknown): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const exportToCSV = (expenses: Expense[], currency = '$') => {
  const headers = ['Expense ID', 'Date', 'Time', 'Store', 'Platform', 'Payment Method', 'Items Count', 'Subtotal', 'Discount', 'Tax', 'Delivery Charge', 'Grand Total', 'Tags', 'Notes'];
  
  const rows = expenses.map(e => [
    e.id,
    e.date,
    e.time || '',
    `"${e.storeName.replace(/"/g, '""')}"`,
    e.platform,
    e.paymentMethod,
    e.items.length,
    e.subtotal.toFixed(2),
    e.discount.toFixed(2),
    e.tax.toFixed(2),
    e.deliveryCharge.toFixed(2),
    e.grandTotal.toFixed(2),
    `"${(e.tags || []).join(', ')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `grocery_expense_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (expenses: Expense[], currency = '$') => {
  let content = 'Expense ID\tDate\tTime\tStore\tPlatform\tPayment Method\tProducts\tSubtotal\tDiscount\tTax\tDelivery Charge\tGrand Total\tNotes\n';
  
  expenses.forEach(e => {
    const itemNames = e.items.map(i => `${i.productName} (${i.quantity}${i.unit})`).join('; ');
    content += `${e.id}\t${e.date}\t${e.time}\t${e.storeName}\t${e.platform}\t${e.paymentMethod}\t${itemNames}\t${e.subtotal}\t${e.discount}\t${e.tax}\t${e.deliveryCharge}\t${e.grandTotal}\t${e.notes || ''}\n`;
  });

  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `grocery_expenses_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDFPrint = (expenses: Expense[], currency = '$', title = 'Grocery & Expense Report') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalSpent = expenses.reduce((sum, e) => sum + e.grandTotal, 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; }
          h1 { margin-bottom: 4px; font-size: 24px; }
          .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #475569; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .text-right { text-align: right; }
          .summary-card { display: flex; gap: 24px; background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
          .metric-val { font-size: 20px; font-weight: bold; color: #0f172a; }
          .metric-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>
        
        <div class="summary-card">
          <div>
            <div class="metric-lbl">Total Expenses</div>
            <div class="metric-val">${formatCurrency(totalSpent, currency)}</div>
          </div>
          <div>
            <div class="metric-lbl">Total Transactions</div>
            <div class="metric-val">${expenses.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Store</th>
              <th>Platform</th>
              <th>Payment</th>
              <th>Items</th>
              <th class="text-right">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${escapeHtml(e.date)} ${escapeHtml(e.time || '')}</td>
                <td><strong>${escapeHtml(e.storeName)}</strong></td>
                <td>${escapeHtml(e.platform)}</td>
                <td>${escapeHtml(e.paymentMethod)}</td>
                <td>${e.items.map(i => escapeHtml(`${i.productName} (${i.quantity}${i.unit})`)).join(', ')}</td>
                <td class="text-right"><strong>${escapeHtml(formatCurrency(e.grandTotal, currency))}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
