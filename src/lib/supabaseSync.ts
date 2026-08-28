import { getSupabaseClient } from './supabase';
import { Expense, Product, Category, Store, ShoppingList } from '../types';

const getUserId = async (): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
};

// ============================================================================
// CATEGORIES
// ============================================================================
export const fetchCategoriesFromSupabase = async (): Promise<Category[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.warn('Supabase categories fetch warning:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '',
      color: c.color || '',
      isDefault: c.is_default || false,
    }));
  } catch (err) {
    console.error('Error fetching categories from Supabase:', err);
    return null;
  }
};

export const saveCategoryToSupabase = async (category: Category): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('categories').upsert({
      id: category.id,
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_default: category.isDefault || false,
    });
    if (error) {
      console.warn('Supabase category save warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save category to Supabase:', err);
    return false;
  }
};

export const deleteCategoryFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.warn('Supabase category delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete category from Supabase:', err);
    return false;
  }
};

// ============================================================================
// STORES
// ============================================================================
export const fetchStoresFromSupabase = async (): Promise<Store[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('stores').select('*').order('name');
    if (error) {
      console.warn('Supabase stores fetch warning:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type || 'Offline',
      logo: s.logo_url || undefined,
      address: s.address || undefined,
      locationUrl: s.location_url || undefined,
      notes: s.notes || undefined,
      isFavorite: s.is_favorite || false,
    }));
  } catch (err) {
    console.error('Error fetching stores from Supabase:', err);
    return null;
  }
};

export const saveStoreToSupabase = async (store: Store): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('stores').upsert({
      id: store.id,
      user_id: userId,
      name: store.name,
      type: store.type,
      logo_url: store.logo || null,
      address: store.address || null,
      location_url: store.locationUrl || null,
      notes: store.notes || null,
      is_favorite: store.isFavorite || false,
    });
    if (error) {
      console.warn('Supabase store save warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save store to Supabase:', err);
    return false;
  }
};

export const deleteStoreFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) {
      console.warn('Supabase store delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete store from Supabase:', err);
    return false;
  }
};

// ============================================================================
// PRODUCTS
// ============================================================================
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase products fetch warning:', error.message);
      return null;
    }
    if (!data) return [];
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand || '',
      categoryId: p.category_id || 'cat-others',
      defaultUnit: p.default_unit || 'pcs',
      image: p.image_url || undefined,
      notes: p.notes || undefined,
      isFavorite: p.is_favorite || false,
      isActive: p.is_active ?? true,
      createdAt: p.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return null;
  }
};

export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      user_id: userId,
      name: product.name,
      brand: product.brand,
      category_id: product.categoryId,
      default_unit: product.defaultUnit,
      image_url: product.image || null,
      notes: product.notes || null,
      is_favorite: product.isFavorite || false,
      is_active: product.isActive ?? true,
      created_at: product.createdAt,
    });
    if (error) {
      console.warn('Supabase product save warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save product to Supabase:', err);
    return false;
  }
};

export const deleteProductFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.warn('Supabase product delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete product from Supabase:', err);
    return false;
  }
};

