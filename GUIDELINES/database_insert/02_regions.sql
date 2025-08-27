-- Regions Table Inserts
-- Table: regions (id, country_id, code, name, type)

INSERT INTO regions (id, country_id, code, name, type) VALUES 
(1, 1, 'MAD', 'Madrid', 'autonomous_community')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('regions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM regions));