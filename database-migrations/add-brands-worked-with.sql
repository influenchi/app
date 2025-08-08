-- Migration: Add brands_worked_with column to creators table
-- Date: 2024-12-19
-- Description: Add support for storing brands that creators have worked with

ALTER TABLE public.creators 
ADD COLUMN brands_worked_with jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.creators.brands_worked_with IS 'JSON array of brands the creator has worked with, containing name and optional URL';
