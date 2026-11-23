-- ==============================================================================
-- Migration: Add Permissive RLS Policy and Link All 32 Master Architect Portraits
-- Date: 23 November 2026
-- ==============================================================================

-- 1. Ensure Admins / App can manage architecture catalog and catalog columns
ALTER TABLE IF EXISTS public.architecture_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.catalog_columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view architecture catalog" ON public.architecture_catalog;
CREATE POLICY "Public can view architecture catalog"
  ON public.architecture_catalog
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage architecture catalog" ON public.architecture_catalog;
CREATE POLICY "Admins can manage architecture catalog"
  ON public.architecture_catalog
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view catalog columns" ON public.catalog_columns;
CREATE POLICY "Public can view catalog columns"
  ON public.catalog_columns
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage catalog columns" ON public.catalog_columns;
CREATE POLICY "Admins can manage catalog columns"
  ON public.catalog_columns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Link All 32 Architect Photos across all active catalog entries
-- Frank Lloyd Wright
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/frank-lloyd-wright.jpg"')
WHERE data->>'architect' ILIKE '%Frank Lloyd Wright%';

-- Le Corbusier
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/le-corbusier.jpg"')
WHERE data->>'architect' ILIKE '%Le Corbusier%';

-- Ludwig Mies van der Rohe
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/ludwig-mies-van-der-rohe.jpg"')
WHERE data->>'architect' ILIKE '%Mies van der Rohe%';

-- B. V. Doshi
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/b-v-doshi.jpg"')
WHERE data->>'architect' ILIKE '%Doshi%';

-- Norman Foster
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/norman-foster.jpg"')
WHERE data->>'architect' ILIKE '%Foster%';

-- Frank Gehry
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/frank-gehry.jpg"')
WHERE data->>'architect' ILIKE '%Gehry%';

-- Zaha Hadid
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/zaha-hadid.jpg"')
WHERE data->>'architect' ILIKE '%Zaha Hadid%';

-- Tadao Ando
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/tadao-ando.jpg"')
WHERE data->>'architect' ILIKE '%Tadao Ando%';

-- Santiago Calatrava
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/santiago-calatrava.jpg"')
WHERE data->>'architect' ILIKE '%Calatrava%';

-- Renzo Piano
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/renzo-piano.jpg"')
WHERE data->>'architect' ILIKE '%Renzo Piano%';

-- Antoni Gaudí
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/antoni-gaudi.jpg"')
WHERE data->>'architect' ILIKE '%Gaudí%' OR data->>'architect' ILIKE '%Gaudi%';

-- Eero Saarinen
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/eero-saarinen.jpg"')
WHERE data->>'architect' ILIKE '%Saarinen%';

-- I. M. Pei
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/i-m-pei.jpg"')
WHERE data->>'architect' ILIKE '%Pei%';

-- Rem Koolhaas
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/rem-koolhaas.jpg"')
WHERE data->>'architect' ILIKE '%Koolhaas%';

-- Oscar Niemeyer
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/oscar-niemeyer.jpg"')
WHERE data->>'architect' ILIKE '%Niemeyer%';

-- Jean Nouvel
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/jean-nouvel.jpg"')
WHERE data->>'architect' ILIKE '%Nouvel%';

-- Philip Johnson
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/philip-johnson.jpg"')
WHERE data->>'architect' ILIKE '%Philip Johnson%' AND data->>'architect' NOT ILIKE '%Mies van der Rohe%';

-- Charles Correa
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/charles-correa.jpg"')
WHERE data->>'architect' ILIKE '%Correa%';

-- Louis Kahn
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/louis-kahn.jpg"')
WHERE data->>'architect' ILIKE '%Kahn%';

-- Alvar Aalto
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/alvar-aalto.jpg"')
WHERE data->>'architect' ILIKE '%Aalto%';

-- Jørn Utzon
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/jorn-utzon.jpg"')
WHERE data->>'architect' ILIKE '%Utzon%';

-- Laurie Baker
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/laurie-baker.jpg"')
WHERE data->>'architect' ILIKE '%Baker%';

-- Peter Zumthor
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/peter-zumthor.jpg"')
WHERE data->>'architect' ILIKE '%Zumthor%';

-- Toyo Ito
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/toyo-ito.jpg"')
WHERE data->>'architect' ILIKE '%Toyo Ito%' OR data->>'architect' ILIKE '%Toyoo Itō%';

-- Kenzō Tange
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/kenzo-tange.jpg"')
WHERE data->>'architect' ILIKE '%Tange%';

-- Raj Rewal
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/raj-rewal.jpg"')
WHERE data->>'architect' ILIKE '%Rewal%';

-- Jacques Herzog & Pierre de Meuron
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/herzog-de-meuron.jpg"')
WHERE data->>'architect' ILIKE '%Herzog%';

-- Richard Rogers
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/richard-rogers.jpg"')
WHERE data->>'architect' ILIKE '%Richard Rogers%' AND data->>'architect' NOT ILIKE '%Renzo Piano%';

-- SANAA (Kazuyo Sejima & Ryue Nishizawa)
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/sanaa-sejima-nishizawa.jpg"')
WHERE data->>'architect' ILIKE '%SANAA%' OR data->>'architect' ILIKE '%Sejima%';

-- Fariborz Sahba
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/fariborz-sahba.jpg"')
WHERE data->>'architect' ILIKE '%Sahba%';

-- Roger Anger
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/roger-anger.jpg"')
WHERE data->>'architect' ILIKE '%Anger%';

-- Frei Otto
UPDATE public.architecture_catalog
SET data = jsonb_set(COALESCE(data, '{}'::jsonb), '{architect_photo}', '"/architect-photos/frei-otto.jpg"')
WHERE data->>'architect' ILIKE '%Frei Otto%';

-- 3. Also mark the 5 deleted buildings as removed
UPDATE public.architecture_catalog
SET is_locked = true,
    data = jsonb_set(
      jsonb_set(
        jsonb_set(COALESCE(data, '{}'::jsonb), '{is_removed}', 'true'::jsonb),
        '{status}', '"removed"'
      ),
      '{building_photo}', 'null'::jsonb
    )
WHERE data->>'building_name' ILIKE '%Casa Luis Barrag%'
   OR data->>'building_name' ILIKE '%IIFM Bhopal%'
   OR data->>'building_name' ILIKE '%IIT Kanpur%'
   OR data->>'building_name' ILIKE '%Getty Center%'
   OR data->>'building_name' ILIKE '%Chichu Art Museum%';
