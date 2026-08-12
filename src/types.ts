export type ThemeMode = 'light' | 'dark' | 'system';

export type PaymentMethod = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet';

export type PlatformType = 'Offline' | 'Instamart' | 'Blinkit' | 'BigBasket' | 'Amazon Fresh' | 'Swiggy' | 'Zomato' | 'Flipkart Grocery' | 'Others';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  isDefault?: boolean;
}

export interface Store {
  id: string;
  name: string;
  type: 'Offline' | 'Online' | 'Hybrid';
  logo?: string;
  address?: string;
  locationUrl?: string;
  notes?: string;
  isFavorite?: boolean;
}

export interface Platform {
  id: string;
  name: PlatformType;
  icon?: string;
  isOnline: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  defaultUnit: string; // e.g. 'kg', 'g', 'L', 'ml', 'pcs', 'pack'
  image?: string;
  notes?: string;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  productId: string;
  productName: string;
  categoryId: string;
  brand: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number; // percentage or fixed amount
  totalPrice: number;
  notes?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf';
  size?: number;
}

export interface Expense {
  id: string;
  storeId: string;
  storeName: string;
  platform: PlatformType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  receipts: Attachment[];
  tags: string[];
  items: ExpenseItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPriceRecord {
  id: string;
  productId: string;
  productName: string;
  expenseId: string;
  date: string;
  storeId: string;
  storeName: string;
  platform: PlatformType;
  unitPrice: number;
  quantity: number;
  unit: string;
}

export interface ShoppingListItem {
  id: string;
  productName: string;
  productId?: string;
  categoryId: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  isCompleted: boolean;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  date: string;
  storeId?: string;
  items: ShoppingListItem[];
  isCompleted: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  currency: string;
  preferredTheme: ThemeMode;
  householdName?: string;
}

export interface FilterOptions {
  searchQuery: string;
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  stores: string[];
  platforms: PlatformType[];
  paymentMethods: PaymentMethod[];
  minPrice: number | null;
  maxPrice: number | null;
  tag: string | null;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  undoAction?: () => void;
}
