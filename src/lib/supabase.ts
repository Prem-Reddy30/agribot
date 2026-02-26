import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
};

export type KnowledgeArticle = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  tags: string[];
  language: string;
  views: number;
  created_at: string;
  updated_at: string;
};

export type Query = {
  id: string;
  query_text: string;
  category_id: string | null;
  language: string;
  status: 'pending' | 'answered' | 'resolved';
  user_location: string | null;
  created_at: string;
};

export type Response = {
  id: string;
  query_id: string;
  response_text: string;
  response_type: 'ai' | 'expert' | 'automated';
  helpful_count: number;
  created_at: string;
};
