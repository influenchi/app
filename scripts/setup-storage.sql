-- Create the uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the uploads bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'uploads');

CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up size limits (50MB max per file)
CREATE OR REPLACE FUNCTION storage.check_file_size()
RETURNS trigger AS $$
BEGIN
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 52428800 THEN
    RAISE EXCEPTION 'File size exceeds 50MB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the size check trigger
DROP TRIGGER IF EXISTS check_file_size_trigger ON storage.objects;
CREATE TRIGGER check_file_size_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION storage.check_file_size(); 