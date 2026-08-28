import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseItem, Attachment, PaymentMethod, PlatformType } from '../../types';
import { scanReceiptImage, getGeminiConfig } from '../../lib/gemini';
import { Plus, Trash2, Upload, FileText, Check, ArrowLeft, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

export const AddExpenseView: React.FC = () => {
  const { 
    stores, platforms, products, categories, user, 
    addExpense, updateExpense, editingExpense, setEditingExpense,
    setActiveTab, addToast 
  } = useApp();

  const isEditMode = !!editingExpense;
  const [isScanning, setIsScanning] = useState(false);

  // Sentinel value for the "+ Add New Product" dropdown option
  const NEW_PRODUCT_VALUE = '__new__';

  const [storeId, setStoreId] = useState(editingExpense?.storeId || stores[0]?.id || '');
  const [platform, setPlatform] = useState<PlatformType>(editingExpense?.platform || 'Offline');
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(editingExpense?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editingExpense?.paymentMethod || 'UPI');
  const [notes, setNotes] = useState(editingExpense?.notes || '');
  const [tagsInput, setTagsInput] = useState((editingExpense?.tags || []).join(', '));
  const [deliveryChargeInput, setDeliveryChargeInput] = useState<string>(String(editingExpense?.deliveryCharge ?? 0));
  const [taxInput, setTaxInput] = useState<string>(String(editingExpense?.tax ?? 0));
  const [overallDiscountInput, setOverallDiscountInput] = useState<string>(String(editingExpense?.discount ?? 0));
  const [receipts, setReceipts] = useState<Attachment[]>(editingExpense?.receipts || []);

  // Dynamic Product Items
  const [items, setItems] = useState<ExpenseItem[]>(
    editingExpense?.items && editingExpense.items.length > 0
      ? editingExpense.items
      : [
          {
            id: `item-${Date.now()}-1`,
            productId: products[0]?.id || 'prod-custom-1',
            productName: products[0]?.name || '',
            categoryId: products[0]?.categoryId || categories[0]?.id || 'cat-veg',
            brand: products[0]?.brand || 'Generic',
            quantity: 1,
            unit: products[0]?.defaultUnit || 'kg',
            unitPrice: 3.50,
            discount: 0,
            totalPrice: 3.50,
            notes: ''
          }
        ]
  );

  // Product Row Change Handler
  const handleItemChange = (index: number, field: keyof ExpenseItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // If user selected an existing product from dropdown
      if (field === 'productId') {
        if (value === NEW_PRODUCT_VALUE) {
          // Switching to a brand-new product/brand: give it a guaranteed-unique
          // id so it never collides with (or overwrites) an existing catalog
          // entry, and clear the name/brand fields for fresh typing.
          item.productId = `prod-new-${Date.now()}-${index}`;
          item.productName = '';
          item.brand = '';
        } else {
          const prod = products.find((p) => p.id === value);
          if (prod) {
            item.productName = prod.name;
            item.brand = prod.brand;
            item.categoryId = prod.categoryId;
            item.unit = prod.defaultUnit;
          }
        }
      }

      // Auto recalculate total price for this row
      const qty = parseFloat(item.quantity as any) || 0;
      const uPrice = parseFloat(item.unitPrice as any) || 0;
      const disc = parseFloat(item.discount as any) || 0;
      item.totalPrice = Math.max(0, qty * uPrice - disc);

      updated[index] = item;
      return updated;
    });
  };

  const handleAddRow = () => {
    const defaultProd = products[items.length % products.length] || products[0];
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        productId: defaultProd?.id || `prod-${Date.now()}`,
        productName: defaultProd?.name || '',
        categoryId: defaultProd?.categoryId || categories[0]?.id || 'cat-veg',
        brand: defaultProd?.brand || 'Generic',
        quantity: 1,
        unit: defaultProd?.defaultUnit || 'pcs',
        unitPrice: 2.50,
        discount: 0,
        totalPrice: 2.50,
        notes: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length === 1) {
      addToast({ title: 'Minimum 1 Item', description: 'Purchase must contain at least one item', type: 'error' });
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Subtotal & Grand Total Auto Calculation
  const deliveryCharge = parseFloat(deliveryChargeInput) || 0;
  const tax = parseFloat(taxInput) || 0;
  const overallDiscount = parseFloat(overallDiscountInput) || 0;
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const grandTotal = Math.max(0, subtotal - overallDiscount + deliveryCharge + tax);
  const newProductCount = items.filter((item) => !products.some((p) => p.id === item.productId)).length;

  // Simulated File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          url: event.target?.result as string,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          size: file.size
        };
        setReceipts((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  // AI Receipt Scanning via Gemini
  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file again later
    if (!file) return;

    if (!getGeminiConfig().isConfigured) {
      addToast({
        title: 'AI Scanning Not Configured',
        description: 'Set VITE_GEMINI_API_KEY in your environment to enable this.',
        type: 'error'
      });
      return;
    }

    setIsScanning(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1] || '';

      const result = await scanReceiptImage(base64, file.type || 'image/jpeg');

      if (!result || result.items.length === 0) {
        addToast({
          title: 'Could Not Read Receipt',
          description: 'Try a clearer, well-lit photo, or enter the purchase manually.',
          type: 'error'
        });
        return;
      }

      // Attach the scanned photo itself as a receipt image
      const newAtt: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        url: dataUrl,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        size: file.size
      };
      setReceipts((prev) => [...prev, newAtt]);

      // Best-effort match of the scanned store name to a saved store
      const scannedStoreName = (result.storeName || '').toLowerCase().trim();
      const matchedStore =
        stores.find((s) => s.name.toLowerCase().trim() === scannedStoreName) ||
        stores.find((s) => scannedStoreName && (s.name.toLowerCase().includes(scannedStoreName) || scannedStoreName.includes(s.name.toLowerCase())));
      if (matchedStore) setStoreId(matchedStore.id);

      if (result.date) setDate(result.date);
      setDeliveryChargeInput(String(result.deliveryCharge || 0));
      setTaxInput(String(result.tax || 0));
      setOverallDiscountInput(String(result.discount || 0));

      const newItems: ExpenseItem[] = result.items.map((scanned, idx) => {
        const scannedName = scanned.name.toLowerCase().trim();
        const matchedProduct =
          products.find((p) => p.name.toLowerCase().trim() === scannedName) ||
          products.find((p) => p.name.toLowerCase().includes(scannedName) || scannedName.includes(p.name.toLowerCase()));

        const quantity = scanned.quantity || 1;
        const unitPrice = scanned.unitPrice || 0;

        return {
          id: `item-${Date.now()}-${idx}`,
          productId: matchedProduct?.id || `prod-scan-${Date.now()}-${idx}`,
          productName: matchedProduct?.name || scanned.name || 'Scanned Item',
          categoryId: matchedProduct?.categoryId || categories[0]?.id || 'cat-others',
          brand: scanned.brand || matchedProduct?.brand || 'Generic',
          quantity,
          unit: scanned.unit || matchedProduct?.defaultUnit || 'pcs',
          unitPrice,
          discount: 0,
          totalPrice: scanned.totalPrice || quantity * unitPrice,
          notes: ''
        };
      });
      setItems(newItems);

      const unmatchedCount = newItems.filter((i) => !products.some((p) => p.id === i.productId)).length;
      addToast({
        title: 'Receipt Scanned!',
        description:
          unmatchedCount > 0
            ? `Found ${newItems.length} item(s) from ${result.storeName || 'the receipt'} — ${unmatchedCount} aren't in your Product Master yet. Review the green-highlighted row(s) below and they'll be added automatically when you save.`
            : `Found ${newItems.length} item(s) from ${result.storeName || 'the receipt'} — please review before saving.`,
        type: 'success'
      });
    } catch (err) {
      console.error('Receipt scan error:', err);
      addToast({ title: 'Scan Failed', description: 'Something went wrong reading that image.', type: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCancel = () => {
    setEditingExpense(null);
    setActiveTab('expenses');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      addToast({ title: 'Items Required', description: 'Please add at least one item', type: 'error' });
      return;
    }

    const blankNewProduct = items.some((item) => {
      const isNewProduct = !products.some((p) => p.id === item.productId);
      return isNewProduct && !item.productName.trim();
    });
    if (blankNewProduct) {
      addToast({
        title: 'Product Name Required',
        description: 'One of your new products is missing a name — fill it in or pick an existing product instead.',
        type: 'error'
      });
      return;
    }

    const selectedStoreObj = stores.find((s) => s.id === storeId) || stores[0];
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Finalize numeric fields in case a row was still mid-edit (not blurred)
    // when Save was clicked.
    const finalizedItems = items.map((item) => {
      const quantity = parseFloat(item.quantity as any) || 0;
      const unitPrice = parseFloat(item.unitPrice as any) || 0;
      const discount = parseFloat(item.discount as any) || 0;
      return {
        ...item,
        quantity,
        unitPrice,
        discount,
        totalPrice: Math.max(0, quantity * unitPrice - discount)
      };
    });
    const finalizedSubtotal = finalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalizedDiscount = parseFloat(overallDiscountInput) || 0;
    const finalizedDelivery = parseFloat(deliveryChargeInput) || 0;
    const finalizedTax = parseFloat(taxInput) || 0;

    const payload = {
      storeId: selectedStoreObj ? selectedStoreObj.id : 'store-local',
      storeName: selectedStoreObj ? selectedStoreObj.name : 'Local Market',
      platform,
      date,
      time,
      paymentMethod,
      notes,
      tags: parsedTags.length > 0 ? parsedTags : ['Grocery'],
      receipts,
      items: finalizedItems,
      subtotal: finalizedSubtotal,
      discount: finalizedDiscount,
      deliveryCharge: finalizedDelivery,
      tax: finalizedTax,
      grandTotal: Math.max(0, finalizedSubtotal - finalizedDiscount + finalizedDelivery + finalizedTax)
    };

    if (isEditMode && editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }

    setEditingExpense(null);
    setActiveTab('expenses');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditMode ? 'Edit Purchase / Expense' : 'Add New Purchase / Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditMode ? 'Update the itemized grocery invoice details' : 'Record itemized grocery invoice details'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>{isEditMode ? 'Save Changes' : 'Save Purchase'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Receipt Scan Card */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-700 dark:to-indigo-800 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-sm">Scan Receipt with AI</p>
              <p className="text-xs text-white/80">
                {isScanning ? 'Reading your receipt...' : 'Upload a photo and auto-fill store, items & prices below'}
              </p>
            </div>
          </div>

          <label
            htmlFor="ai-receipt-scan-upload"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-sm transition-all shrink-0 ${
              isScanning ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/90 cursor-pointer active:scale-95'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isScanning ? 'Scanning...' : 'Upload Photo'}</span>
          </label>
          <input
            id="ai-receipt-scan-upload"
            type="file"
            accept="image/*"
            disabled={isScanning}
            onChange={handleScanReceipt}
            className="hidden"
          />
        </div>

        {/* Section 1: Purchase Metadata Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Purchase Header Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Store Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store / Merchant *
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Offline">Offline (In-Store)</option>
                <option value="Instamart">Instamart</option>
                <option value="Blinkit">Blinkit</option>
                <option value="BigBasket">BigBasket</option>
                <option value="Amazon Fresh">Amazon Fresh</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zomato">Zomato</option>
                <option value="Flipkart Grocery">Flipkart Grocery</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Weekly Staples, Organic, Offer Deal"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Bought with discount coupon #SAVE20"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dynamic Products Entry Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Product Items ({items.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Specify items purchased and individual pricing</p>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Row</span>
            </button>
          </div>

          {newProductCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{newProductCount} product{newProductCount > 1 ? 's' : ''}</strong> below {newProductCount > 1 ? "aren't" : "isn't"} in your Product Master yet (highlighted in green).
                Fill in the name and brand — they'll be added to your catalog automatically when you save this purchase.
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-2 px-2 w-1/3">Product & Brand</th>
                  <th className="pb-2 px-2 w-28">Category</th>
                  <th className="pb-2 px-2 w-20">Qty</th>
                  <th className="pb-2 px-2 w-20">Unit</th>
                  <th className="pb-2 px-2 w-24">Unit Price ({user.currency})</th>
                  <th className="pb-2 px-2 w-20">Discount</th>
                  <th className="pb-2 px-2 w-28 text-right">Total Price</th>
                  <th className="pb-2 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((item, idx) => {
                  const isNewProduct = !products.some((p) => p.id === item.productId);
                  return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    {/* Product Selection / Name */}
                    <td className="py-2.5 px-2">
                      <select
                        value={isNewProduct ? NEW_PRODUCT_VALUE : item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 mb-1 font-medium"
                      >
                        <option value={NEW_PRODUCT_VALUE} className="font-bold text-emerald-600">
                          + Add New Product / Brand
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.brand})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required={isNewProduct}
                        placeholder={isNewProduct ? 'New product name *' : 'Product Name override'}
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        className={`w-full px-2 py-1 text-[11px] rounded bg-transparent border mb-1 ${
                          isNewProduct
                            ? 'border-emerald-400 dark:border-emerald-600 text-slate-900 dark:text-slate-100'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder={isNewProduct ? 'New brand (e.g. Generic, Amul)' : 'Brand (e.g. Generic, Amul, Tata)'}
                        value={item.brand}
                        onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                        className={`w-full px-2 py-1 text-[11px] rounded bg-transparent border ${
                          isNewProduct
                            ? 'border-emerald-400 dark:border-emerald-600 text-slate-900 dark:text-slate-100'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      />
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-2">
                      <select
                        value={item.categoryId}
                        onChange={(e) => handleItemChange(idx, 'categoryId', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'quantity', v);
                        }}
                        onBlur={() => handleItemChange(idx, 'quantity', parseFloat(item.quantity as any) || 0)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'unitPrice', v);
                        }}
                        onBlur={() => handleItemChange(idx, 'unitPrice', parseFloat(item.unitPrice as any) || 0)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </td>

                    {/* Item Discount */}
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.discount}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'discount', v);
                        }}
                        onBlur={() => handleItemChange(idx, 'discount', parseFloat(item.discount as any) || 0)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </td>

                    {/* Total Price */}
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-slate-100">
                      {user.currency}{item.totalPrice.toFixed(2)}
                    </td>

                    {/* Delete Row */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Receipt Upload & Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Receipts Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Receipt Attachments
            </h3>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click or drag invoice images / PDF receipts
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, PDF up to 10MB</p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="receipt-file-upload"
              />
              <label
                htmlFor="receipt-file-upload"
                className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Browse Files
              </label>
            </div>

            {receipts.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {receipts.map((r, idx) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {r.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                      <span className="truncate font-medium">{r.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceipts((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand Totals Calculation Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Calculation Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal:</span>
                <span className="font-semibold">{user.currency}{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Overall Discount:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={overallDiscountInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setOverallDiscountInput(v);
                  }}
                  onBlur={() => setOverallDiscountInput(String(parseFloat(overallDiscountInput) || 0))}
                  className="w-24 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-right text-emerald-400 font-semibold"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Delivery Charge:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={deliveryChargeInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setDeliveryChargeInput(v);
                  }}
                  onBlur={() => setDeliveryChargeInput(String(parseFloat(deliveryChargeInput) || 0))}
                  className="w-24 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-right font-semibold"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Tax / GST:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={taxInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setTaxInput(v);
                  }}
                  onBlur={() => setTaxInput(String(parseFloat(taxInput) || 0))}
                  className="w-24 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-right font-semibold"
                />
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold text-white">
                <span className="text-emerald-400">Grand Total:</span>
                <span className="text-2xl text-emerald-400">{user.currency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              {isEditMode ? 'Save Changes' : 'Confirm & Save Expense'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
