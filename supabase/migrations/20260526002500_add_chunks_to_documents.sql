-- Add a chunks JSONB column to the documents table to store extracted text chunks
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS chunks JSONB DEFAULT '[]'::jsonb;
