-- DALAN v0.6.1 user-supplied fare schedule reference. Never apply to CLEAR or ASPECT.
CREATE TABLE IF NOT EXISTS public.dalan_fare_schedules (
 schedule_code varchar(50) PRIMARY KEY,
 mode varchar(28) NOT NULL CHECK (mode IN ('tricycle','jeepney_traditional')),
 city varchar(120) NOT NULL,
 label varchar(160) NOT NULL,
 effective_from date NOT NULL,
 verification_status varchar(28) NOT NULL CHECK(verification_status IN ('provisional','verified','suspended')),
 source_name varchar(180) NOT NULL,
 source_url text,
 base_distance_km integer NOT NULL CHECK(base_distance_km BETWEEN 1 AND 20),
 regular_base_cents integer NOT NULL CHECK (regular_base_cents>=0),
 discount_base_cents integer NOT NULL CHECK (discount_base_cents>=0),
 regular_extra_cents integer NOT NULL CHECK (regular_extra_cents>=0),
 discount_extra_cents integer NOT NULL CHECK (discount_extra_cents>=0),
 reported_alternative_discount_cents integer,
 discount_description varchar(300),
 calculation_policy varchar(50) NOT NULL DEFAULT 'whole_kilometers_only' CHECK(calculation_policy='whole_kilometers_only'),
 verification_notes text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.dalan_fare_schedules(schedule_code,mode,city,label,effective_from,verification_status,source_name,source_url,base_distance_km,regular_base_cents,discount_base_cents,regular_extra_cents,discount_extra_cents,discount_description,verification_notes)
VALUES('ROXAS_TRICYCLE_2024','tricycle','Roxas City, Capiz','Roxas City Motorized Tricycle Standard Fare','2024-08-27','provisional','Roxas City Ordinance No. 024-2024 (user-supplied) / Daily Guardian 2024-08-27','https://www.dailyguardian.com.ph/blog/new-tricycle-fare-rates-in-roxas-city-take-effect-today',2,1500,1000,500,500,'Student, PWD and senior: ₱10.00 first 2 km; additional ₱5.00 per succeeding whole km.','Full signed ordinance and latest amendments not independently validated.')
ON CONFLICT(schedule_code) DO NOTHING;
INSERT INTO public.dalan_fare_schedules(schedule_code,mode,city,label,effective_from,verification_status,source_name,source_url,base_distance_km,regular_base_cents,discount_base_cents,regular_extra_cents,discount_extra_cents,reported_alternative_discount_cents,discount_description,verification_notes)
VALUES('PUJ_TRADITIONAL_2026_09','jeepney_traditional','Philippines / Roxas City pilot','Traditional Public Utility Jeepney Fare','2026-09-28','provisional','User supplied 2026 guide; PTV News LTFRB report','https://ptvnews.ph/ltfrb-releases-new-matrices-for-puv-fare-hikes-effective-sept-28/',4,1400,1120,200,160,1125,'Student/PWD/Senior ₱11.20 initial per user; government report shows ₱11.25. Extra ₱1.60/km for discounted fares.','Discounted base discrepancy: user-provided ₱11.20 vs government-reported ₱11.25. Confirm posted current official matrix.')
ON CONFLICT(schedule_code) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.dalan_tricycle_overcharge_guidance(
 offense_number smallint PRIMARY KEY CHECK(offense_number BETWEEN 1 AND 4),fine_cents integer,license_action varchar(150),source_note varchar(240) NOT NULL,
 legal_verification_status varchar(30) NOT NULL DEFAULT 'unverified_full_text' CHECK (legal_verification_status IN ('unverified_full_text','verified','superseded'))
);
INSERT INTO public.dalan_tricycle_overcharge_guidance(offense_number,fine_cents,license_action,source_note) VALUES
(1,150000,NULL,'User-supplied Ordinance No. 024-2024 overcharging penalty; needs ordinance text check'),
(2,300000,NULL,'User-supplied Ordinance No. 024-2024 overcharging penalty; needs ordinance text check'),
(3,500000,NULL,'User-supplied Ordinance No. 024-2024 overcharging penalty; needs ordinance text check'),
(4,NULL,'Reported 3-month franchise suspension for fourth and subsequent violation','User-supplied Ordinance No. 024-2024 overcharging penalty; needs ordinance text check')
ON CONFLICT(offense_number) DO NOTHING;
