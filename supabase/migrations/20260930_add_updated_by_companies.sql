-- Migration to add updated_by column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Make sure we update the RPCs or policies if necessary (usually not needed just for a column)