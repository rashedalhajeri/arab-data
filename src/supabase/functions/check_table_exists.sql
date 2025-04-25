
-- Create a function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(schema_name TEXT, table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = schema_name 
    AND table_name = table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
