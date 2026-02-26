/*
  KrishiSahay Agricultural Query System Schema

  1. New Tables
    - categories: Stores agricultural categories (Crops, Pests, Fertilizers, Schemes, etc.)
    - knowledge_articles: Stores knowledge base articles with multilingual support
    - queries: Stores user queries with status tracking
    - responses: Stores AI/expert responses to queries

  2. Security
    - Enable RLS on all tables
    - Public read access for knowledge base
    - Public can submit queries and read responses
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'leaf',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  language text DEFAULT 'en',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge articles are viewable by everyone"
  ON knowledge_articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  language text DEFAULT 'en',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'resolved')),
  user_location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create queries"
  ON queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Queries are viewable by everyone"
  ON queries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE NOT NULL,
  response_text text NOT NULL,
  response_type text DEFAULT 'ai' CHECK (response_type IN ('ai', 'expert', 'automated')),
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses are viewable by everyone"
  ON responses FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert initial categories
INSERT INTO categories (name, description, icon) VALUES
  ('Crops', 'Information about different crops, cultivation methods, and best practices', 'sprout'),
  ('Pests & Diseases', 'Pest identification, disease management, and treatment solutions', 'bug'),
  ('Fertilizers', 'Fertilizer types, application methods, and soil nutrition', 'droplets'),
  ('Weather', 'Weather forecasts, seasonal advice, and climate information', 'cloud-sun'),
  ('Government Schemes', 'Agricultural schemes, subsidies, and government support programs', 'building-2'),
  ('Market Prices', 'Crop prices, market trends, and selling guidance', 'trending-up')
ON CONFLICT DO NOTHING;

-- Insert sample knowledge articles
INSERT INTO knowledge_articles (category_id, title, content, tags, language) VALUES
  (
    (SELECT id FROM categories WHERE name = 'Crops' LIMIT 1),
    'Rice Cultivation Best Practices',
    'Rice is one of the most important crops. Best practices include: 1) Select quality seeds, 2) Prepare soil properly with adequate drainage, 3) Maintain water levels at 2-3 inches, 4) Apply fertilizers at right time, 5) Monitor for pests regularly.',
    ARRAY['rice', 'cultivation', 'paddy', 'farming'],
    'en'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Pests & Diseases' LIMIT 1),
    'Common Pest Management',
    'Common pests include aphids, bollworms, and stem borers. Management: 1) Regular field monitoring, 2) Use of resistant varieties, 3) Biological control methods, 4) Integrated Pest Management (IPM), 5) Judicious use of pesticides only when necessary.',
    ARRAY['pests', 'management', 'ipm', 'control'],
    'en'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Fertilizers' LIMIT 1),
    'Organic Fertilizers Guide',
    'Organic fertilizers improve soil health naturally. Types include: 1) Compost - decomposed organic matter, 2) Vermicompost - worm castings, 3) Green manure - cover crops, 4) Farm yard manure, 5) Biofertilizers. Benefits include better soil structure and sustained nutrition.',
    ARRAY['organic', 'fertilizer', 'compost', 'soil-health'],
    'en'
  )
ON CONFLICT DO NOTHING;