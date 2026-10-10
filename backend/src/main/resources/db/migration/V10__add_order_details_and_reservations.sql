-- V10__add_order_details_and_reservations.sql

-- 1. Enhance orders table with dining mode, table number, contact and instructions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'DINE_IN';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number VARCHAR(30);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT;

-- 2. Create reservations table for table booking management
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(20) NOT NULL,
    party_size INT NOT NULL,
    seating_area VARCHAR(50) DEFAULT 'MAIN_DINING',
    special_occasion VARCHAR(50) DEFAULT 'CASUAL',
    special_requests TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial reservations
INSERT INTO reservations (user_id, guest_name, guest_email, guest_phone, reservation_date, reservation_time, party_size, seating_area, special_occasion, special_requests, status)
VALUES
(2, 'Alice Customer', 'customer@gourmet.com', '+1 (555) 019-4821', CURRENT_DATE, '19:30', 4, 'WINDOW', 'ANNIVERSARY', 'Window view table requested for anniversary celebration.', 'CONFIRMED'),
(2, 'David Miller', 'david.m@example.com', '+1 (555) 019-8392', CURRENT_DATE, '20:00', 2, 'OUTDOOR', 'ROMANTIC', 'Quiet terrace corner preferred.', 'CONFIRMED');

-- 3. Create reviews table for customer feedback and dish ratings
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial reviews
INSERT INTO reviews (menu_item_id, user_id, customer_name, rating, comment)
VALUES
(1, 2, 'Alice Customer', 5, 'The Truffle Mushroom Crostini was incredible! Crispy, fragrant, and perfectly balanced.'),
(3, 2, 'Alice Customer', 5, 'Best Smoky Bean Burger I have had in years. The house pickled onions make it exceptional!'),
(5, 2, 'Michael Chen', 4, 'Crispy crust and flavorful tomato sauce on the Garden Margherita. Delicious!'),
(7, 2, 'Elena Rostova', 5, 'The Coconut Chocolate Mousse is decadent yet light. Highly recommend!');
