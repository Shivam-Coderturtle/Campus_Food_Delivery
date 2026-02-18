import { ShoppingCart, UtensilsCrossed, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Refresh the page to reset state
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- LEFT SIDE: LOGO --- */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                CampusEats
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Quick campus delivery</p>
            </div>
          </div>

          {/* --- RIGHT SIDE: CART & LOGOUT --- */}
          <div className="flex items-center gap-4">
            
            {/* Cart Button (Original Design) */}
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Logout Button (Added) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-gray-50"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}