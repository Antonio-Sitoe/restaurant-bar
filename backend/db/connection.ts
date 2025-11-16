import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as schema from './schema/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultDbPath = path.join(
  process.env.APP_ROOT ?? path.join(__dirname, '../'),
  'app.db'
)
const dbPath = process.env.DB_PATH || defaultDbPath

let singletonDb: ReturnType<typeof drizzle> | null = null
let singletonSqlite: InstanceType<typeof Database> | null = null

export function getDb(databasePath: string = dbPath) {
  if (singletonDb) return singletonDb
  const sqlite = new Database(databasePath)
  singletonSqlite = sqlite

  // Minimal schema bootstrap to avoid missing table errors in dev
  try {
    sqlite.exec(
      `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT UNIQUE,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER,
  cost_price REAL NOT NULL,
  sale_price REAL NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  unit TEXT DEFAULT 'un',
  tax_rate REAL DEFAULT 0,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  track_stock INTEGER DEFAULT 1,
  allow_negative_stock INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER,
  color TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  nuit TEXT UNIQUE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  total_purchases REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK(role IN ('admin','manager','cashier')) NOT NULL DEFAULT 'cashier',
  permissions TEXT,
  is_active INTEGER DEFAULT 1,
  last_login INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT,
  category TEXT,
  description TEXT,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER,
  user_id INTEGER,
  subtotal REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT,
  cash_received REAL,
  change_given REAL,
  status TEXT CHECK(status IN ('completed','cancelled','refunded')) DEFAULT 'completed',
  notes TEXT,
  created_at INTEGER,
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  barcode TEXT,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  discount_percent REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  subtotal REAL NOT NULL,
  total REAL NOT NULL,
  cost_price REAL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('in','out','adjustment','return','damage','transfer')) NOT NULL,
  quantity REAL NOT NULL,
  previous_quantity REAL NOT NULL,
  new_quantity REAL NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  cost_price REAL,
  notes TEXT,
  user_id INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now')*1000)
);
`
    )
  } catch (error) {
    // ignore bootstrap errors
  }
  singletonDb = drizzle(sqlite, { schema })
  return singletonDb
}

export function getSqlite(): InstanceType<typeof Database> {
  if (!singletonSqlite) {
    getDb()
  }
  return singletonSqlite!
}
