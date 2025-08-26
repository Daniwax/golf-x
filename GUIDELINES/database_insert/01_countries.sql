-- Countries Table Inserts
-- Table: countries (id, code, code3, name, continent)

INSERT INTO countries (id, code, code3, name, continent) VALUES 
(1, 'ES', 'ESP', 'Spain', 'Europe')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('countries_id_seq', (SELECT COALESCE(MAX(id), 0) FROM countries));