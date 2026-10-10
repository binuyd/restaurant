-- Replace the starter catalog with plant-based alternatives without deleting order history.
UPDATE menu_items SET
    name = 'Truffle Mushroom Crostini',
    description = 'Roasted wild mushrooms, truffle oil, parsley, and balsamic glaze on toasted sourdough.',
    price = 11.50,
    image_url = 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80'
WHERE id = 1;

UPDATE menu_items SET
    name = 'Crispy Cauliflower Bites',
    description = 'Golden cauliflower bites with lemon, herbs, and a bright roasted garlic dip.',
    price = 10.50,
    image_url = 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80'
WHERE id = 2;

UPDATE menu_items SET
    name = 'Smoky Bean Burger',
    description = 'House-made black bean patty, avocado, pickled onions, greens, and tomato in a toasted bun.',
    price = 16.50,
    image_url = 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80'
WHERE id = 3;

UPDATE menu_items SET
    name = 'Roasted Vegetable Risotto',
    description = 'Creamy arborio rice with roasted seasonal vegetables, lemon, basil, and toasted seeds.',
    price = 17.50,
    image_url = 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80'
WHERE id = 4;

UPDATE menu_items SET
    name = 'Garden Margherita Pizza',
    description = 'Tomato sauce, basil, roasted peppers, mushrooms, and dairy-free herb cream on a crisp crust.',
    price = 15.50,
    image_url = 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80'
WHERE id = 5;

UPDATE menu_items SET
    name = 'Spicy Pepper and Olive Pizza',
    description = 'Tomato sauce, roasted peppers, kalamata olives, chili, herbs, and dairy-free cheese.',
    price = 16.50,
    image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
WHERE id = 6;

UPDATE menu_items SET
    name = 'Coconut Chocolate Mousse',
    description = 'Silky dark chocolate mousse with coconut cream, cacao nibs, and fresh berries.',
    price = 8.50,
    image_url = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'
WHERE id = 7;

UPDATE menu_items SET
    name = 'Warm Apple Crumble',
    description = 'Cinnamon apples with an oat-almond crumble and vanilla coconut cream.',
    price = 8.50,
    image_url = 'https://images.unsplash.com/photo-1568571780765-9276ac7b9a3f?auto=format&fit=crop&w=600&q=80'
WHERE id = 8;

UPDATE menu_items SET
    name = 'Passionfruit Mint Iced Tea',
    description = 'Black tea infused with passionfruit, fresh mint, and a squeeze of lime.',
    price = 4.50,
    image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80'
WHERE id = 9;

UPDATE menu_items SET
    name = 'Sparkling Citrus Cooler',
    description = 'Sparkling water with grapefruit, orange, rosemary, and a touch of agave.',
    price = 5.00,
    image_url = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
WHERE id = 10;
