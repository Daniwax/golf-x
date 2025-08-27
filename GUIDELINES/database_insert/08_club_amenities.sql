-- Club Amenities Table Inserts
-- Table: club_amenities (id, club_id, has_driving_range, has_putting_green, has_chipping_area, has_practice_bunker, has_pro_shop, has_restaurant, has_bar, has_cart_rental, has_club_rental, has_caddie_service, has_lessons, has_locker_room)

INSERT INTO club_amenities (
    club_id,
    has_driving_range,
    has_putting_green,
    has_chipping_area,
    has_practice_bunker,
    has_pro_shop,
    has_restaurant,
    has_bar,
    has_cart_rental,
    has_club_rental,
    has_caddie_service,
    has_lessons,
    has_locker_room
) VALUES (
    1,  -- Real Club La Moraleja
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
)
ON CONFLICT (club_id) DO NOTHING;

-- Reset sequence
SELECT setval('club_amenities_id_seq', (SELECT COALESCE(MAX(id), 0) FROM club_amenities));