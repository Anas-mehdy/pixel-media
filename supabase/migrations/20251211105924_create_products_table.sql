/*
  # Create Products Table for AI Bot Knowledge Base

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Product price
      - `stock_quantity` (integer) - Inventory count
      - `bot_notes` (text) - AI agent training data and context
      - `image_url` (text) - Product image URL
      - `client_id` (text) - Links to client for multi-tenancy
      
  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to manage their products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  price numeric,
  stock_quantity integer,
  bot_notes text,
  image_url text,
  client_id text
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_client_id ON products(client_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
