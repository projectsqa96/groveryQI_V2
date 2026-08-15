import { Category, Store, Platform, Product, Expense, ShoppingList, UserProfile } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-veg', name: 'Vegetables', icon: 'Carrot', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', isDefault: true },
  { id: 'cat-fruit', name: 'Fruits', icon: 'Apple', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30', isDefault: true },
  { id: 'cat-chicken', name: 'Chicken', icon: 'Drumstick', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', isDefault: true },
  { id: 'cat-fish', name: 'Fish', icon: 'Fish', color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30', isDefault: true },
  { id: 'cat-meat', name: 'Meat', icon: 'Beef', color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30', isDefault: true },
  { id: 'cat-eggs', name: 'Eggs', icon: 'Egg', color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30', isDefault: true },
  { id: 'cat-milk', name: 'Milk & Dairy', icon: 'Milk', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30', isDefault: true },
  { id: 'cat-bakery', name: 'Bakery', icon: 'Croissant', color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30', isDefault: true },
  { id: 'cat-rice', name: 'Rice & Grains', icon: 'Wheat', color: 'bg-amber-600/15 text-amber-800 dark:text-amber-300 border-amber-600/30', isDefault: true },
  { id: 'cat-oil', name: 'Oil & Ghee', icon: 'Droplet', color: 'bg-yellow-600/15 text-yellow-800 dark:text-yellow-300 border-yellow-600/30', isDefault: true },
  { id: 'cat-spices', name: 'Spices & Masala', icon: 'Flame', color: 'bg-red-600/15 text-red-800 dark:text-red-300 border-red-600/30', isDefault: true },
  { id: 'cat-frozen', name: 'Frozen Foods', icon: 'Snowflake', color: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30', isDefault: true },
  { id: 'cat-snacks', name: 'Snacks', icon: 'Cookie', color: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30', isDefault: true },
  { id: 'cat-beverages', name: 'Beverages', icon: 'Coffee', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30', isDefault: true },
  { id: 'cat-cleaning', name: 'Cleaning & Household', icon: 'Sparkles', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30', isDefault: true },
  { id: 'cat-toiletries', name: 'Toiletries & Care', icon: 'Bath', color: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/30', isDefault: true },
  { id: 'cat-medicine', name: 'Medicine & Health', icon: 'Pill', color: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-600/30', isDefault: true },
  { id: 'cat-pet', name: 'Pet Food', icon: 'Dog', color: 'bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30', isDefault: true },
  { id: 'cat-others', name: 'Others', icon: 'ShoppingBag', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30', isDefault: true }
];

export const DEFAULT_STORES: Store[] = [
  { id: 'store-local', name: 'Local Farmers Market', type: 'Offline', address: 'Main Street Fresh Bazaar', isFavorite: true, notes: 'Fresh organic veggies & local produce' },
  { id: 'store-lulu', name: 'Lulu Hypermarket', type: 'Hybrid', address: 'Mall Avenue, Floor 1', isFavorite: true, notes: 'Great international produce and weekly deals' },
  { id: 'store-reliance', name: 'Reliance Fresh', type: 'Offline', address: 'Sector 14 Superplex', isFavorite: false },
  { id: 'store-dmart', name: 'D Mart', type: 'Offline', address: 'Highway Junction Hub', isFavorite: true, notes: 'Best bulk grocery discount pricing' },
  { id: 'store-more', name: 'More Supermarket', type: 'Offline', address: 'Suburban Center' },
  { id: 'store-instamart', name: 'Swiggy Instamart', type: 'Online', isFavorite: true, notes: '10-minute quick delivery app' },
  { id: 'store-blinkit', name: 'Blinkit', type: 'Online', isFavorite: true, notes: 'Instant groceries & household items' },
  { id: 'store-bigbasket', name: 'BigBasket', type: 'Online', isFavorite: true, notes: 'Scheduled slotted grocery delivery' },
  { id: 'store-amazon', name: 'Amazon Fresh', type: 'Online', isFavorite: false },
  { id: 'store-flipkart', name: 'Flipkart Grocery', type: 'Online', isFavorite: false }
];

export const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'plat-offline', name: 'Offline', isOnline: false },
  { id: 'plat-instamart', name: 'Instamart', isOnline: true },
  { id: 'plat-blinkit', name: 'Blinkit', isOnline: true },
  { id: 'plat-bigbasket', name: 'BigBasket', isOnline: true },
  { id: 'plat-amazon', name: 'Amazon Fresh', isOnline: true },
  { id: 'plat-swiggy', name: 'Swiggy', isOnline: true },
  { id: 'plat-zomato', name: 'Zomato', isOnline: true },
  { id: 'plat-flipkart', name: 'Flipkart Grocery', isOnline: true },
  { id: 'plat-others', name: 'Others', isOnline: false }
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-milk-full', name: 'Full Cream Fresh Milk', brand: 'Amul Gold', categoryId: 'cat-milk', defaultUnit: 'L', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z', notes: 'Daily requirement 1L' },
  { id: 'prod-eggs-farm', name: 'Organic Farm Fresh Eggs (12 pack)', brand: 'Eggoz', categoryId: 'cat-eggs', defaultUnit: 'pcs', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-tomato', name: 'Vine Ripe Tomatoes', brand: 'Farm Fresh', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-onion', name: 'Red Onions', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-basmati', name: 'Royal Basmati Rice 5kg', brand: 'India Gate', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-olive-oil', name: 'Extra Virgin Olive Oil 1L', brand: 'Borges', categoryId: 'cat-oil', defaultUnit: 'L', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-chicken-breast', name: 'Boneless Chicken Breast 500g', brand: 'Licious', categoryId: 'cat-chicken', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-apples', name: 'Royal Gala Apples', brand: 'Washington', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-whole-wheat-bread', name: 'Multigrain Whole Wheat Bread', brand: 'Modern Bakery', categoryId: 'cat-bakery', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-greek-yogurt', name: 'Greek Yogurt Blueberry 100g', brand: 'Epigamia', categoryId: 'cat-milk', defaultUnit: 'pcs', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-dark-chocolate', name: '70% Dark Cocoa Chocolate', brand: 'Amul', categoryId: 'cat-snacks', defaultUnit: 'pcs', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-green-tea', name: 'Organic Green Tea 100 Bags', brand: 'Twinings', categoryId: 'cat-beverages', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-dish-soap', name: 'Lemon Dishwash Liquid 750ml', brand: 'Vim', categoryId: 'cat-cleaning', defaultUnit: 'pcs', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },

  // --- Kerala Market Vegetables ---
  { id: 'prod-kl-nendran', name: 'Nendran Banana (Plantain)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z', notes: 'For chips, halwa & curries' },
  { id: 'prod-kl-yam', name: 'Elephant Yam (Chena)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-chembu', name: 'Colocasia (Chembu)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-tapioca', name: 'Tapioca (Kappa)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-snakegourd', name: 'Snake Gourd (Padavalanga)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-bittergourd', name: 'Bitter Gourd (Pavakka)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-ashgourd', name: 'Ash Gourd (Kumbalanga)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-ladiesfinger', name: 'Ladies Finger / Okra (Vendakka)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-drumstick', name: 'Drumstick (Muringakka)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-cucumber', name: 'Cucumber (Vellarikka)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-longbeans', name: 'Long Beans (Payar)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-frenchbeans', name: 'French Beans', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-carrot', name: 'Carrot', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-beetroot', name: 'Beetroot', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-cabbage', name: 'Cabbage', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-cauliflower', name: 'Cauliflower', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-potato', name: 'Potato', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-shallots', name: 'Shallots / Sambar Onion (Kunjulli)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-garlic', name: 'Garlic', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-ginger', name: 'Ginger', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-greenchilli', name: 'Green Chilli', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-curryleaves', name: 'Curry Leaves', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-coriander', name: 'Coriander Leaves', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-rawbanana', name: 'Raw Banana (Kaya)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-pumpkin', name: 'Pumpkin (Mathanga)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-ridgegourd', name: 'Ridge Gourd (Peechinga)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-brinjal', name: 'Brinjal / Eggplant (Vazhuthananga)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },

  // --- Kerala Market Fruits ---
  { id: 'prod-kl-robusta', name: 'Robusta Banana', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'dozen', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-poovan', name: 'Poovan Banana', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'dozen', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-njalipoovan', name: 'Njalipoovan Banana', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'dozen', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-coconut', name: 'Coconut', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'pcs', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-jackfruit', name: 'Jackfruit (Chakka)', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-mango', name: 'Mango (Naadan)', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-pineapple', name: 'Pineapple (Vazhakulam)', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'pcs', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-papaya', name: 'Papaya', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-watermelon', name: 'Watermelon', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-guava', name: 'Guava', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-sapota', name: 'Sapota (Chikoo)', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-grapes', name: 'Grapes', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-orange', name: 'Orange', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-pomegranate', name: 'Pomegranate', brand: 'Local', categoryId: 'cat-fruit', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },

  // --- Kerala Grocery Staples, Spices & Rice ---
  { id: 'prod-kl-mattarice', name: 'Kerala Matta Rice (Red Rice)', brand: 'Local', categoryId: 'cat-rice', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-ponnirice', name: 'Ponni Rice', brand: 'Local', categoryId: 'cat-rice', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-idlirice', name: 'Idli Rice', brand: 'Local', categoryId: 'cat-rice', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-rava', name: 'Rava / Semolina', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-vermicelli', name: 'Vermicelli (Semiya)', brand: 'Bambino', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-atta', name: 'Wheat Flour (Atta)', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-uraddal', name: 'Urad Dal', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-toordal', name: 'Toor Dal', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-moongdal', name: 'Moong Dal', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-chanadal', name: 'Chana Dal', brand: 'Generic', categoryId: 'cat-rice', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-coconutoil', name: 'Coconut Oil', brand: 'Nirmal / Parachute', categoryId: 'cat-oil', defaultUnit: 'L', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z', notes: 'Everyday Kerala cooking oil' },
  { id: 'prod-kl-gingellyoil', name: 'Gingelly / Sesame Oil', brand: 'Generic', categoryId: 'cat-oil', defaultUnit: 'L', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-gratedcoconut', name: 'Grated Coconut (Fresh)', brand: 'Local', categoryId: 'cat-veg', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-coconutmilk', name: 'Coconut Milk (Tin)', brand: 'Maggi', categoryId: 'cat-milk', defaultUnit: 'pcs', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-jaggery', name: 'Jaggery (Sharkkara)', brand: 'Local', categoryId: 'cat-spices', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-tamarind', name: 'Tamarind (Puli)', brand: 'Generic', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-sambarpowder', name: 'Sambar Powder', brand: 'Eastern', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-meatmasala', name: 'Meat Masala', brand: 'Eastern', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-fishmasala', name: 'Fish Curry Masala', brand: 'Eastern', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-garammasala', name: 'Garam Masala', brand: 'Eastern', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-mustard', name: 'Mustard Seeds', brand: 'Generic', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-fenugreek', name: 'Fenugreek Seeds (Uluva)', brand: 'Generic', categoryId: 'cat-spices', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-coffee', name: 'Filter Coffee Powder', brand: 'Narasus', categoryId: 'cat-beverages', defaultUnit: 'pack', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-blacktea', name: 'Black Tea Powder', brand: 'Wagh Bakri', categoryId: 'cat-beverages', defaultUnit: 'pack', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },

  // --- Kerala Fish, Meat & Poultry ---
  { id: 'prod-kl-sardine', name: 'Sardine (Mathi)', brand: 'Local', categoryId: 'cat-fish', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-mackerel', name: 'Mackerel (Ayala)', brand: 'Local', categoryId: 'cat-fish', defaultUnit: 'kg', isFavorite: true, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-prawns', name: 'Prawns (Chemmeen)', brand: 'Local', categoryId: 'cat-fish', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'prod-kl-beef', name: 'Beef', brand: 'Local', categoryId: 'cat-meat', defaultUnit: 'kg', isFavorite: false, isActive: true, createdAt: '2026-05-01T00:00:00Z' }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-101',
  email: 'alex.rivera@example.com',
  name: 'Alex Rivera',
  currency: '$',
  preferredTheme: 'system',
  householdName: 'Rivera Household'
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-2026-08-03-01',
    storeId: 'store-local',
    storeName: 'Local Farmers Market',
    platform: 'Offline',
    date: '2026-08-03',
    time: '10:30',
    paymentMethod: 'UPI',
    notes: 'Weekly fresh vegetables and organic eggs',
    tags: ['Weekly Staples', 'Organic'],
    receipts: [
      { id: 'att-1', name: 'receipt_farmers_market_aug3.jpg', url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80', type: 'image' }
    ],
    items: [
      { id: 'item-1', productId: 'prod-tomato', productName: 'Vine Ripe Tomatoes', categoryId: 'cat-veg', brand: 'Farm Fresh', quantity: 2, unit: 'kg', unitPrice: 3.50, discount: 0, totalPrice: 7.00 },
      { id: 'item-2', productId: 'prod-onion', productName: 'Red Onions', categoryId: 'cat-veg', brand: 'Local', quantity: 3, unit: 'kg', unitPrice: 2.20, discount: 0, totalPrice: 6.60 },
      { id: 'item-3', productId: 'prod-eggs-farm', productName: 'Organic Farm Fresh Eggs (12 pack)', categoryId: 'cat-eggs', brand: 'Eggoz', quantity: 2, unit: 'pcs', unitPrice: 4.80, discount: 0, totalPrice: 9.60 }
    ],
    subtotal: 23.20,
    discount: 1.20,
    deliveryCharge: 0,
    tax: 0.00,
    grandTotal: 22.00,
    createdAt: '2026-08-03T10:30:00Z',
    updatedAt: '2026-08-03T10:30:00Z'
  },
  {
    id: 'exp-2026-08-01-02',
    storeId: 'store-instamart',
    storeName: 'Swiggy Instamart',
    platform: 'Instamart',
    date: '2026-08-01',
    time: '18:45',
    paymentMethod: 'Credit Card',
    notes: 'Quick evening restock',
    tags: ['Express Delivery'],
    receipts: [],
    items: [
      { id: 'item-4', productId: 'prod-milk-full', productName: 'Full Cream Fresh Milk', categoryId: 'cat-milk', brand: 'Amul Gold', quantity: 2, unit: 'L', unitPrice: 2.80, discount: 0, totalPrice: 5.60 },
      { id: 'item-5', productId: 'prod-whole-wheat-bread', productName: 'Multigrain Whole Wheat Bread', categoryId: 'cat-bakery', brand: 'Modern Bakery', quantity: 1, unit: 'pack', unitPrice: 2.50, discount: 0, totalPrice: 2.50 },
      { id: 'item-6', productId: 'prod-greek-yogurt', productName: 'Greek Yogurt Blueberry 100g', categoryId: 'cat-milk', brand: 'Epigamia', quantity: 4, unit: 'pcs', unitPrice: 1.75, discount: 0, totalPrice: 7.00 }
    ],
    subtotal: 15.10,
    discount: 2.00,
    deliveryCharge: 1.50,
    tax: 0.80,
    grandTotal: 15.40,
    createdAt: '2026-08-01T18:45:00Z',
    updatedAt: '2026-08-01T18:45:00Z'
  },
  {
    id: 'exp-2026-07-28-03',
    storeId: 'store-dmart',
    storeName: 'D Mart',
    platform: 'Offline',
    date: '2026-07-28',
    time: '16:00',
    paymentMethod: 'Debit Card',
    notes: 'Monthly bulk pantry refill',
    tags: ['Monthly Bulk', 'Pantry'],
    receipts: [],
    items: [
      { id: 'item-7', productId: 'prod-basmati', productName: 'Royal Basmati Rice 5kg', categoryId: 'cat-rice', brand: 'India Gate', quantity: 2, unit: 'pack', unitPrice: 18.50, discount: 2.00, totalPrice: 35.00 },
      { id: 'item-8', productId: 'prod-olive-oil', productName: 'Extra Virgin Olive Oil 1L', categoryId: 'cat-oil', brand: 'Borges', quantity: 1, unit: 'L', unitPrice: 14.00, discount: 1.50, totalPrice: 12.50 },
      { id: 'item-9', productId: 'prod-green-tea', productName: 'Organic Green Tea 100 Bags', categoryId: 'cat-beverages', brand: 'Twinings', quantity: 1, unit: 'pack', unitPrice: 9.80, discount: 0, totalPrice: 9.80 },
      { id: 'item-10', productId: 'prod-dish-soap', productName: 'Lemon Dishwash Liquid 750ml', categoryId: 'cat-cleaning', brand: 'Vim', quantity: 2, unit: 'pcs', unitPrice: 3.20, discount: 0, totalPrice: 6.40 }
    ],
    subtotal: 67.20,
    discount: 5.00,
    deliveryCharge: 0,
    tax: 2.30,
    grandTotal: 64.50,
    createdAt: '2026-07-28T16:00:00Z',
    updatedAt: '2026-07-28T16:00:00Z'
  },
  {
    id: 'exp-2026-07-20-04',
    storeId: 'store-lulu',
    storeName: 'Lulu Hypermarket',
    platform: 'Offline',
    date: '2026-07-20',
    time: '12:15',
    paymentMethod: 'Credit Card',
    notes: 'Weekend premium meats and fresh fruit selection',
    tags: ['Weekend Gourmet'],
    receipts: [],
    items: [
      { id: 'item-11', productId: 'prod-chicken-breast', productName: 'Boneless Chicken Breast 500g', categoryId: 'cat-chicken', brand: 'Licious', quantity: 3, unit: 'pack', unitPrice: 6.50, discount: 0, totalPrice: 19.50 },
      { id: 'item-12', productId: 'prod-apples', productName: 'Royal Gala Apples', categoryId: 'cat-fruit', brand: 'Washington', quantity: 2.5, unit: 'kg', unitPrice: 4.20, discount: 0, totalPrice: 10.50 },
      { id: 'item-13', productId: 'prod-dark-chocolate', productName: '70% Dark Cocoa Chocolate', categoryId: 'cat-snacks', brand: 'Amul', quantity: 3, unit: 'pcs', unitPrice: 2.10, discount: 0, totalPrice: 6.30 }
    ],
    subtotal: 36.30,
    discount: 3.00,
    deliveryCharge: 0,
    tax: 1.20,
    grandTotal: 34.50,
    createdAt: '2026-07-20T12:15:00Z',
    updatedAt: '2026-07-20T12:15:00Z'
  },
  {
    id: 'exp-2026-07-10-05',
    storeId: 'store-blinkit',
    storeName: 'Blinkit',
    platform: 'Blinkit',
    date: '2026-07-10',
    time: '09:10',
    paymentMethod: 'UPI',
    notes: 'Emergency breakfast run',
    tags: ['Express Delivery'],
    receipts: [],
    items: [
      { id: 'item-14', productId: 'prod-milk-full', productName: 'Full Cream Fresh Milk', categoryId: 'cat-milk', brand: 'Amul Gold', quantity: 2, unit: 'L', unitPrice: 2.70, discount: 0, totalPrice: 5.40 },
      { id: 'item-15', productId: 'prod-eggs-farm', productName: 'Organic Farm Fresh Eggs (12 pack)', categoryId: 'cat-eggs', brand: 'Eggoz', quantity: 1, unit: 'pcs', unitPrice: 4.60, discount: 0, totalPrice: 4.60 },
      { id: 'item-16', productId: 'prod-whole-wheat-bread', productName: 'Multigrain Whole Wheat Bread', categoryId: 'cat-bakery', brand: 'Modern Bakery', quantity: 1, unit: 'pack', unitPrice: 2.40, discount: 0, totalPrice: 2.40 }
    ],
    subtotal: 12.40,
    discount: 1.00,
    deliveryCharge: 1.00,
    tax: 0.50,
    grandTotal: 12.90,
    createdAt: '2026-07-10T09:10:00Z',
    updatedAt: '2026-07-10T09:10:00Z'
  },
  {
    id: 'exp-2026-06-25-06',
    storeId: 'store-bigbasket',
    storeName: 'BigBasket',
    platform: 'BigBasket',
    date: '2026-06-25',
    time: '14:20',
    paymentMethod: 'Net Banking',
    notes: 'Mid-month pantry restock offer',
    tags: ['Online Discount'],
    receipts: [],
    items: [
      { id: 'item-17', productId: 'prod-olive-oil', productName: 'Extra Virgin Olive Oil 1L', categoryId: 'cat-oil', brand: 'Borges', quantity: 1, unit: 'L', unitPrice: 13.50, discount: 0, totalPrice: 13.50 },
      { id: 'item-18', productId: 'prod-tomato', productName: 'Vine Ripe Tomatoes', categoryId: 'cat-veg', brand: 'Farm Fresh', quantity: 3, unit: 'kg', unitPrice: 3.20, discount: 0, totalPrice: 9.60 },
      { id: 'item-19', productId: 'prod-chicken-breast', productName: 'Boneless Chicken Breast 500g', categoryId: 'cat-chicken', brand: 'Licious', quantity: 2, unit: 'pack', unitPrice: 6.20, discount: 0, totalPrice: 12.40 }
    ],
    subtotal: 35.50,
    discount: 4.50,
    deliveryCharge: 0,
    tax: 1.00,
    grandTotal: 32.00,
    createdAt: '2026-06-25T14:20:00Z',
    updatedAt: '2026-06-25T14:20:00Z'
  }
];

export const INITIAL_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: 'shop-1',
    title: 'Weekend Grocery Run',
    date: '2026-08-08',
    storeId: 'store-lulu',
    isCompleted: false,
    createdAt: '2026-08-03T14:00:00Z',
    items: [
      { id: 'sitem-1', productName: 'Full Cream Fresh Milk', productId: 'prod-milk-full', categoryId: 'cat-milk', quantity: 3, unit: 'L', estimatedPrice: 8.40, isCompleted: true },
      { id: 'sitem-2', productName: 'Royal Gala Apples', productId: 'prod-apples', categoryId: 'cat-fruit', quantity: 2, unit: 'kg', estimatedPrice: 8.40, isCompleted: false },
      { id: 'sitem-3', productName: 'Organic Farm Fresh Eggs (12 pack)', productId: 'prod-eggs-farm', categoryId: 'cat-eggs', quantity: 2, unit: 'pcs', estimatedPrice: 9.60, isCompleted: false },
      { id: 'sitem-4', productName: 'Boneless Chicken Breast 500g', productId: 'prod-chicken-breast', categoryId: 'cat-chicken', quantity: 2, unit: 'pack', estimatedPrice: 13.00, isCompleted: false }
    ]
  },
  {
    id: 'shop-2',
    title: 'Monthly Pantry & Household Bulk',
    date: '2026-08-15',
    storeId: 'store-dmart',
    isCompleted: false,
    createdAt: '2026-08-01T09:00:00Z',
    items: [
      { id: 'sitem-5', productName: 'Royal Basmati Rice 5kg', productId: 'prod-basmati', categoryId: 'cat-rice', quantity: 2, unit: 'pack', estimatedPrice: 35.00, isCompleted: false },
      { id: 'sitem-6', productName: 'Extra Virgin Olive Oil 1L', productId: 'prod-olive-oil', categoryId: 'cat-oil', quantity: 1, unit: 'L', estimatedPrice: 14.00, isCompleted: false },
      { id: 'sitem-7', productName: 'Lemon Dishwash Liquid 750ml', productId: 'prod-dish-soap', categoryId: 'cat-cleaning', quantity: 3, unit: 'pcs', estimatedPrice: 9.60, isCompleted: false }
    ]
  }
];
