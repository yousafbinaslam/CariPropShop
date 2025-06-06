/*
  # Initial Schema for Cari PropShop

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (bigint)
      - `location` (text)
      - `type` (enum: residential, commercial, industrial, land)
      - `bedrooms` (integer, nullable)
      - `bathrooms` (integer, nullable)
      - `area` (integer)
      - `images` (text array)
      - `featured` (boolean)
      - `virtual_360` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `location` (text)
      - `preferences` (text array)
      - `status` (enum: active, inactive, vip)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `property_id` (uuid, foreign key, nullable)
      - `date` (date)
      - `time` (time)
      - `type` (enum: viewing, consultation, signing)
      - `status` (enum: pending, confirmed, completed, cancelled)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `property_id` (uuid, foreign key, nullable)
      - `amount` (bigint)
      - `method` (enum: bank_transfer, e_wallet, credit_card, qris)
      - `status` (enum: pending, completed, failed, refunded)
      - `transaction_id` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'industrial', 'land');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'vip');
CREATE TYPE appointment_type AS ENUM ('viewing', 'consultation', 'signing');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'e_wallet', 'credit_card', 'qris');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price bigint NOT NULL CHECK (price > 0),
  location text NOT NULL,
  type property_type NOT NULL,
  bedrooms integer CHECK (bedrooms >= 0),
  bathrooms integer CHECK (bathrooms >= 0),
  area integer NOT NULL CHECK (area > 0),
  images text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  virtual_360 boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  preferences text[] DEFAULT '{}',
  status client_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  date date NOT NULL,
  time time NOT NULL,
  type appointment_type NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  amount bigint NOT NULL CHECK (amount > 0),
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_id text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Properties are viewable by everyone"
  ON properties
  FOR SELECT
  USING (true);

CREATE POLICY "Properties can be managed by authenticated users"
  ON properties
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for clients
CREATE POLICY "Clients can be managed by authenticated users"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for appointments
CREATE POLICY "Appointments can be managed by authenticated users"
  ON appointments
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for payments
CREATE POLICY "Payments can be managed by authenticated users"
  ON payments
  FOR ALL
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();