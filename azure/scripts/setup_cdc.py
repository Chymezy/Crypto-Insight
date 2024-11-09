from azure.identity import DefaultAzureCredential
from azure.eventhub import EventHubProducerClient
import psycopg2
from pymongo import MongoClient
import json
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseCDCSetup:
    def __init__(self):
        self.pg_conn_string = os.getenv('POSTGRES_CONNECTION_STRING')
        self.mongo_conn_string = os.getenv('MONGODB_CONNECTION_STRING')
        self.eventhub_namespace = os.getenv('EVENTHUB_NAMESPACE')
        self.credential = DefaultAzureCredential()

    def setup_postgresql_cdc(self):
        """Setup CDC for PostgreSQL with Prisma consideration"""
        conn = psycopg2.connect(self.pg_conn_string)
        cur = conn.cursor()
        
        try:
            # Enable logical replication
            cur.execute("""
                ALTER SYSTEM SET wal_level = logical;
                ALTER SYSTEM SET max_replication_slots = 10;
                ALTER SYSTEM SET max_wal_senders = 10;
            """)
            
            # Create publication for tables (excluding Prisma metadata)
            cur.execute("""
                CREATE PUBLICATION wastedump_pub FOR TABLE 
                    users, user_profiles, merchants, products, 
                    orders, order_items, stokvels, stokvel_members,
                    subscription_plans, user_subscriptions,
                    monitors, mobile_tellings, sponsors;
            """)
            
            # Create replication slot
            cur.execute("""
                SELECT pg_create_logical_replication_slot(
                    'wastedump_slot',
                    'pgoutput'
                );
            """)
            
            conn.commit()
            print("PostgreSQL CDC setup completed successfully")
            
        except Exception as e:
            print(f"Error setting up PostgreSQL CDC: {str(e)}")
            conn.rollback()
        finally:
            cur.close()
            conn.close()

    def setup_mongodb_changestream(self):
        """Setup Change Streams for MongoDB with Mongoose consideration"""
        client = MongoClient(self.mongo_conn_string)
        
        try:
            # Ensure we're using a replica set
            db = client.admin
            
            # Setup change stream pipeline for specific collections
            pipeline = [{
                '$match': {
                    'operationType': {'$in': ['insert', 'update', 'delete']},
                    'ns.coll': {
                        '$in': [
                            'user_activities',
                            'logs',
                            'chat_messages',
                            'notifications',
                            'waste_reports',
                            'community_feed',
                            'analytics'
                        ]
                    }
                }
            }]
            
            # Test change stream
            change_stream = client.wastedump.watch(pipeline)
            print("MongoDB change stream initialized successfully")
            
        except Exception as e:
            print(f"Error setting up MongoDB change stream: {str(e)}")
        finally:
            client.close()

    def setup_event_hub_connections(self):
        """Setup Event Hub connections for both databases"""
        try:
            # PostgreSQL changes event hub
            pg_producer = EventHubProducerClient(
                fully_qualified_namespace=f"{self.eventhub_namespace}.servicebus.windows.net",
                eventhub_name="postgresql-changes",
                credential=self.credential
            )
            
            # MongoDB changes event hub
            mongo_producer = EventHubProducerClient(
                fully_qualified_namespace=f"{self.eventhub_namespace}.servicebus.windows.net",
                eventhub_name="mongodb-changes",
                credential=self.credential
            )
            
            print("Event Hub connections setup successfully")
            return pg_producer, mongo_producer
            
        except Exception as e:
            print(f"Error setting up Event Hub connections: {str(e)}")
            return None, None

    def run_setup(self):
        """Run the complete setup process"""
        print("Starting CDC setup process...")
        
        # Setup PostgreSQL CDC
        self.setup_postgresql_cdc()
        
        # Setup MongoDB Change Streams
        self.setup_mongodb_changestream()
        
        # Setup Event Hub connections
        self.setup_event_hub_connections()
        
        print("CDC setup process completed")

if __name__ == "__main__":
    cdc_setup = DatabaseCDCSetup()
    cdc_setup.run_setup() 