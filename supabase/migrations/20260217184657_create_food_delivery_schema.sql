/*
  # Food Delivery Platform Schema

  ## Overview
  Creates the complete database schema for a campus food delivery platform similar to Swiggy/Zomato.

  ## New Tables

  ### 1. `outlets`
  Campus food outlets/restaurants
  - `id` (uuid, primary key) - Unique outlet identifier
  - `name` (text) - Outlet name
  - `description` (text) - Outlet description
  - `image_url` (text) - Outlet banner/logo image
  - `cuisine_type` (text) - Type of cuisine (Indian, Chinese, Fast Food, etc.)
  - `rating` (numeric) - Average rating (0-5)
  - `delivery_time` (text) - Estimated delivery time
  - `is_open` (boolean) - Whether outlet is currently accepting orders
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `menu_items`
  Food items available at each outlet
  - `id` (uuid, primary key) - Unique item identifier
  - `outlet_id` (uuid, foreign key) - References outlets table
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `price` (numeric) - Item price
  - `image_url` (text) - Item image
  - `category` (text) - Item category (Starters, Main Course, Desserts, etc.)
  - `is_vegetarian` (boolean) - Vegetarian indicator
  - `is_available` (boolean) - Availability status
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `orders`
  Customer orders
  - `id` (uuid, primary key) - Unique order identifier
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone number
  - `delivery_address` (text) - Delivery address
  - `total_amount` (numeric) - Order total
  - `status` (text) - Order status (pending, confirmed, preparing, out_for_delivery, delivered, cancelled)
  - `created_at` (timestamptz) - Order placement timestamp

  ### 4. `order_items`
  Items in each order
  - `id` (uuid, primary key) - Unique record identifier
  - `order_id` (uuid, foreign key) - References orders table
  - `menu_item_id` (uuid, foreign key) - References menu_items table
  - `outlet_id` (uuid, foreign key) - References outlets table
  - `item_name` (text) - Item name snapshot
  - `quantity` (integer) - Quantity ordered
  - `price` (numeric) - Price per item at time of order
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for outlets and menu_items (anyone can browse)
  - Public insert access for orders and order_items (anyone can place orders)
  - Public read access for orders (users can track their orders)

  ## Notes
  1. All tables use UUID primary keys for security and scalability
  2. Prices stored as numeric for precision
  3. Order items store snapshot data to preserve historical accuracy
  4. Status enum for orders ensures data consistency
*/

-- Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  cuisine_type text DEFAULT '',
  rating numeric DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  delivery_time text DEFAULT '30-40 mins',
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  image_url text DEFAULT '',
  category text DEFAULT 'Main Course',
  is_vegetarian boolean DEFAULT true,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  outlet_id uuid NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outlets (public read access)
CREATE POLICY "Anyone can view outlets"
  ON outlets FOR SELECT
  TO public
  USING (true);

-- RLS Policies for menu_items (public read access)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- RLS Policies for orders (public read and insert access)
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for order_items (public read and insert access)
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_outlet_id ON menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);