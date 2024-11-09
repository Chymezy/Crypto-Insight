POSTGRES_CONNECTION_STRING=postgresql://user:password@host:5432/database
MONGODB_CONNECTION_STRING=mongodb+srv://user:password@cluster/database
EVENTHUB_NAMESPACE=your-eventhub-namespace


## Components

### 1. PostgreSQL CDC Setup
- Enables logical replication
- Creates publication for specified tables
- Sets up replication slot
- Excludes Prisma metadata tables

Tables tracked:
- users
- user_profiles
- merchants
- products
- orders
- order_items
- stokvels
- stokvel_members
- subscription_plans
- user_subscriptions
- monitors
- mobile_tellings
- sponsors

### 2. MongoDB Change Streams
- Configures change streams for specific collections
- Filters relevant operations (insert, update, delete)
- Tracks specified collections only

Collections tracked:
- user_activities
- logs
- chat_messages
- notifications
- waste_reports
- community_feed
- analytics

### 3. Event Hub Connections
- Sets up producers for PostgreSQL changes
- Sets up producers for MongoDB changes
- Uses Azure managed identity for authentication

## Setup Process

1. Database Preparation:
   ```sql
   -- PostgreSQL setup
   ALTER SYSTEM SET wal_level = logical;
   ALTER SYSTEM SET max_replication_slots = 10;
   ALTER SYSTEM SET max_wal_senders = 10;
   ```

2. Run the Setup Script:
   ```bash
   python scripts/setup_cdc.py
   ```

3. Verify Setup:
   ```sql
   -- Check PostgreSQL replication
   SELECT * FROM pg_replication_slots;
   SELECT * FROM pg_publication;
   ```

## Monitoring

### PostgreSQL Monitoring
1. Check replication status:
   ```sql
   SELECT * FROM pg_stat_replication;
   ```

2. Monitor publication:
   ```sql
   SELECT * FROM pg_publication_tables;
   ```

### MongoDB Monitoring
1. Check change stream status:
   ```javascript
   db.adminCommand({ getParameter: 1, changeStreamOptions: 1 })
   ```

2. Monitor oplog:
   ```javascript
   db.oplog.rs.stats()
   ```

### Event Hub Monitoring
- Monitor Event Hub metrics in Azure Portal
- Check connection status
- Monitor message throughput

## Troubleshooting

### Common PostgreSQL Issues
1. Replication Slot Problems:
   - Error: "no replication slot"
   - Solution: Recreate replication slot
   ```sql
   SELECT pg_create_logical_replication_slot('wastedump_slot', 'pgoutput');
   ```

2. Publication Issues:
   - Error: "publication not found"
   - Solution: Verify and recreate publication
   ```sql
   CREATE PUBLICATION wastedump_pub FOR TABLE users, user_profiles...;
   ```

### Common MongoDB Issues
1. Change Stream Errors:
   - Error: "change streams require replication"
   - Solution: Ensure replica set is properly configured

2. Connection Issues:
   - Error: "not connected to replica set"
   - Solution: Verify connection string and network access

### Event Hub Issues
1. Connection Problems:
   - Error: "unauthorized access"
   - Solution: Check credentials and permissions

2. Performance Issues:
   - Error: "throughput exceeded"
   - Solution: Scale up Event Hub units

## Maintenance

### Regular Tasks
1. Monitor replication lag
2. Clean up unused replication slots
3. Monitor Event Hub capacity
4. Review change stream performance

### Backup Considerations
1. Maintain replication slot backups
2. Document publication configurations
3. Backup Event Hub configurations

## Security Considerations

### PostgreSQL Security
1. Use least-privilege accounts
2. Encrypt connections
3. Regular security audits

### MongoDB Security
1. Enable authentication
2. Use TLS/SSL
3. Network security rules

### Event Hub Security
1. Use managed identities
2. Implement network isolation
3. Regular key rotation

## Support and Resources
- PostgreSQL Documentation
- MongoDB Change Streams Guide
- Azure Event Hubs Documentation
- Contact: data-engineering@company.com