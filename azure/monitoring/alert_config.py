from azure.monitor.alert import AlertRuleClient
from azure.identity import DefaultAzureCredential
import os
from dotenv import load_dotenv

load_dotenv()

class AlertConfiguration:
    def __init__(self):
        self.credential = DefaultAzureCredential()
        self.alert_client = AlertRuleClient(self.credential)
        self.resource_group = os.getenv('RESOURCE_GROUP')
        self.subscription_id = os.getenv('SUBSCRIPTION_ID')

    def setup_pipeline_alerts(self):
        """Setup alerts for pipeline health"""
        
        # Pipeline Failure Alert
        pipeline_failure_rule = {
            "location": "eastus",
            "properties": {
                "description": "Alert when pipeline fails",
                "severity": 1,  # Critical
                "enabled": True,
                "scopes": [f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}"],
                "evaluationFrequency": "PT5M",  # 5 minutes
                "windowSize": "PT15M",  # 15 minutes
                "criteria": {
                    "failedRuns": {
                        "operator": "GreaterThan",
                        "threshold": 0,
                        "metricName": "PipelineFailedRuns",
                        "timeAggregation": "Count"
                    }
                },
                "actions": [{
                    "actionGroupId": f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}/providers/microsoft.insights/actionGroups/DevOpsTeam"
                }]
            }
        }
        
        self.alert_client.create_or_update(
            resource_group_name=self.resource_group,
            rule_name="PipelineFailureAlert",
            parameters=pipeline_failure_rule
        )

    def setup_data_quality_alerts(self):
        """Setup alerts for data quality issues"""
        
        # Data Quality Alert
        data_quality_rule = {
            "location": "eastus",
            "properties": {
                "description": "Alert on data quality issues",
                "severity": 2,  # Error
                "enabled": True,
                "scopes": [f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}"],
                "evaluationFrequency": "PT15M",
                "windowSize": "PT1H",
                "criteria": {
                    "nullValues": {
                        "operator": "GreaterThan",
                        "threshold": 100,  # Alert if more than 100 null values
                        "metricName": "NullValueCount",
                        "timeAggregation": "Total"
                    },
                    "duplicateRecords": {
                        "operator": "GreaterThan",
                        "threshold": 50,  # Alert if more than 50 duplicates
                        "metricName": "DuplicateCount",
                        "timeAggregation": "Total"
                    }
                },
                "actions": [{
                    "actionGroupId": f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}/providers/microsoft.insights/actionGroups/DataQualityTeam"
                }]
            }
        }
        
        self.alert_client.create_or_update(
            resource_group_name=self.resource_group,
            rule_name="DataQualityAlert",
            parameters=data_quality_rule
        )

    def setup_performance_alerts(self):
        """Setup alerts for performance issues"""
        
        # Latency Alert
        latency_rule = {
            "location": "eastus",
            "properties": {
                "description": "Alert on high latency",
                "severity": 2,
                "enabled": True,
                "scopes": [f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}"],
                "evaluationFrequency": "PT5M",
                "windowSize": "PT15M",
                "criteria": {
                    "ingestionLatency": {
                        "operator": "GreaterThan",
                        "threshold": 300,  # Alert if latency > 300 seconds
                        "metricName": "IngestionLatency",
                        "timeAggregation": "Average"
                    }
                },
                "actions": [{
                    "actionGroupId": f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}/providers/microsoft.insights/actionGroups/PerformanceTeam"
                }]
            }
        }
        
        self.alert_client.create_or_update(
            resource_group_name=self.resource_group,
            rule_name="LatencyAlert",
            parameters=latency_rule
        )

    def setup_resource_alerts(self):
        """Setup alerts for resource utilization"""
        
        # Resource Utilization Alert
        resource_rule = {
            "location": "eastus",
            "properties": {
                "description": "Alert on high resource utilization",
                "severity": 2,
                "enabled": True,
                "scopes": [f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}"],
                "evaluationFrequency": "PT5M",
                "windowSize": "PT15M",
                "criteria": {
                    "cpuUsage": {
                        "operator": "GreaterThan",
                        "threshold": 80,  # Alert if CPU > 80%
                        "metricName": "CPUUsage",
                        "timeAggregation": "Average"
                    },
                    "memoryUsage": {
                        "operator": "GreaterThan",
                        "threshold": 85,  # Alert if Memory > 85%
                        "metricName": "MemoryUsage",
                        "timeAggregation": "Average"
                    }
                },
                "actions": [{
                    "actionGroupId": f"/subscriptions/{self.subscription_id}/resourceGroups/{self.resource_group}/providers/microsoft.insights/actionGroups/InfraTeam"
                }]
            }
        }
        
        self.alert_client.create_or_update(
            resource_group_name=self.resource_group,
            rule_name="ResourceAlert",
            parameters=resource_rule
        )

if __name__ == "__main__":
    alert_config = AlertConfiguration()
    alert_config.setup_pipeline_alerts()
    alert_config.setup_data_quality_alerts()
    alert_config.setup_performance_alerts()
    alert_config.setup_resource_alerts() 