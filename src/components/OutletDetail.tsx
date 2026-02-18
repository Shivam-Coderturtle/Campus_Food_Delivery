import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Leaf } from 'lucide-react';
import { supabase, Outlet, MenuItem } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import MenuItemCard from './MenuItemCard';

interface OutletDetailProps {
  outlet: Outlet;
  onBack: () => void;
}

export default function OutletDetail({ outlet, onBack }: OutletDetailProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, [outlet.id]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('outlet_id', outlet.id)
        .eq('is_available', true)
        .order('category');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];
  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item, outlet.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={outlet.image_url}
          alt={outlet.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="h-6 w-6 text-gray-800" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 text-white p-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{outlet.name}</h1>
          <p className="text-sm sm:text-base opacity-90 mb-3">{outlet.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{outlet.rating}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span>{outlet.delivery_time}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {outlet.cuisine_type}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-40 animate-pulse">
                <div className="flex">
                  <div className="w-40 h-40 bg-gray-200" />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Leaf className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No items found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
