CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`table_name` text,
	`record_id` integer,
	`old_values` text,
	`new_values` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`parent_id` integer,
	`color` text,
	`icon` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`nuit` text,
	`address` text,
	`city` text,
	`postal_code` text,
	`total_purchases` real DEFAULT 0,
	`total_orders` integer DEFAULT 0,
	`loyalty_points` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_nuit_unique` ON `customers` (`nuit`);--> statement-breakpoint
CREATE TABLE `daily_closures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`opening_amount` real NOT NULL,
	`closing_amount` real,
	`total_sales` real DEFAULT 0,
	`total_withdrawals` real DEFAULT 0,
	`total_supplies` real DEFAULT 0,
	`notes` text,
	`opened_at` integer NOT NULL,
	`closed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`barcode` text,
	`sku` text,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer,
	`cost_price` real NOT NULL,
	`sale_price` real NOT NULL,
	`stock_quantity` integer DEFAULT 0,
	`min_stock` integer DEFAULT 0,
	`max_stock` integer,
	`unit` text DEFAULT 'un',
	`tax_rate` real DEFAULT 0,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`track_stock` integer DEFAULT true,
	`allow_negative_stock` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sale_id` integer NOT NULL,
	`product_id` integer,
	`product_name` text NOT NULL,
	`barcode` text,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`discount_percent` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`tax_rate` real DEFAULT 0,
	`tax_amount` real DEFAULT 0,
	`subtotal` real NOT NULL,
	`total` real NOT NULL,
	`cost_price` real
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`customer_id` integer,
	`user_id` integer,
	`subtotal` real NOT NULL,
	`tax_amount` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`total` real NOT NULL,
	`payment_method` text,
	`cash_received` real,
	`change_given` real,
	`status` text DEFAULT 'completed',
	`notes` text,
	`created_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_invoice_number_unique` ON `sales` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`type` text NOT NULL,
	`quantity` real NOT NULL,
	`previous_quantity` real NOT NULL,
	`new_quantity` real NOT NULL,
	`reference_type` text,
	`reference_id` integer,
	`cost_price` real,
	`notes` text,
	`user_id` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text,
	`role` text NOT NULL,
	`permissions` text,
	`is_active` integer DEFAULT true,
	`last_login` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text,
	`category` text,
	`description` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);