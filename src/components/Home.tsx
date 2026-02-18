import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase, Outlet } from '../lib/supabase';
import OutletCard from './OutletCard';

interface HomeProps {
  onSelectOutlet: (outlet: Outlet) => void;
}

export default function Home({ onSelectOutlet }: HomeProps) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOutlets(outlets);
    } else {
      const filtered = outlets.filter(
        (outlet) =>
          outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          outlet.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOutlets(filtered);
    }
  }, [searchQuery, outlets]);

  const fetchOutlets = async () => {
    try {
      const { data, error } = await supabase
        .from('outlets')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setOutlets(data || []);
      setFilteredOutlets(data || []);
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-center">
            Hungry? Order Now!
          </h1>
          <p className="text-center text-lg opacity-90 mb-8">
            Delicious food from your favorite campus outlets delivered to your doorstep
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          {searchQuery ? `Search Results (${filteredOutlets.length})` : 'All Restaurants'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md h-80 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No restaurants found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutlets.map((outlet) => (
              <OutletCard
                key={outlet.id}
                outlet={outlet}
                onClick={() => onSelectOutlet(outlet)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
