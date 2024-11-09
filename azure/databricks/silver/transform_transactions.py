from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, sum, count, window
from delta.tables import DeltaTable

class TransactionTransformation:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("Transaction_Data_Transformation") \
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
            .getOrCreate()

    def transform_transaction_data(self):
        """Transform transaction data from bronze to silver layer"""
        
        # Read from bronze layer
        bronze_orders = self.spark.read.format("delta").load("/data/bronze/delta/orders")
        bronze_items = self.spark.read.format("delta").load("/data/bronze/delta/order_items")
        bronze_products = self.spark.read.format("delta").load("/data/bronze/delta/products")

        # Join orders with items and products
        enriched_orders = bronze_orders \
            .join(bronze_items, "order_id") \
            .join(bronze_products, "product_id") \
            .select(
                "order_id",
                "user_id",
                "merchant_id",
                "product_id",
                "quantity",
                "price_per_unit",
                "total_price",
                "status",
                "payment_status",
                "created_at"
            )

        # Write enriched orders to silver
        enriched_orders.write \
            .format("delta") \
            .mode("overwrite") \
            .partitionBy("created_at") \
            .save("/data/silver/orders_enriched")

        # Create merchant performance summary
        merchant_summary = enriched_orders \
            .groupBy("merchant_id") \
            .agg(
                sum("total_price").alias("total_revenue"),
                count("order_id").alias("total_orders"),
                avg("total_price").alias("average_order_value")
            )

        # Write merchant summary
        merchant_summary.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/data/silver/merchant_performance") 