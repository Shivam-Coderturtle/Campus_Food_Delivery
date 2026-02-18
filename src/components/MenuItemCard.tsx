import { Plus, Leaf } from 'lucide-react';
import { MenuItem } from '../lib/supabase';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: () => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row">
      <div className="relative sm:w-40 h-40 flex-shrink-0">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.is_vegetarian && (
          <div className="absolute top-2 left-2 bg-green-500 p-1 rounded-full">
            <Leaf className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h4>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-800">₹{item.price}</span>
          <button
            onClick={onAddToCart}
            disabled={!item.is_available}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
