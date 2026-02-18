import { Star, Clock } from 'lucide-react';
import { Outlet } from '../lib/supabase';

interface OutletCardProps {
  outlet: Outlet;
  onClick: () => void;
}

export default function OutletCard({ outlet, onClick }: OutletCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={outlet.image_url}
          alt={outlet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {!outlet.is_open && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Currently Closed</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-sm">{outlet.rating}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{outlet.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{outlet.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
            {outlet.cuisine_type}
          </span>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{outlet.delivery_time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
