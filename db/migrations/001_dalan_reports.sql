-- DALAN pilot: additive schema. No CLEAR tables or other projects modified.
CREATE TABLE IF NOT EXISTS public.dalan_reports (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 category TEXT NOT NULL CHECK (category IN ('road','fare','transport','accessibility','other')),
 area TEXT NOT NULL CHECK (char_length(area) BETWEEN 2 AND 100),
 details TEXT NOT NULL CHECK (char_length(details) BETWEEN 10 AND 500),
 approx_lat NUMERIC(5,2),
 approx_lng NUMERIC(5,2),
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 reviewed_at TIMESTAMPTZ,
 CONSTRAINT dalan_coords_both_or_none CHECK ((approx_lat IS NULL AND approx_lng IS NULL) OR (approx_lat IS NOT NULL AND approx_lng IS NOT NULL)),
 CONSTRAINT dalan_lat_range CHECK (approx_lat IS NULL OR (approx_lat BETWEEN -90 AND 90)),
 CONSTRAINT dalan_lng_range CHECK (approx_lng IS NULL OR (approx_lng BETWEEN -180 AND 180))
);
