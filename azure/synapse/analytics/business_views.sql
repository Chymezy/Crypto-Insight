-- Create views for business analytics

-- 1. Revenue Dashboard View
CREATE OR ALTER VIEW [analytics].[vw_Revenue_Dashboard]
AS
SELECT 
    year,
    month,
    total_revenue,
    total_orders,
    average_order_value,
    unique_customers,
    total_revenue / NULLIF(total_orders, 0) as revenue_per_order,
    total_revenue / NULLIF(unique_customers, 0) as revenue_per_customer
FROM 
    gold.revenue_metrics;

-- 2. User Growth Analysis View
CREATE OR ALTER VIEW [analytics].[vw_User_Growth]
AS
SELECT 
    year,
    month,
    new_users,
    new_merchants,
    SUM(new_users) OVER (ORDER BY year, month) as cumulative_users,
    SUM(new_merchants) OVER (ORDER BY year, month) as cumulative_merchants
FROM 
    gold.user_growth;

-- 3. Top Performing Merchants View
CREATE OR ALTER VIEW [analytics].[vw_Top_Merchants]
AS
SELECT 
    m.merchant_id,
    u.business_name,
    m.total_revenue,
    m.total_orders,
    m.average_order_value,
    m.rank as revenue_rank,
    CAST(m.total_revenue / NULLIF(SUM(m.total_revenue) OVER(), 0) * 100 as DECIMAL(5,2)) as revenue_share_percentage
FROM 
    gold.merchant_rankings m
    JOIN silver.merchants u ON m.merchant_id = u.merchant_id
WHERE 
    m.rank <= 100;

-- 4. Waste Management KPIs View
CREATE OR ALTER VIEW [analytics].[vw_Waste_Management_KPIs]
AS
SELECT 
    wc.category_name,
    COUNT(p.product_id) as total_products,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.price_per_unit) as average_price
FROM 
    silver.waste_categories wc
    LEFT JOIN silver.products p ON wc.category_id = p.category_id
    LEFT JOIN silver.order_items oi ON p.product_id = oi.product_id
GROUP BY 
    wc.category_name; 