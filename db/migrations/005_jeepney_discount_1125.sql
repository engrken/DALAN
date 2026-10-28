-- DALAN-only correction: use LTFRB-reported discounted ₱11.25 for Sep 2026 traditional PUJs.
-- This migration overrides historical preliminary v0.6.1 user-provided ₱11.20 value.
UPDATE public.dalan_fare_schedules SET
 discount_base_cents=1125,
 reported_alternative_discount_cents=NULL,
 source_name='LTFRB September 28, 2026 fare matrix reported by PTV News / Philippine Information Agency',
 source_url='https://ptvnews.ph/ltfrb-releases-new-matrices-for-puv-fare-hikes-effective-sept-28/',
 discount_description='Students, senior citizens and PWD: ₱11.25 first 4 km, ₱1.60 per succeeding kilometer. Qualifying students receive discounts on weekends and holidays.',
 verification_notes='LTFRB minimum updated to ₱11.25. Official route fare matrix and fractional-km billing method still require further validation for a legally final fare.',
 updated_at=now()
WHERE schedule_code='PUJ_TRADITIONAL_2026_09';
