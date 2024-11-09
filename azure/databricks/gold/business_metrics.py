from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, sum, count, avg, window, 
    datediff, current_timestamp, year, month
)
from delta.tables import DeltaTable

class BusinessMetricsTransformation:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("Business_Metrics_Transformation") \
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
            .getOrCreate()

    def create_business_metrics(self):
        """Create gold layer business metrics"""
        
        # Read from silver layer
        orders = self.spark.read.format("delta").load("/data/silver/orders_enriched")
        users = self.spark.read.format("delta").load("/data/silver/users_enriched")
        merchant_perf = self.spark.read.format("delta").load("/data/silver/merchant_performance")
        
        # 1. Revenue Metrics
        revenue_metrics = orders \
            .groupBy(year("created_at").alias("year"), month("created_at").alias("month")) \
            .agg(
                sum("total_price").alias("total_revenue"),
                count("order_id").alias("total_orders"),
                avg("total_price").alias("average_order_value"),
                count(distinct("user_id")).alias("unique_customers")
            )

        # 2. User Growth Metrics
        user_growth = users \
            .groupBy(year("created_at").alias("year"), month("created_at").alias("month")) \
            .agg(
                count("user_id").alias("new_users"),
                sum(when(col("user_type") == "merchant", 1).otherwise(0)).alias("new_merchants")
            )

        # 3. Merchant Performance Rankings
        merchant_rankings = merchant_perf \
            .withColumn("rank", dense_rank().over(
                Window.orderBy(desc("total_revenue")))
            ) \
            .select(
                "merchant_id",
                "total_revenue",
                "total_orders",
                "average_order_value",
                "rank"
            )

        # Write to gold layer
        revenue_metrics.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/data/gold/revenue_metrics")

        user_growth.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/data/gold/user_growth")

        merchant_rankings.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/data/gold/merchant_rankings") 