-- V2__seed_data.sql

-- Seed Users (Passwords: admin123, customer123 encoded with BCrypt)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@gourmet.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym502.66nLm6uQ0vBwT3kG', 'ADMIN'),
('Alice Customer', 'customer@gourmet.com', '$2a$10$e7jT711zWpS5WlJ16w9JCe/Tf1h8z5N109A1d5D9j5B4E0qQ7x40C', 'CUSTOMER');

-- Seed Categories
INSERT INTO categories (name) VALUES
('Starters'),
('Main Courses'),
('Artisanal Pizzas'),
('Desserts'),
('Beverages');

-- Seed Menu Items
INSERT INTO menu_items (category_id, name, description, price, image_url, available) VALUES
(1, 'Truffle Burrata', 'Fresh Italian burrata with heirloom tomatoes, truffle oil, and aged balsamic glaze.', 14.50, 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=600&q=80', true),
(1, 'Crispy Calamari', 'Tender squid rings served with spicy garlic aioli and fresh lemon wedges.', 12.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80', true),
(2, 'Wagyu Beef Burger', 'Brioche bun, 8oz Wagyu patty, aged cheddar, caramelised onions, and truffle fries.', 19.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', true),
(2, 'Pan-Seared Salmon', 'Atlantic salmon with lemon herb butter, asparagus spears, and saffron risotto.', 22.50, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', true),
(3, 'Neapolitan Margherita', 'San Marzano tomato sauce, fior di latte mozzarella, fresh basil, and extra virgin olive oil.', 16.00, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80', true),
(3, 'Diavola Spicy Pepperoni', 'Spicy Calabrian salami, chili flakes, tomato sauce, and mozzarella.', 18.00, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80', true),
(4, 'Classic Tiramisu', 'Savoiardi soaked in espresso, mascarpone cream, and dark cocoa powder dusting.', 8.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', true),
(4, 'Molten Chocolate Lava Cake', 'Warm chocolate cake with a molten center, served with vanilla bean ice cream.', 9.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', true),
(5, 'Craft Iced Passionfruit Tea', 'Refreshing black tea infused with real passionfruit pulp and mint.', 4.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', true),
(5, 'Sparkling San Pellegrino (750ml)', 'Italian natural sparkling mineral water.', 5.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80', true);
