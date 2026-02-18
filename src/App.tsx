import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Outlet, supabase } from './lib/supabase';
import Header from './components/Header';
import Home from './components/Home';
import OutletDetail from './components/OutletDetail';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import CustomerAuth from './components/CustomerAuth';
import DeliveryPartnerDashboard from './components/DeliveryPartnerDashboard';
import RestaurantPartnerDashboard from './components/RestaurantPartnerDashboard';
import AdminPanel from './components/AdminPanel';

type UserRole = 'customer' | 'delivery_partner' | 'restaurant_partner' | 'admin' | null;

function App() {
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        checkUserRole();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserRole(null);
        setAuthLoading(false);
        return;
      }

      // --- HARDCODED BYPASS START ---
      // This matches the ID from your console logs
      if (user.id === '19fbc19c-9b66-4854-8ace-b5fbf1466043' || user.email === 'shivamgupta41206@gmail.com') {
        console.log("Admin Bypass Activated for Shivam");
        setUserRole('admin');
        setAuthLoading(false);
        return;
      }
      
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (admin) {
        setUserRole('admin');
        setAuthLoading(false);
        return;
      }
      
      // ... rest of your code ...
      const { data: delivery } = await supabase
        .from('delivery_partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (delivery) {
        setUserRole('delivery_partner');
        setAuthLoading(false);
        return;
      }

      const { data: restaurant, error: rError } = await supabase // <--- NEW: Added ", error: rError"
        .from('restaurant_partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      console.log("Restaurant Check:", restaurant, rError);
      if (restaurant) {
        setUserRole('restaurant_partner');
        setAuthLoading(false);
        return;
      }

      const { data: customer } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customer) {
        setUserRole('customer');
      } else {
        setUserRole(null);
      }

      setAuthLoading(false);
    } catch (error) {
      console.error('Error checking user role:', error);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
      setSelectedOutlet(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <CustomerAuth onAuthSuccess={checkUserRole} />;
  }

  if (userRole === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (userRole === 'delivery_partner') {
    return <DeliveryPartnerDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'restaurant_partner') {
    return <RestaurantPartnerDashboard onLogout={handleLogout} />;
  }

  const handleSelectOutlet = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedOutlet(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartOpen(true)} />

        {selectedOutlet ? (
          <OutletDetail outlet={selectedOutlet} onBack={handleBackToHome} />
        ) : (
          <Home onSelectOutlet={handleSelectOutlet} />
        )}

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </div>
    </CartProvider>
  );
}

export default App;
