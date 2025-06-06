/*
  # Sample Data for Cari PropShop

  1. Sample Properties
  2. Sample Clients
  3. Sample Appointments
  4. Sample Payments
*/

-- Insert sample properties
INSERT INTO properties (title, description, price, location, type, bedrooms, bathrooms, area, images, featured, virtual_360) VALUES
(
  'Modern Villa Kemang',
  'Luxurious modern villa with contemporary design, featuring spacious living areas, premium finishes, and beautiful garden views. Perfect for families seeking comfort and elegance.',
  8500000000,
  'Kemang, Jakarta Selatan',
  'residential',
  4,
  3,
  350,
  ARRAY['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'],
  true,
  true
),
(
  'Luxury Apartment Senayan',
  'Premium apartment in the heart of Jakarta with stunning city views, modern amenities, and prime location. Close to shopping centers and business districts.',
  12000000000,
  'Senayan, Jakarta Pusat',
  'residential',
  3,
  2,
  180,
  ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
  true,
  true
),
(
  'Prime Office Space SCBD',
  'Grade A office space in the prestigious SCBD area. Fully furnished with modern facilities, high-speed internet, and professional meeting rooms.',
  25000000000,
  'SCBD, Jakarta Selatan',
  'commercial',
  NULL,
  NULL,
  500,
  ARRAY['https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg'],
  false,
  true
),
(
  'Industrial Warehouse Cikampek',
  'Strategic industrial warehouse with excellent logistics access, high ceiling, loading docks, and modern security systems. Perfect for distribution centers.',
  15000000000,
  'Cikampek, Jawa Barat',
  'industrial',
  NULL,
  NULL,
  2000,
  ARRAY['https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg'],
  false,
  false
),
(
  'Premium Land Plot Bali',
  'Exclusive land plot in Canggu with ocean views and development potential. Perfect for resort, villa, or commercial development projects.',
  5000000000,
  'Canggu, Bali',
  'land',
  NULL,
  NULL,
  1000,
  ARRAY['https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'],
  true,
  false
),
(
  'Contemporary House Bandung',
  'Beautiful contemporary house in the cool mountains of Bandung. Features modern architecture, large windows, and peaceful surroundings.',
  4500000000,
  'Dago, Bandung',
  'residential',
  5,
  4,
  420,
  ARRAY['https://images.pexels.com/photos/1396121/pexels-photo-1396121.jpeg'],
  false,
  true
);

-- Insert sample clients
INSERT INTO clients (name, email, phone, location, preferences, status) VALUES
(
  'Sarah Chen',
  'sarah.chen@email.com',
  '+62 812 3456 7890',
  'Jakarta Selatan',
  ARRAY['Modern', 'Luxury', 'High-rise'],
  'vip'
),
(
  'Ahmad Pratama',
  'ahmad.pratama@email.com',
  '+62 813 9876 5432',
  'Bandung',
  ARRAY['Traditional', 'Family-friendly'],
  'active'
),
(
  'Lisa Wijaya',
  'lisa.wijaya@email.com',
  '+62 814 5555 1234',
  'Surabaya',
  ARRAY['Contemporary', 'Waterfront', 'Investment'],
  'vip'
),
(
  'David Tan',
  'david.tan@email.com',
  '+62 815 7777 8888',
  'Bali',
  ARRAY['Villa', 'Resort-style'],
  'inactive'
),
(
  'Maria Santos',
  'maria.santos@email.com',
  '+62 816 1111 2222',
  'Jakarta Pusat',
  ARRAY['Apartment', 'City-center', 'Modern'],
  'active'
);

-- Insert sample appointments
INSERT INTO appointments (client_id, property_id, date, time, type, status, notes) VALUES
(
  (SELECT id FROM clients WHERE email = 'sarah.chen@email.com'),
  (SELECT id FROM properties WHERE title = 'Modern Villa Kemang'),
  '2025-01-25',
  '10:00:00',
  'viewing',
  'confirmed',
  'Client interested in luxury properties'
),
(
  (SELECT id FROM clients WHERE email = 'ahmad.pratama@email.com'),
  (SELECT id FROM properties WHERE title = 'Luxury Apartment Senayan'),
  '2025-01-26',
  '14:00:00',
  'consultation',
  'pending',
  'First-time buyer consultation'
),
(
  (SELECT id FROM clients WHERE email = 'lisa.wijaya@email.com'),
  (SELECT id FROM properties WHERE title = 'Contemporary House Bandung'),
  '2025-01-27',
  '11:30:00',
  'signing',
  'confirmed',
  'Final contract signing'
),
(
  (SELECT id FROM clients WHERE email = 'maria.santos@email.com'),
  (SELECT id FROM properties WHERE title = 'Prime Office Space SCBD'),
  '2025-01-28',
  '09:00:00',
  'viewing',
  'pending',
  'Corporate office space requirement'
);

-- Insert sample payments
INSERT INTO payments (client_id, property_id, amount, method, status, transaction_id, description) VALUES
(
  (SELECT id FROM clients WHERE email = 'sarah.chen@email.com'),
  (SELECT id FROM properties WHERE title = 'Modern Villa Kemang'),
  50000000,
  'bank_transfer',
  'completed',
  'TXN-2025-001',
  'Booking fee for property viewing'
),
(
  (SELECT id FROM clients WHERE email = 'ahmad.pratama@email.com'),
  (SELECT id FROM properties WHERE title = 'Luxury Apartment Senayan'),
  25000000,
  'e_wallet',
  'pending',
  'TXN-2025-002',
  'Consultation fee'
),
(
  (SELECT id FROM clients WHERE email = 'lisa.wijaya@email.com'),
  (SELECT id FROM properties WHERE title = 'Contemporary House Bandung'),
  100000000,
  'credit_card',
  'completed',
  'TXN-2025-003',
  'Down payment'
),
(
  (SELECT id FROM clients WHERE email = 'david.tan@email.com'),
  (SELECT id FROM properties WHERE title = 'Premium Land Plot Bali'),
  15000000,
  'qris',
  'failed',
  'TXN-2025-004',
  'Service fee'
),
(
  (SELECT id FROM clients WHERE email = 'maria.santos@email.com'),
  (SELECT id FROM properties WHERE title = 'Prime Office Space SCBD'),
  75000000,
  'bank_transfer',
  'completed',
  'TXN-2025-005',
  'Office space deposit'
);