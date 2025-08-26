-- Golf Clubs Table Inserts
-- Table: golf_clubs (id, external_id, slug, name, country_id, region_id, city, address, latitude, longitude, established_year, designer, club_type, has_royal_prefix, website, phone, data_source, confidence_score)

INSERT INTO golf_clubs (
    id, 
    external_id, 
    slug, 
    name, 
    country_id, 
    region_id, 
    city, 
    address, 
    latitude, 
    longitude, 
    established_year, 
    designer, 
    club_type, 
    has_royal_prefix, 
    website, 
    phone, 
    data_source, 
    confidence_score
) VALUES (
    1, 
    'real-club-la-moraleja', 
    'real-club-la-moraleja', 
    'Real Club La Moraleja', 
    1, 
    1, 
    'Alcobendas', 
    'Paseo del Conde de los Gaitanes, 127', 
    40.516479, 
    -3.617651, 
    1973, 
    'Jack Nicklaus', 
    'private', 
    true, 
    'https://www.realclublamoraleja.com', 
    '+34 916 500 700', 
    'manual', 
    0.95
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('golf_clubs_id_seq', (SELECT COALESCE(MAX(id), 0) FROM golf_clubs));