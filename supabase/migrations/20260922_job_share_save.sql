-- Create saved_jobs table for user <-> job relationships
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Create RPC for atomic increment of share count
CREATE OR REPLACE FUNCTION increment_share_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs SET share_count = COALESCE(share_count, 0) + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC for atomic increment of save count
CREATE OR REPLACE FUNCTION increment_save_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs SET save_count = COALESCE(save_count, 0) + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC for atomic decrement of save count
CREATE OR REPLACE FUNCTION decrement_save_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs SET save_count = GREATEST(COALESCE(save_count, 0) - 1, 0) WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
