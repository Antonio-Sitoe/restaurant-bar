import { client } from './connection'
import { logger } from '../utils/logger'

export async function createViews() {
  try {
    // View: low_stock_products
    await client.execute(`
			CREATE VIEW IF NOT EXISTS low_stock_products AS
			SELECT 
				p.id,
				p.name,
				p.barcode,
				p.stock_quantity,
				p.min_stock,
				p.category_id,
				c.name as category_name,
				CASE 
					WHEN p.stock_quantity <= 0 THEN 'out_of_stock'
					WHEN p.stock_quantity <= p.min_stock THEN 'low_stock'
					ELSE 'ok'
				END as stock_status
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			WHERE p.track_stock = 1 
				AND (p.stock_quantity <= p.min_stock OR p.stock_quantity <= 0)
				AND p.is_active = 1
		`)

    // View: daily_sales_summary
    await client.execute(`
			CREATE VIEW IF NOT EXISTS daily_sales_summary AS
			SELECT 
				DATE(s.created_at / 1000, 'unixepoch') as sale_date,
				COUNT(*) as total_sales,
				SUM(s.total) as total_revenue,
				SUM(s.subtotal) as total_subtotal,
				SUM(s.tax_amount) as total_tax,
				SUM(s.discount_amount) as total_discount,
				AVG(s.total) as average_ticket,
				COUNT(DISTINCT s.customer_id) as unique_customers
			FROM sales s
			WHERE s.status = 'completed'
			GROUP BY DATE(s.created_at / 1000, 'unixepoch')
		`)

    // View: top_selling_products
    await client.execute(`
			CREATE VIEW IF NOT EXISTS top_selling_products AS
			SELECT 
				si.product_id,
				p.name as product_name,
				p.barcode,
				SUM(si.quantity) as total_quantity_sold,
				SUM(si.total) as total_revenue,
				COUNT(DISTINCT si.sale_id) as times_sold,
				AVG(si.unit_price) as average_price
			FROM sale_items si
			INNER JOIN sales s ON si.sale_id = s.id
			INNER JOIN products p ON si.product_id = p.id
			WHERE s.status = 'completed'
			GROUP BY si.product_id, p.name, p.barcode
			ORDER BY total_quantity_sold DESC
		`)

    // View: stock_value
    await client.execute(`
			CREATE VIEW IF NOT EXISTS stock_value AS
			SELECT 
				c.id as category_id,
				c.name as category_name,
				COUNT(p.id) as total_products,
				SUM(p.stock_quantity) as total_quantity,
				SUM(p.stock_quantity * COALESCE(p.cost_price, 0)) as total_cost_value,
				SUM(p.stock_quantity * COALESCE(p.sale_price, 0)) as total_sale_value,
				SUM(p.stock_quantity * COALESCE(p.sale_price, 0)) - SUM(p.stock_quantity * COALESCE(p.cost_price, 0)) as potential_profit
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			WHERE p.track_stock = 1 AND p.is_active = 1
			GROUP BY c.id, c.name
		`)

    logger.info('✅ Database views created successfully')
  } catch (error) {
    logger.error('Error creating views', error)
    throw error
  }
}
