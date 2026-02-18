import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, LogOut } from 'lucide-react';
import { supabase, RestaurantPartner } from '../lib/supabase';

interface RestaurantPartnerDashboardProps {
  onLogout: () => void;
}

export default function RestaurantPartnerDashboard({ onLogout }: RestaurantPartnerDashboardProps) {
  const [partner, setPartner] = useState<RestaurantPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: partnerData, error } = await supabase
        .from('restaurant_partners')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!partnerData) throw new Error('Restaurant partner profile not found');

      setPartner(partnerData);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
            <p className="text-gray-600">Owner: {partner?.owner_name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{partner?.total_orders || 0}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commission Rate</p>
                <p className="text-3xl font-bold text-yellow-600">{partner?.commission_rate}%</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className={`text-3xl font-bold ${partner?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {partner?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div>
              <p className="text-gray-600 text-sm">Mobile Verified</p>
              <p className={`text-3xl font-bold ${partner?.mobile_verified ? 'text-green-600' : 'text-red-600'}`}>
                {partner?.mobile_verified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl text-gray-600">Real-time order management coming soon</p>
          <p className="text-sm text-gray-500 mt-2">Your orders will appear here for real-time tracking</p>
        </div>
      </div>
    </div>
  );
}
