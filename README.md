# ISKCON Kudupu-Katte Admin Portal

> This project is being scaffolded for a React.js + Supabase admin portal with role-based access and devotee management.

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start the development server

```
npm run dev
```

### 4. Tailwind CSS & shadcn/ui
- Tailwind CSS is preconfigured.
- To add shadcn/ui components, follow the [shadcn/ui docs](https://ui.shadcn.com/docs/installation/react).

---

## Folder Structure

```
src/
 ├─ components/   (shared UI components)
 ├─ pages/
 │   ├─ Login.jsx
 │   ├─ Dashboard.jsx
 │   ├─ Devotees.jsx
 │   └─ Users.jsx
 ├─ lib/
 │   └─ supabaseClient.js
 ├─ App.jsx
 ├─ main.jsx
 ├─ index.css
```

## Features
- Supabase Auth with role-based access
- Devotee management (CRUD)
- User management (admin only)
- Tailwind CSS + shadcn/ui for UI
