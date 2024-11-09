from azure.monitor import MonitorClient
from azure.identity import DefaultAzureCredential
from datetime import datetime, timedelta
import logging
import os
from dotenv import load_dotenv

load_dotenv()

class PipelineMonitor:
    def __init__(self):
        self.credential = DefaultAzureCredential()
        self.monitor_client = MonitorClient(self.credential)
        self.workspace_name = os.getenv('WORKSPACE_NAME')
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def check_pipeline_health(self):
        """Monitor pipeline execution status"""
        try:
            # Check ADF pipeline runs
            adf_metrics = self.monitor_client.metrics.list(
                resource_uri=f"/subscriptions/{os.getenv('SUBSCRIPTION_ID')}/resourceGroups/{os.getenv('RESOURCE_GROUP')}/providers/Microsoft.DataFactory/factories/{os.getenv('ADF_NAME')}",
                timespan=timedelta(hours=24),
                interval=timedelta(minutes=5),
                metric_names=['PipelineSucceededRuns', 'PipelineFailedRuns']
            )

            # Check Databricks job status
            databricks_metrics = self.monitor_client.metrics.list(
                resource_uri=f"/subscriptions/{os.getenv('SUBSCRIPTION_ID')}/resourceGroups/{os.getenv('RESOURCE_GROUP')}/providers/Microsoft.Databricks/workspaces/{self.workspace_name}",
                timespan=timedelta(hours=24),
                interval=timedelta(minutes=5),
                metric_names=['JobsCompleted', 'JobsFailed']
            )

            return {
                'adf_metrics': adf_metrics,
                'databricks_metrics': databricks_metrics
            }

        except Exception as e:
            self.logger.error(f"Error checking pipeline health: {str(e)}")
            raise

    def monitor_data_quality(self):
        """Monitor data quality metrics"""
        try:
            # Check for null values
            null_check_query = """
            SELECT 
                table_name,
                column_name,
                COUNT(*) as null_count
            FROM silver.quality_checks
            WHERE check_type = 'null_check'
            AND check_timestamp > DATEADD(hour, -24, GETUTCDATE())
            GROUP BY table_name, column_name
            HAVING COUNT(*) > 0
            """

            # Check for duplicates
            duplicate_check_query = """
            SELECT 
                table_name,
                COUNT(*) as duplicate_count
            FROM silver.quality_checks
            WHERE check_type = 'duplicate_check'
            AND check_timestamp > DATEADD(hour, -24, GETUTCDATE())
            GROUP BY table_name
            HAVING COUNT(*) > 0
            """

            return {
                'null_checks': self.execute_query(null_check_query),
                'duplicate_checks': self.execute_query(duplicate_check_query)
            }

        except Exception as e:
            self.logger.error(f"Error monitoring data quality: {str(e)}")
            raise

    def monitor_performance(self):
        """Monitor performance metrics"""
        try:
            metrics = {
                'ingestion_latency': self.get_ingestion_latency(),
                'processing_time': self.get_processing_time(),
                'resource_utilization': self.get_resource_utilization()
            }
            
            return metrics

        except Exception as e:
            self.logger.error(f"Error monitoring performance: {str(e)}")
            raise

    def get_ingestion_latency(self):
        """Calculate data ingestion latency"""
        query = """
        SELECT 
            source_system,
            AVG(DATEDIFF(second, event_timestamp, ingestion_timestamp)) as avg_latency_seconds
        FROM bronze.ingestion_metrics
        WHERE ingestion_timestamp > DATEADD(hour, -1, GETUTCDATE())
        GROUP BY source_system
        """
        return self.execute_query(query)

    def get_processing_time(self):
        """Monitor data processing time"""
        query = """
        SELECT 
            pipeline_name,
            AVG(DATEDIFF(second, start_time, end_time)) as avg_processing_seconds
        FROM silver.pipeline_metrics
        WHERE start_time > DATEADD(hour, -24, GETUTCDATE())
        GROUP BY pipeline_name
        """
        return self.execute_query(query)

    def get_resource_utilization(self):
        """Monitor resource utilization"""
        try:
            # Get Databricks cluster metrics
            cluster_metrics = self.monitor_client.metrics.list(
                resource_uri=f"/subscriptions/{os.getenv('SUBSCRIPTION_ID')}/resourceGroups/{os.getenv('RESOURCE_GROUP')}/providers/Microsoft.Databricks/workspaces/{self.workspace_name}",
                timespan=timedelta(hours=1),
                interval=timedelta(minutes=5),
                metric_names=['MemoryUsage', 'CPUUsage', 'DiskIOPS']
            )

            return cluster_metrics

        except Exception as e:
            self.logger.error(f"Error getting resource utilization: {str(e)}")
            raise

if __name__ == "__main__":
    monitor = PipelineMonitor()
    
    # Run all monitoring checks
    pipeline_health = monitor.check_pipeline_health()
    data_quality = monitor.monitor_data_quality()
    performance_metrics = monitor.monitor_performance() 