// ============================================================================
// EXPENSES (+ items, attachments, tags)
// ============================================================================
export const fetchExpensesFromSupabase = async (): Promise<Expense[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: expensesData, error: expError } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (expError) {
      console.warn('Supabase expenses query error:', expError.message);
      return null;
    }

    if (!expensesData || expensesData.length === 0) return [];

    const expenseIds = expensesData.map((row) => row.id);

    // Fetch all child rows in three bulk queries instead of N+1 per expense.
    const [{ data: allItems }, { data: allReceipts }, { data: allTags }] = await Promise.all([
      supabase.from('expense_items').select('*').in('expense_id', expenseIds),
      supabase.from('attachments').select('*').in('expense_id', expenseIds),
      supabase.from('expense_tags').select('*').in('expense_id', expenseIds),
    ]);

    const expenses: Expense[] = expensesData.map((row) => {
      const items = (allItems || []).filter((i) => i.expense_id === row.id);
      const receipts = (allReceipts || []).filter((r) => r.expense_id === row.id);
      const tags = (allTags || []).filter((t) => t.expense_id === row.id);

      return {
        id: row.id,
        storeId: row.store_id || '',
        storeName: row.store_name,
        platform: row.platform,
        date: row.date,
        time: row.time || '12:00',
        paymentMethod: row.payment_method,
        notes: row.notes || '',
        tags: tags.map((t) => t.tag_name),
        receipts: receipts.map((r) => ({
          id: r.id,
          name: r.name,
          url: r.url,
          type: r.file_type || 'image',
          size: r.size || undefined,
        })),
        items: items.map((i) => ({
          id: i.id,
          productId: i.product_id || '',
          productName: i.product_name,
          categoryId: i.category_id || 'cat-others',
          brand: i.brand || '',
          quantity: Number(i.quantity),
          unit: i.unit || 'pcs',
          unitPrice: Number(i.unit_price),
          discount: Number(i.discount || 0),
          totalPrice: Number(i.total_price),
          notes: i.notes || '',
        })),
        subtotal: Number(row.subtotal),
        discount: Number(row.discount || 0),
        deliveryCharge: Number(row.delivery_charge || 0),
        tax: Number(row.tax || 0),
        grandTotal: Number(row.grand_total),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return expenses;
  } catch (err) {
    console.error('Error syncing expenses from Supabase:', err);
    return null;
  }
};

export const saveExpenseToSupabase = async (expense: Expense): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error: expErr } = await supabase.from('expenses').upsert({
      id: expense.id,
      user_id: userId,
      store_id: expense.storeId || null,
      store_name: expense.storeName,
      platform: expense.platform,
      date: expense.date,
      time: expense.time,
      payment_method: expense.paymentMethod,
      subtotal: expense.subtotal,
      discount: expense.discount,
      delivery_charge: expense.deliveryCharge,
      tax: expense.tax,
      grand_total: expense.grandTotal,
      notes: expense.notes,
      created_at: expense.createdAt,
      updated_at: new Date().toISOString(),
    });

    if (expErr) {
      console.warn('Supabase expense save warning:', expErr.message);
      return false;
    }

    // Items/attachments/tags are fully replaced on every save so edits
    // (including removed rows) are reflected rather than left stale.
    await Promise.all([
      supabase.from('expense_items').delete().eq('expense_id', expense.id),
      supabase.from('attachments').delete().eq('expense_id', expense.id),
      supabase.from('expense_tags').delete().eq('expense_id', expense.id),
    ]);

    const tasks: Promise<unknown>[] = [];

    if (expense.items && expense.items.length > 0) {
      tasks.push(
        supabase.from('expense_items').insert(
          expense.items.map((i) => ({
            id: i.id,
            expense_id: expense.id,
            product_id: i.productId || null,
            product_name: i.productName,
            category_id: i.categoryId || null,
            brand: i.brand,
            quantity: i.quantity,
            unit: i.unit,
            unit_price: i.unitPrice,
            discount: i.discount,
            total_price: i.totalPrice,
            notes: i.notes,
          }))
        )
      );
    }

    if (expense.receipts && expense.receipts.length > 0) {
      tasks.push(
        supabase.from('attachments').insert(
          expense.receipts.map((r) => ({
            id: r.id,
            expense_id: expense.id,
            name: r.name,
            url: r.url,
            file_type: r.type,
            size: r.size || null,
          }))
        )
      );
    }

    if (expense.tags && expense.tags.length > 0) {
      tasks.push(
        supabase.from('expense_tags').insert(
          expense.tags.map((tagName) => ({
            expense_id: expense.id,
            tag_name: tagName,
          }))
        )
      );
    }

    await Promise.all(tasks);
    return true;
  } catch (err) {
    console.error('Failed to save expense to Supabase:', err);
    return false;
  }
};

export const deleteExpenseFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Child rows (items/attachments/tags) cascade-delete via FK ON DELETE CASCADE.
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.warn('Supabase expense delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete expense from Supabase:', err);
    return false;
  }
};

// ============================================================================
// SHOPPING LISTS (+ items)
// ============================================================================
export const fetchShoppingListsFromSupabase = async (): Promise<ShoppingList[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: listsData, error: listErr } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (listErr) {
      console.warn('Supabase shopping lists query error:', listErr.message);
      return null;
    }
    if (!listsData || listsData.length === 0) return [];

    const listIds = listsData.map((l) => l.id);
    const { data: allItems } = await supabase
      .from('shopping_list_items')
      .select('*')
      .in('shopping_list_id', listIds);

    return listsData.map((l) => {
      const items = (allItems || []).filter((i) => i.shopping_list_id === l.id);
      return {
        id: l.id,
        title: l.title,
        date: l.date,
        storeId: l.store_id || undefined,
        isCompleted: l.is_completed || false,
        createdAt: l.created_at,
        items: items.map((i) => ({
          id: i.id,
          productName: i.product_name,
          productId: i.product_id || undefined,
          categoryId: i.category_id || 'cat-others',
          quantity: Number(i.quantity),
          unit: i.unit || 'pcs',
          estimatedPrice: i.estimated_price != null ? Number(i.estimated_price) : undefined,
          isCompleted: i.is_completed || false,
          notes: i.notes || undefined,
        })),
      };
    });
  } catch (err) {
    console.error('Error fetching shopping lists from Supabase:', err);
    return null;
  }
};

export const saveShoppingListToSupabase = async (list: ShoppingList): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const userId = await getUserId();
    if (!userId) return false;

    const { error } = await supabase.from('shopping_lists').upsert({
      id: list.id,
      user_id: userId,
      title: list.title,
      date: list.date || null,
      store_id: list.storeId || null,
      is_completed: list.isCompleted || false,
      created_at: list.createdAt,
    });

    if (error) {
      console.warn('Supabase shopping list save warning:', error.message);
      return false;
    }

    await supabase.from('shopping_list_items').delete().eq('shopping_list_id', list.id);

    if (list.items && list.items.length > 0) {
      await supabase.from('shopping_list_items').insert(
        list.items.map((i) => ({
          id: i.id,
          shopping_list_id: list.id,
          product_name: i.productName,
          product_id: i.productId || null,
          category_id: i.categoryId || null,
          quantity: i.quantity,
          unit: i.unit,
          estimated_price: i.estimatedPrice ?? null,
          is_completed: i.isCompleted || false,
          notes: i.notes || null,
        }))
      );
    }

    return true;
  } catch (err) {
    console.error('Failed to save shopping list to Supabase:', err);
    return false;
  }
};

export const deleteShoppingListFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shopping_lists').delete().eq('id', id);
    if (error) {
      console.warn('Supabase shopping list delete warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete shopping list from Supabase:', err);
    return false;
  }
};
