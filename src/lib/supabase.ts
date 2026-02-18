import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Outlet {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cuisine_type: string;
  rating: number;
  delivery_time: string;
  is_open: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  outlet_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_vegetarian: boolean;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  outlet_id: string;
  item_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  outlet_name: string;
}
