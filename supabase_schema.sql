-- GroceryQi — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query).
-- Every table is scoped to auth.uid() via Row Level Security, so each signed-in
-- user only ever sees/writes their own rows.

-- ============================================================================
-- CATEGORIES
-- ============================================================================
create table if not exists public.categories (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  is_default boolean default false,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

-- ============================================================================
-- STORES
-- ============================================================================
create table if not exists public.stores (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text default 'Offline',
  logo_url text,
  address text,
  location_url text,
  notes text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table public.stores enable row level security;

create policy "stores_select_own" on public.stores for select using (auth.uid() = user_id);
create policy "stores_insert_own" on public.stores for insert with check (auth.uid() = user_id);
create policy "stores_update_own" on public.stores for update using (auth.uid() = user_id);
create policy "stores_delete_own" on public.stores for delete using (auth.uid() = user_id);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table if not exists public.products (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  category_id text,
  default_unit text default 'pcs',
  image_url text,
  notes text,
  is_favorite boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table public.products enable row level security;

create policy "products_select_own" on public.products for select using (auth.uid() = user_id);
create policy "products_insert_own" on public.products for insert with check (auth.uid() = user_id);
create policy "products_update_own" on public.products for update using (auth.uid() = user_id);
create policy "products_delete_own" on public.products for delete using (auth.uid() = user_id);

-- ============================================================================
-- EXPENSES (+ items, attachments, tags)
-- ============================================================================
create table if not exists public.expenses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id text,
  store_name text,
  platform text,
  date date not null,
  time text,
  payment_method text,
  notes text,
  subtotal numeric default 0,
  discount numeric default 0,
  delivery_charge numeric default 0,
  tax numeric default 0,
  grand_total numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);

create table if not exists public.expense_items (
  id text primary key,
  expense_id text not null references public.expenses(id) on delete cascade,
  product_id text,
  product_name text,
  category_id text,
  brand text,
  quantity numeric default 1,
  unit text default 'pcs',
  unit_price numeric default 0,
  discount numeric default 0,
  total_price numeric default 0,
  notes text
);

alter table public.expense_items enable row level security;

create policy "expense_items_select_own" on public.expense_items for select using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_items_insert_own" on public.expense_items for insert with check (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_items_update_own" on public.expense_items for update using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_items_delete_own" on public.expense_items for delete using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);

create table if not exists public.attachments (
  id text primary key,
  expense_id text not null references public.expenses(id) on delete cascade,
  name text,
  url text,
  file_type text default 'image',
  size int
);

alter table public.attachments enable row level security;

create policy "attachments_select_own" on public.attachments for select using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "attachments_insert_own" on public.attachments for insert with check (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "attachments_update_own" on public.attachments for update using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "attachments_delete_own" on public.attachments for delete using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);

create table if not exists public.expense_tags (
  id bigserial primary key,
  expense_id text not null references public.expenses(id) on delete cascade,
  tag_name text not null
);

alter table public.expense_tags enable row level security;

create policy "expense_tags_select_own" on public.expense_tags for select using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_tags_insert_own" on public.expense_tags for insert with check (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_tags_update_own" on public.expense_tags for update using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);
create policy "expense_tags_delete_own" on public.expense_tags for delete using (
  exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = auth.uid())
);

-- ============================================================================
-- SHOPPING LISTS (+ items)
-- ============================================================================
create table if not exists public.shopping_lists (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date,
  store_id text,
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table public.shopping_lists enable row level security;

create policy "shopping_lists_select_own" on public.shopping_lists for select using (auth.uid() = user_id);
create policy "shopping_lists_insert_own" on public.shopping_lists for insert with check (auth.uid() = user_id);
create policy "shopping_lists_update_own" on public.shopping_lists for update using (auth.uid() = user_id);
create policy "shopping_lists_delete_own" on public.shopping_lists for delete using (auth.uid() = user_id);

create table if not exists public.shopping_list_items (
  id text primary key,
  shopping_list_id text not null references public.shopping_lists(id) on delete cascade,
  product_name text,
  product_id text,
  category_id text,
  quantity numeric default 1,
  unit text default 'pcs',
  estimated_price numeric,
  is_completed boolean default false,
  notes text
);

alter table public.shopping_list_items enable row level security;

create policy "shopping_list_items_select_own" on public.shopping_list_items for select using (
  exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid())
);
create policy "shopping_list_items_insert_own" on public.shopping_list_items for insert with check (
  exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid())
);
create policy "shopping_list_items_update_own" on public.shopping_list_items for update using (
  exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid())
);
create policy "shopping_list_items_delete_own" on public.shopping_list_items for delete using (
  exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid())
);

-- ============================================================================
-- Helpful indexes
-- ============================================================================
create index if not exists idx_expenses_user_date on public.expenses(user_id, date desc);
create index if not exists idx_expense_items_expense on public.expense_items(expense_id);
create index if not exists idx_attachments_expense on public.attachments(expense_id);
create index if not exists idx_expense_tags_expense on public.expense_tags(expense_id);
create index if not exists idx_products_user on public.products(user_id);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_stores_user on public.stores(user_id);
create index if not exists idx_shopping_lists_user on public.shopping_lists(user_id);
create index if not exists idx_shopping_list_items_list on public.shopping_list_items(shopping_list_id);

-- ============================================================================
-- Table-level GRANTs
-- ============================================================================
-- RLS policies only restrict which ROWS a role can see/change — Postgres
-- still requires the role to have basic table-level privileges first.
-- Tables created via the SQL Editor don't automatically get these the way
-- tables made through the Table Editor UI do, so they're granted explicitly
-- here. The `authenticated` role is what PostgREST uses once a user is
-- signed in; RLS still enforces per-user row access on top of this.
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.categories,
  public.stores,
  public.products,
  public.expenses,
  public.expense_items,
  public.attachments,
  public.expense_tags,
  public.shopping_lists,
  public.shopping_list_items
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Ensures any table added later in this schema also grants access
-- automatically, without needing to remember to add it above.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
