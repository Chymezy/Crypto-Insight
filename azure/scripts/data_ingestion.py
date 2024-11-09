from azure.eventhub import EventHubConsumerClient
from azure.storage.filedatalake import DataLakeServiceClient
import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

class DataIngestionPipeline:
    def __init__(self):
        self.eventhub_connection_str = os.getenv('EVENTHUB_CONNECTION_STRING')
        self.storage_connection_str = os.getenv('STORAGE_CONNECTION_STRING')
        self.consumer_group = "$Default"

    async def process_postgresql_event(self, event):
        """Process CDC events from PostgreSQL"""
        event_body = event.body_as_json()
        
        # Extract table name and operation type
        table_name = event_body.get('table')
        operation = event_body.get('operation')  # INSERT, UPDATE, DELETE
        
        # Format data for storage
        formatted_data = {
            'source': 'postgresql',
            'table': table_name,
            'operation': operation,
            'data': event_body.get('data'),
            'timestamp': event_body.get('timestamp')
        }
        
        # Store in Data Lake
        await self.store_in_datalake('postgresql', table_name, formatted_data)

    async def process_mongodb_event(self, event):
        """Process Change Stream events from MongoDB"""
        event_body = event.body_as_json()
        
        # Extract collection name and operation type
        collection = event_body.get('ns').get('coll')
        operation = event_body.get('operationType')
        
        # Format data for storage
        formatted_data = {
            'source': 'mongodb',
            'collection': collection,
            'operation': operation,
            'data': event_body.get('fullDocument'),
            'timestamp': event_body.get('clusterTime')
        }
        
        # Store in Data Lake
        await self.store_in_datalake('mongodb', collection, formatted_data)

    async def store_in_datalake(self, source, entity_name, data):
        """Store captured changes in Data Lake"""
        try:
            # Create Data Lake service client
            service_client = DataLakeServiceClient.from_connection_string(
                self.storage_connection_str)
            
            # Get file system client
            file_system_client = service_client.get_file_system_client(
                file_system="bronze")
            
            # Create path with date partitioning
            from datetime import datetime
            date = datetime.now()
            path = f"{source}/{entity_name}/year={date.year}/month={date.month}/day={date.day}/data_{date.timestamp()}.json"
            
            # Create and write to file
            file_client = file_system_client.create_file(path)
            file_client.append_data(json.dumps(data), 0, len(json.dumps(data)))
            file_client.flush_data(len(json.dumps(data)))
            
        except Exception as e:
            print(f"Error storing data in Data Lake: {str(e)}")

    async def start_ingestion(self):
        """Start the ingestion process for both databases"""
        # PostgreSQL consumer
        pg_consumer = EventHubConsumerClient.from_connection_string(
            self.eventhub_connection_str,
            consumer_group=self.consumer_group,
            eventhub_name="postgresql-changes"
        )
        
        # MongoDB consumer
        mongo_consumer = EventHubConsumerClient.from_connection_string(
            self.eventhub_connection_str,
            consumer_group=self.consumer_group,
            eventhub_name="mongodb-changes"
        )
        
        async def on_postgresql_event(partition_context, event):
            await self.process_postgresql_event(event)
            await partition_context.update_checkpoint(event)
            
        async def on_mongodb_event(partition_context, event):
            await self.process_mongodb_event(event)
            await partition_context.update_checkpoint(event)
        
        # Start consumers
        async with pg_consumer, mongo_consumer:
            await asyncio.gather(
                pg_consumer.receive(on_event=on_postgresql_event),
                mongo_consumer.receive(on_event=on_mongodb_event)
            )

if __name__ == "__main__":
    pipeline = DataIngestionPipeline()
    asyncio.run(pipeline.start_ingestion()) 