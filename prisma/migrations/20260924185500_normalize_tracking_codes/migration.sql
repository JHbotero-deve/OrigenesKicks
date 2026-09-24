-- Normalize legacy guest tracking codes to the current public format: OK- + 10 hex chars.
UPDATE "pedidos"
SET "tracking_code" = 'OK-' || UPPER(SUBSTRING(MD5("id" || RANDOM()::TEXT) FROM 1 FOR 10))
WHERE "tracking_code" ~ '^OK-[A-Fa-f0-9]{8}$';
