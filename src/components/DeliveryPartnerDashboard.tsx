import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, IndianRupee, Package, CheckCircle, LogOut } from 'lucide-react';
import { supabase, DeliveryPartner } from '../lib/supabase';

interface DeliveryPartnerDashboardProps {
  onLogout: () => void;
}

export default function DeliveryPartnerDashboard({ onLogout }: DeliveryPartnerDashboardProps) {
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: partnerData, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!partnerData) throw new Error('Delivery partner profile not found');

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
            <h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1>
            <p className="text-gray-600">Partner: {partner?.name}</p>
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
                <p className="text-gray-600 text-sm">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-800">{partner?.total_deliveries || 0}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="text-3xl font-bold text-gray-800">{partner?.rating?.toFixed(1)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
              <div className={`h-8 w-8 rounded-full ${partner?.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div>
              <p className="text-gray-600 text-sm">Vehicle</p>
              <p className="text-lg font-bold text-gray-800">{partner?.vehicle_type || 'N/A'}</p>
              <p className="text-sm text-gray-500">{partner?.vehicle_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl text-gray-600">Real-time order tracking coming soon</p>
          <p className="text-sm text-gray-500 mt-2">Your assigned orders will appear here</p>
        </div>
      </div>
    </div>
  );
}
