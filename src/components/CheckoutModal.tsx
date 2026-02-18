import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
          total_amount: getTotalPrice(),
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        outlet_id: item.outlet_id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setAddress('');
    setOrderPlaced(false);
    setOrderId('');
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold">
              {orderPlaced ? 'Order Confirmed!' : 'Checkout'}
            </h2>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {orderPlaced ? (
              <div className="text-center py-8">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h3>
                <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-bold text-orange-600 text-sm">{orderId.slice(0, 8)}</p>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  You'll receive your order at your delivery address shortly!
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Continue Ordering
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">₹{getTotalPrice()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
