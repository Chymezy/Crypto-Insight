from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp, current_timestamp, when, lit
from delta.tables import DeltaTable

class UserTransformation:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("User_Data_Transformation") \
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
            .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
            .getOrCreate()

    def transform_user_data(self):
        """Transform user data from bronze to silver layer"""
        
        # Read from bronze layer
        bronze_users = self.spark.read.format("delta").load("/data/bronze/delta/users")
        bronze_profiles = self.spark.read.format("delta").load("/data/bronze/delta/user_profiles")
        bronze_activities = self.spark.read.format("delta").load("/data/bronze/delta/user_activities")

        # Clean and standardize user data
        cleaned_users = bronze_users \
            .withColumn("email", lower(col("email"))) \
            .withColumn("status", when(col("status").isNull(), "active").otherwise(col("status"))) \
            .withColumn("processed_timestamp", current_timestamp())

        # Join with profiles
        enriched_users = cleaned_users \
            .join(bronze_profiles, "user_id", "left") \
            .select(
                "user_id",
                "email",
                "user_type",
                "status",
                "first_name",
                "last_name",
                "phone_number",
                "address",
                "created_at",
                "processed_timestamp"
            )

        # Write to silver layer
        enriched_users.write \
            .format("delta") \
            .mode("overwrite") \
            .partitionBy("user_type") \
            .save("/data/silver/users_enriched")

        # Create user activity summary
        activity_summary = bronze_activities \
            .groupBy("user_id") \
            .agg(
                count("*").alias("total_activities"),
                max("created_at").alias("last_activity_date")
            )

        # Write activity summary
        activity_summary.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/data/silver/user_activity_summary") 