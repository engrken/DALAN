-- DALAN-only short-lived trip sharing; run against dalan-db/neondb.
CREATE TABLE IF NOT EXISTS public.dalan_trip_shares (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 viewer_token_hash char(64) UNIQUE NOT NULL,
 owner_token_hash char(64) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 stopped_at timestamptz,
 last_seen_at timestamptz,
 last_lat double precision,
 last_lng double precision,
 last_accuracy_m integer,
 last_speed_kph double precision,
 mode_hint text NOT NULL DEFAULT 'unknown' CHECK (mode_hint IN ('unknown','walking','motorized')),
 vehicle_type text NOT NULL DEFAULT 'unknown' CHECK (vehicle_type IN ('unknown','tricycle','jeepney','bus','van','car','motorcycle','walking','other')),
 plate_no varchar(20), operator_label varchar(80), share_vehicle_details boolean NOT NULL DEFAULT false,
 destination_label varchar(120),
 CONSTRAINT dalan_trip_expiry CHECK (expires_at > created_at AND expires_at <= created_at + interval '2 hours'),
 CONSTRAINT dalan_trip_coordinates CHECK ((last_lat IS NULL AND last_lng IS NULL) OR (last_lat BETWEEN -90 AND 90 AND last_lng BETWEEN -180 AND 180)),
 CONSTRAINT dalan_trip_accuracy CHECK (last_accuracy_m IS NULL OR (last_accuracy_m >= 0 AND last_accuracy_m <= 10000)),
 CONSTRAINT dalan_trip_speed CHECK (last_speed_kph IS NULL OR (last_speed_kph BETWEEN 0 AND 300))
);
