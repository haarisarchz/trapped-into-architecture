-- Add CHECK constraint to ensure profession is one of the allowed values.
ALTER TABLE public.profiles
ADD CONSTRAINT valid_profession_check 
CHECK (
  profession IS NULL OR 
  profession IN (
    'Practising Architect',
    'Academician',
    'Undergraduate Student',
    'Postgraduate Student',
    'Research Scholar'
  )
);

-- Ensure that when a profile is updated, profession becomes strictly required.
CREATE OR REPLACE FUNCTION enforce_profession_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profession IS NULL OR NEW.profession = '' THEN
    RAISE EXCEPTION 'Profession is a required field and must be selected.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_profession_provided ON public.profiles;
CREATE TRIGGER ensure_profession_provided
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_profession_on_update();

