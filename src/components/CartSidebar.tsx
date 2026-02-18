import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <ShoppingBag className="h-24 w-24 mb-4 opacity-50" />
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm mt-2 text-center">Add items from the menu to get started!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                  <div className="flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.outlet_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-600">₹{item.price}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm mt-2 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-orange-600">₹{getTotalPrice()}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
