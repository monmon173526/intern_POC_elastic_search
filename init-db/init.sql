CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    tags TEXT[]
);

INSERT INTO product (name, description, price, tags) VALUES
('Wireless Mouse', 'A comfortable ergonomic wireless mouse', 19.99, ARRAY['electronics', 'accessories', 'mouse']),
('Gaming Keyboard', 'Mechanical keyboard with RGB lighting', 49.99, ARRAY['electronics', 'gaming', 'keyboard']),
('Laptop Stand', 'Aluminum stand for laptops up to 17 inches', 29.99, ARRAY['office', 'laptop', 'accessories']),
('USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 39.99, ARRAY['electronics', 'usb', 'hub']),
('Bluetooth Speaker', 'Portable speaker with deep bass and long battery life', 59.99, ARRAY['audio', 'bluetooth', 'music']),
('Noise Cancelling Headphones', 'Over-ear headphones with active noise cancellation', 89.99, ARRAY['audio', 'headphones', 'travel']),
('Smart LED Bulb', 'Color-changing LED bulb controlled by app', 14.99, ARRAY['smart home', 'lighting', 'energy']),
('Portable SSD', 'Fast and reliable 1TB external SSD', 99.99, ARRAY['storage', 'ssd', 'portable']),
('Fitness Tracker', 'Water-resistant fitness tracker with heart rate monitor', 34.99, ARRAY['fitness', 'wearable', 'tracker']),
('4K Monitor', 'Ultra HD 27-inch monitor with IPS panel', 229.99, ARRAY['display', 'monitor', '4k']);
