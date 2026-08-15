# GroceryQi

A personal grocery and expense tracker built with React, TypeScript, and Vite, using Supabase for authentication and data storage.

## Features

- Track grocery expenses with itemized line items, receipts, and tags
- Manage a reusable product catalog, categories, and stores
- Shopping lists that convert directly into expenses
- Spending analytics, price history, and exportable reports
- All data synced to Supabase — no local/offline storage

## Getting Started

**Prerequisites:** Node.js, and a [Supabase](https://supabase.com) project.

1. Install dependencies:
   ```
   npm install
   ```
2. Run `supabase_schema.sql` in your Supabase project's SQL Editor to create the required tables and permissions.
3. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon/publishable key:
   ```
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
4. Start the dev server:
   ```
   npm run dev
   ```

## Build

```
npm run build
```

Outputs a static production build to `dist/`, ready to deploy on Vercel or any static host.
