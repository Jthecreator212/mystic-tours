## Quick Reference Commands

### Check Table Structure
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Get table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tours' 
ORDER BY ordinal_position;
```

### Check Indexes
```sql
-- List indexes for a table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tours';
```

### Check Foreign Keys
```sql
-- List foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
```

This documentation provides a complete reference for understanding and working with the Mystic Tours database schema efficiently.
