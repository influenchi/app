-- Migration script to update campaigns table for new budget types and affiliate program
-- Run this in your Supabase SQL editor to update the campaigns table

-- Add affiliate_program column if it doesn't exist
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS affiliate_program TEXT;

-- Update the budget_type constraint to use new values
-- First, drop the existing constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_budget_type_check;

-- Add the new constraint with updated budget types
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_budget_type_check 
CHECK (budget_type IN ('paid', 'gifted', 'affiliate', 'cash', 'product', 'service'));

-- Update existing data to use new budget type values (optional migration of existing data)
-- This maps old values to new values:
-- 'cash' -> 'paid'
-- 'product' -> 'gifted' 
-- 'service' -> 'affiliate'

UPDATE campaigns SET budget_type = 'paid' WHERE budget_type = 'cash';
UPDATE campaigns SET budget_type = 'gifted' WHERE budget_type = 'product';
UPDATE campaigns SET budget_type = 'affiliate' WHERE budget_type = 'service';

-- After data migration, update constraint to only allow new values
ALTER TABLE campaigns 
DROP CONSTRAINT campaigns_budget_type_check;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_budget_type_check 
CHECK (budget_type IN ('paid', 'gifted', 'affiliate'));

-- Add index for the new affiliate_program column for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_affiliate_program ON campaigns(affiliate_program);

-- Display current table structure for verification
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;