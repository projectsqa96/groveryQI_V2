import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Expense, Product, Category, Store, Platform, ShoppingList,
  UserProfile, FilterOptions, ThemeMode, ToastMessage, PaymentMethod, PlatformType,
  ExpenseItem, Attachment
} from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_STORES, DEFAULT_PLATFORMS, DEFAULT_PRODUCTS } from '../data/initialData';
import { getSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import {
  fetchCategoriesFromSupabase, saveCategoryToSupabase, deleteCategoryFromSupabase,
  fetchStoresFromSupabase, saveStoreToSupabase, deleteStoreFromSupabase,
  fetchProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase,
  fetchExpensesFromSupabase, saveExpenseToSupabase, deleteExpenseFromSupabase,
  fetchShoppingListsFromSupabase, saveShoppingListToSupabase, deleteShoppingListFromSupabase
} from '../lib/supabaseSync';
import { scanReceiptImage, getGeminiConfig } from '../lib/gemini';

// Auth lifecycle:
// 'checking'    -> app just loaded, we're asking Supabase if a session exists
// 'signedOut'   -> no active session, show the sign-in screen
// 'loadingData' -> session confirmed, pulling this user's data from Supabase
// 'ready'       -> signed in and data loaded
type AuthStatus = 'checking' | 'signedOut' | 'loadingData' | 'ready';

const EMPTY_USER: UserProfile = {
  id: '',
  email: '',
  name: '',
  currency: '₹',
  preferredTheme: 'system',
  householdName: ''
};

interface ExpenseScanResult {
  token: number;
  matchedStoreId: string | null;
  date: string | null;
  deliveryChargeInput: string;
  taxInput: string;
  overallDiscountInput: string;
  items: ExpenseItem[];
  receiptAttachment: Attachment;
  storeNameForToast: string;
  unmatchedCount: number;
}

interface AppContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  expenses: Expense[];
  products: Product[];
  categories: Category[];
  stores: Store[];
  platforms: Platform[];
  shoppingLists: ShoppingList[];

  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;

  selectedExpenseForModal: Expense | null;
  setSelectedExpenseForModal: (expense: Expense | null) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  selectedReceiptForModal: string | null;
  setSelectedReceiptForModal: (url: string | null) => void;

  toasts: ToastMessage[];
  addToast: (message: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  isSupabaseConfigured: boolean;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  isDataLoading: boolean;
  syncWithSupabase: () => Promise<void>;

  // Authentication & Profile Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, householdName?: string, currency?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateProfile: (details: { name: string; email: string; householdName?: string; currency?: string }) => Promise<{ success: boolean; error?: string }>;

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductFavorite: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (id: string, store: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  toggleStoreFavorite: (id: string) => Promise<void>;

  addShoppingList: (list: Omit<ShoppingList, 'id' | 'createdAt'>) => Promise<void>;
  updateShoppingList: (id: string, list: Partial<ShoppingList>) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  toggleShoppingItemComplete: (listId: string, itemId: string) => Promise<void>;
  convertShoppingListToExpense: (listId: string, storeId: string, platform: PlatformType, paymentMethod: PaymentMethod) => Promise<void>;

  removeAllDemoData: () => Promise<void>;
  resetToDemoData: () => Promise<void>;

  // Receipt scanning lives here (not inside AddExpenseView) so it survives
  // the user switching to a different tab mid-scan. AddExpenseView only
  // renders while activeTab === 'add-expense', so it unmounts on tab switch;
  // an in-flight scan owned by that component would silently discard its
  // result when it later resolved against a component that no longer
  // exists. Owning it here means the scan keeps running and its result is
  // available whenever the user returns to Add Purchase.
  isScanningReceipt: boolean;
  scanResult: ExpenseScanResult | null;
  scanReceiptForNewExpense: (file: File) => Promise<void>;
  clearScanResult: () => void;
}

const initialFilters: FilterOptions = {
  searchQuery: '',
  dateRange: { start: '', end: '' },
  categories: [],
  stores: [],
  platforms: [],
  paymentMethods: [],
  minPrice: null,
  maxPrice: null,
  tag: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const userFromSupabase = (supaUser: any): UserProfile => ({
  id: supaUser.id,
  email: supaUser.email || '',
  name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
  householdName: supaUser.user_metadata?.household_name || '',
  currency: supaUser.user_metadata?.currency || '₹',
  preferredTheme: (supaUser.user_metadata?.theme as ThemeMode) || 'system'
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConfigured: isSupabaseConfigured } = { isConfigured: getSupabaseConfig().isConfigured };

  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [themeState, setThemeState] = useState<ThemeMode>('system');
  const [authStatus, setAuthStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'checking' : 'signedOut');

  // Mobile browsers frequently kill a backgrounded tab's page (e.g. while the
  // camera or file picker is open) and reload it from scratch when the user
  // returns. Remembering which screen was open in sessionStorage means that
  // reload lands back where the user was instead of resetting to the
  // dashboard. sessionStorage (not localStorage) is used deliberately so a
  // stale tab isn't restored days later after the browser is fully closed.
  const ACTIVE_TAB_STORAGE_KEY = 'groceryqi:active-tab';
  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      return sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    } catch {
      /* non-fatal: tab just won't survive a reload this time */
    }
  };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [platforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const [selectedExpenseForModal, setSelectedExpenseForModal] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Guards against a stray fetch from a previous session landing after logout.
  const sessionTokenRef = useRef(0);

  const addToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { ...message, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetFilters = () => setFilters(initialFilters);

  // Receipt scanning — deliberately owned here, not by AddExpenseView, so it
  // survives the user switching tabs mid-scan (see AppContextType comment).
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanResult, setScanResult] = useState<ExpenseScanResult | null>(null);
  const clearScanResult = () => setScanResult(null);

  const scanReceiptForNewExpense = useCallback(async (file: File) => {
    if (!getGeminiConfig().isConfigured) {
      addToast({
        title: 'AI Scanning Not Configured',
        description: 'Set VITE_GEMINI_API_KEY in your environment to enable this.',
        type: 'error'
      });
      return;
    }

    setIsScanningReceipt(true);
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

      const receiptAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        url: dataUrl,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        size: file.size
      };

      // Best-effort match of the scanned store name to a saved store
      const scannedStoreName = (result.storeName || '').toLowerCase().trim();
      const matchedStore =
        stores.find((s) => s.name.toLowerCase().trim() === scannedStoreName) ||
        stores.find((s) => scannedStoreName && (s.name.toLowerCase().includes(scannedStoreName) || scannedStoreName.includes(s.name.toLowerCase())));

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

      const unmatchedCount = newItems.filter((i) => !products.some((p) => p.id === i.productId)).length;

      setScanResult({
        token: Date.now(),
        matchedStoreId: matchedStore?.id || null,
        date: result.date || null,
        deliveryChargeInput: String(result.deliveryCharge || 0),
        taxInput: String(result.tax || 0),
        overallDiscountInput: String(result.discount || 0),
        items: newItems,
        receiptAttachment,
        storeNameForToast: result.storeName || 'the receipt',
        unmatchedCount
      });

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
      setIsScanningReceipt(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories, stores, addToast]);

  // Theme is a small per-account preference. It round-trips through the
  // Supabase user's metadata so it follows the account across devices,
  // rather than being cached on this device.
  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    const supabase = getSupabaseClient();
    if (supabase && user.id) {
      supabase.auth.updateUser({ data: { theme: mode } }).catch(() => {
        /* non-fatal: theme preference just won't round-trip this time */
      });
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeState === 'dark' || (themeState === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeState]);

  const clearAllData = () => {
    setExpenses([]);
    setProducts([]);
    setCategories([]);
    setStores([]);
    setShoppingLists([]);
    setEditingExpense(null);
    setActiveTabState('dashboard');
    try {
      sessionStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
    } catch {
      /* non-fatal */
    }
  };

  // Pulls every collection for the signed-in user from Supabase.
  const loadAllData = useCallback(async (mySessionToken: number) => {
    setAuthStatus('loadingData');
    const [cats, strs, prods, exps, lists] = await Promise.all([
      fetchCategoriesFromSupabase(),
      fetchStoresFromSupabase(),
      fetchProductsFromSupabase(),
      fetchExpensesFromSupabase(),
      fetchShoppingListsFromSupabase()
    ]);

    // A logout (or a newer login) happened while this fetch was in flight.
    if (mySessionToken !== sessionTokenRef.current) return;

    setCategories(cats || []);
    setStores(strs || []);
    setProducts(prods || []);
    setExpenses(exps || []);
    setShoppingLists(lists || []);

    if (cats === null || strs === null || prods === null || exps === null || lists === null) {
      addToast({
        title: 'Could not load some data',
        description: 'There was a problem reaching Supabase. Pull to refresh or try again shortly.',
        type: 'error'
      });
    }

    setAuthStatus('ready');
  }, [addToast]);

  const syncWithSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !user.id) return;
    await loadAllData(sessionTokenRef.current);
  }, [isSupabaseConfigured, user.id, loadAllData]);

  // Seeds a brand-new account with sensible starter categories/stores/products
  // so the app isn't completely empty on first login.
  const seedDefaultData = async () => {
    await Promise.all([
      ...DEFAULT_CATEGORIES.map((c) => saveCategoryToSupabase(c)),
      ...DEFAULT_STORES.map((s) => saveStoreToSupabase(s)),
      ...DEFAULT_PRODUCTS.map((p) => saveProductToSupabase(p))
    ]);
  };

  // Establish session on load + subscribe to auth changes.
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthStatus('signedOut');
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const session = data?.session;
      if (session?.user) {
        sessionTokenRef.current += 1;
        const token = sessionTokenRef.current;
        setUser(userFromSupabase(session.user));
        setThemeState((session.user.user_metadata?.theme as ThemeMode) || 'system');
        loadAllData(token);
      } else {
        setAuthStatus('signedOut');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionTokenRef.current += 1;
        setUser(EMPTY_USER);
        setThemeState('system');
        clearAllData();
        setAuthStatus('signedOut');
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
        setUser(userFromSupabase(session.user));
        if (event === 'SIGNED_IN') {
          sessionTokenRef.current += 1;
          const token = sessionTokenRef.current;
          setThemeState((session.user.user_metadata?.theme as ThemeMode) || 'system');
          loadAllData(token);
        }
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================
  // Expense CRUD
  // ==========================================================================
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newExpense: Expense = { ...expenseData, id, createdAt: now, updatedAt: now };

    const ok = await saveExpenseToSupabase(newExpense);
    if (!ok) {
      addToast({ title: 'Could not save expense', description: 'Please check your connection and try again.', type: 'error' });
      return;
    }

    setExpenses((prev) => [newExpense, ...prev]);

    // Auto-register any brand-new products, de-duplicating within this
    // single expense so two new items with the same product don't create
    // two product-master rows.
    const seenNewIds = new Set<string>();
    const newProducts: Product[] = [];
    newExpense.items.forEach((item) => {
      if (
        item.productId &&
        !products.some((p) => p.id === item.productId) &&
        !seenNewIds.has(item.productId)
      ) {
        seenNewIds.add(item.productId);
        newProducts.push({
          id: item.productId,
          name: item.productName,
          brand: item.brand || 'Generic',
          categoryId: item.categoryId || 'cat-others',
          defaultUnit: item.unit || 'pcs',
          isFavorite: false,
          isActive: true,
          createdAt: now
        });
      }
    });

    if (newProducts.length > 0) {
      const results = await Promise.all(newProducts.map((p) => saveProductToSupabase(p)));
      const savedProducts = newProducts.filter((_, idx) => results[idx]);
      if (savedProducts.length > 0) {
        setProducts((prev) => [...prev, ...savedProducts]);
      }
    }

    addToast({
      title: 'Expense Recorded!',
      description: `Saved ${newExpense.grandTotal.toFixed(2)} purchase at ${newExpense.storeName}`,
      type: 'success'
    });
  };

  const updateExpense = async (id: string, updatedFields: Partial<Expense>) => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) return;

    const updated: Expense = { ...existing, ...updatedFields, updatedAt: new Date().toISOString() };

    const ok = await saveExpenseToSupabase(updated);
    if (!ok) {
      addToast({ title: 'Could not update expense', description: 'Please check your connection and try again.', type: 'error' });
      return;
    }

    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    addToast({ title: 'Expense Updated', type: 'info' });
  };

  const deleteExpense = async (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    const ok = await deleteExpenseFromSupabase(id);
    if (!ok) {
      addToast({ title: 'Could not delete expense', description: 'Please check your connection and try again.', type: 'error' });
      return;
    }

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    addToast({
      title: 'Expense Deleted',
      description: `Removed purchase from ${target.storeName}`,
      type: 'info',
      undoAction: async () => {
        const restored = await saveExpenseToSupabase(target);
        if (restored) {
          setExpenses((prev) => [target, ...prev]);
          addToast({ title: 'Restored Expense', type: 'success' });
        } else {
          addToast({ title: 'Could not restore expense', type: 'error' });
        }
      }
    });
  };

  // ==========================================================================
  // Product CRUD
  // ==========================================================================
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = { ...prodData, id: `prod-${Date.now()}`, createdAt: new Date().toISOString() };
    const ok = await saveProductToSupabase(newProd);
    if (!ok) {
      addToast({ title: 'Could not save product', type: 'error' });
      return;
    }
    setProducts((prev) => [newProd, ...prev]);
    addToast({ title: 'Product Added', description: newProd.name, type: 'success' });
  };

  const updateProduct = async (id: string, fields: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...fields };
    const ok = await saveProductToSupabase(updated);
    if (!ok) {
      addToast({ title: 'Could not update product', type: 'error' });
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addToast({ title: 'Product Updated', type: 'info' });
  };

  const deleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const ok = await deleteProductFromSupabase(id);
    if (!ok) {
      addToast({ title: 'Could not delete product', type: 'error' });
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast({
      title: 'Product Deleted',
      description: target.name,
      type: 'info',
      undoAction: async () => {
        if (await saveProductToSupabase(target)) {
          setProducts((prev) => [...prev, target]);
        }
      }
    });
  };

  const toggleProductFavorite = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    const ok = await saveProductToSupabase(updated);
    if (!ok) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  // ==========================================================================
  // Category CRUD
  // ==========================================================================
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = { ...catData, id: `cat-${Date.now()}` };
    const ok = await saveCategoryToSupabase(newCat);
    if (!ok) {
      addToast({ title: 'Could not save category', type: 'error' });
      return;
    }
    setCategories((prev) => [...prev, newCat]);
    addToast({ title: 'Category Created', description: newCat.name, type: 'success' });
  };

  const updateCategory = async (id: string, fields: Partial<Category>) => {
    const existing = categories.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...fields };
    const ok = await saveCategoryToSupabase(updated);
    if (!ok) {
      addToast({ title: 'Could not update category', type: 'error' });
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCategory = async (id: string) => {
    const inUseByExpense = expenses.some((e) => e.items.some((i) => i.categoryId === id));
    const inUseByProduct = products.some((p) => p.categoryId === id);
    if (inUseByExpense || inUseByProduct) {
      addToast({
        title: 'Category In Use',
        description: 'Reassign products/expenses using this category before deleting it.',
        type: 'error'
      });
      return;
    }

    const ok = await deleteCategoryFromSupabase(id);
    if (!ok) {
      addToast({ title: 'Could not delete category', type: 'error' });
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast({ title: 'Category Removed', type: 'info' });
  };

  // ==========================================================================
  // Store CRUD
  // ==========================================================================
  const addStore = async (storeData: Omit<Store, 'id'>) => {
    const newStore: Store = { ...storeData, id: `store-${Date.now()}` };
    const ok = await saveStoreToSupabase(newStore);
    if (!ok) {
      addToast({ title: 'Could not save store', type: 'error' });
      return;
    }
    setStores((prev) => [...prev, newStore]);
    addToast({ title: 'Store Added', description: newStore.name, type: 'success' });
  };

  const updateStore = async (id: string, fields: Partial<Store>) => {
    const existing = stores.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...fields };
    const ok = await saveStoreToSupabase(updated);
    if (!ok) {
      addToast({ title: 'Could not update store', type: 'error' });
      return;
    }
    setStores((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const deleteStore = async (id: string) => {
    const inUse = expenses.some((e) => e.storeId === id);
    if (inUse) {
      addToast({
        title: 'Store In Use',
        description: 'This store is referenced by existing expenses and cannot be deleted.',
        type: 'error'
      });
      return;
    }

    const ok = await deleteStoreFromSupabase(id);
    if (!ok) {
      addToast({ title: 'Could not delete store', type: 'error' });
      return;
    }
    setStores((prev) => prev.filter((s) => s.id !== id));
    addToast({ title: 'Store Removed', type: 'info' });
  };

  const toggleStoreFavorite = async (id: string) => {
    const target = stores.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    const ok = await saveStoreToSupabase(updated);
    if (!ok) return;
    setStores((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  // ==========================================================================
  // Shopping List CRUD
  // ==========================================================================
  const addShoppingList = async (listData: Omit<ShoppingList, 'id' | 'createdAt'>) => {
    const newList: ShoppingList = { ...listData, id: `shop-${Date.now()}`, createdAt: new Date().toISOString() };
    const ok = await saveShoppingListToSupabase(newList);
    if (!ok) {
      addToast({ title: 'Could not save shopping list', type: 'error' });
      return;
    }
    setShoppingLists((prev) => [newList, ...prev]);
    addToast({ title: 'Shopping List Created', description: newList.title, type: 'success' });
  };

  const updateShoppingList = async (id: string, fields: Partial<ShoppingList>) => {
    const existing = shoppingLists.find((l) => l.id === id);
    if (!existing) return;
    const updated = { ...existing, ...fields };
    const ok = await saveShoppingListToSupabase(updated);
    if (!ok) {
      addToast({ title: 'Could not update shopping list', type: 'error' });
      return;
    }
    setShoppingLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const deleteShoppingList = async (id: string) => {
    const ok = await deleteShoppingListFromSupabase(id);
    if (!ok) {
      addToast({ title: 'Could not delete shopping list', type: 'error' });
      return;
    }
    setShoppingLists((prev) => prev.filter((l) => l.id !== id));
    addToast({ title: 'Shopping List Deleted', type: 'info' });
  };

  const toggleShoppingItemComplete = async (listId: string, itemId: string) => {
    const list = shoppingLists.find((l) => l.id === listId);
    if (!list) return;
    const updatedItems = list.items.map((i) => (i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i));
    const allDone = updatedItems.every((i) => i.isCompleted);
    const updated = { ...list, items: updatedItems, isCompleted: allDone };

    const ok = await saveShoppingListToSupabase(updated);
    if (!ok) return;
    setShoppingLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
  };

  const convertShoppingListToExpense = async (
    listId: string,
    storeId: string,
    platform: PlatformType,
    paymentMethod: PaymentMethod
  ) => {
    const list = shoppingLists.find((l) => l.id === listId);
    if (!list) return;

    const store = stores.find((s) => s.id === storeId) || stores[0];

    const items = list.items.map((si, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: si.productId || `prod-custom-${Date.now()}-${idx}`,
      productName: si.productName,
      categoryId: si.categoryId || 'cat-others',
      brand: 'Generic',
      quantity: si.quantity,
      unit: si.unit,
      unitPrice: si.estimatedPrice || 3.0,
      discount: 0,
      totalPrice: (si.quantity || 1) * (si.estimatedPrice || 3.0),
      notes: si.notes
    }));

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    await addExpense({
      storeId: store?.id || '',
      storeName: store?.name || 'Unknown Store',
      platform,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod,
      notes: `Converted from shopping list: ${list.title}`,
      receipts: [],
      tags: ['from-shopping-list'],
      items,
      subtotal,
      discount: 0,
      deliveryCharge: 0,
      tax: 0,
      grandTotal: subtotal
    });

    await deleteShoppingList(listId);
  };

  // ==========================================================================
  // Auth
  // ==========================================================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sign in.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Sign in failed. Please try again.' };

      addToast({ title: 'Welcome back!', description: userFromSupabase(data.user).name, type: 'success' });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sign in' };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    householdName?: string,
    currency?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to create an account.' };
    }

    const userCurrency = currency || '₹';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            household_name: householdName || `${name}'s Household`,
            currency: userCurrency,
            theme: 'system'
          }
        }
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Registration failed. Please try again.' };

      if (!data.session) {
        // Email confirmation is required before a session exists — data
        // seeding happens on first real sign-in instead.
        return {
          success: true,
          message: 'Registration successful! Please check your email to verify your account before signing in.'
        };
      }

      await seedDefaultData();
      addToast({ title: 'Account Created!', description: `Welcome ${name}`, type: 'success' });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signout error:', err);
      }
    }
    // State reset happens via the onAuthStateChange SIGNED_OUT handler.
    addToast({ title: 'Logged Out', description: 'Signed out of active session', type: 'info' });
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset instructions sent to ${email}` };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send reset email' };
    }
  };

  const updateProfile = async (details: { name: string; email: string; householdName?: string; currency?: string }) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: details.email,
        data: {
          full_name: details.name,
          household_name: details.householdName,
          currency: details.currency || user.currency
        }
      });

      if (error) {
        addToast({ title: 'Could not update profile', description: error.message, type: 'error' });
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(userFromSupabase(data.user));
      }

      addToast({ title: 'Profile Saved', description: 'Updated account details', type: 'success' });
      return { success: true };
    } catch (err: any) {
      addToast({ title: 'Could not update profile', description: err.message, type: 'error' });
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  const removeAllDemoData = async () => {
    const results = await Promise.all([
      ...expenses.map((e) => deleteExpenseFromSupabase(e.id)),
      ...products.map((p) => deleteProductFromSupabase(p.id)),
      ...shoppingLists.map((l) => deleteShoppingListFromSupabase(l.id))
    ]);
    if (results.every(Boolean)) {
      setExpenses([]);
      setProducts([]);
      setShoppingLists([]);
      addToast({
        title: 'Demo Data Removed!',
        description: 'All sample records cleared. Ready for your real data!',
        type: 'success'
      });
    } else {
      addToast({ title: 'Some records could not be removed', description: 'Please try again.', type: 'error' });
      await syncWithSupabase();
    }
  };

  const resetToDemoData = async () => {
    await Promise.all([
      ...DEFAULT_CATEGORIES.map((c) => saveCategoryToSupabase(c)),
      ...DEFAULT_STORES.map((s) => saveStoreToSupabase(s)),
      ...DEFAULT_PRODUCTS.map((p) => saveProductToSupabase(p))
    ]);
    await syncWithSupabase();
    addToast({ title: 'Demo Data Restored', description: 'Sample categories, stores & products added back', type: 'info' });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme: themeState,
        setTheme,
        activeTab,
        setActiveTab,
        expenses,
        products,
        categories,
        stores,
        platforms,
        shoppingLists,
        filters,
        setFilters,
        resetFilters,
        selectedExpenseForModal,
        setSelectedExpenseForModal,
        editingExpense,
        setEditingExpense,
        selectedProductForModal,
        setSelectedProductForModal,
        selectedReceiptForModal,
        setSelectedReceiptForModal,
        toasts,
        addToast,
        removeToast,
        addExpense,
        updateExpense,
        deleteExpense,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductFavorite,
        addCategory,
        updateCategory,
        deleteCategory,
        addStore,
        updateStore,
        deleteStore,
        toggleStoreFavorite,
        addShoppingList,
        updateShoppingList,
        deleteShoppingList,
        toggleShoppingItemComplete,
        convertShoppingListToExpense,
        isSupabaseConfigured,
        isAuthenticated: authStatus === 'ready' || authStatus === 'loadingData',
        authStatus,
        isDataLoading: authStatus === 'loadingData',
        syncWithSupabase,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        removeAllDemoData,
        resetToDemoData,
        isScanningReceipt,
        scanResult,
        scanReceiptForNewExpense,
        clearScanResult
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
