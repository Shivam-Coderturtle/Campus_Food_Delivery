import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LogOut, Store, TrendingUp } from 'lucide-react';
import { supabase, Outlet, MenuItem } from '../lib/supabase';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'outlets' | 'menu'>('outlets');
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    cuisine_type: '',
    delivery_time: '',
  });

  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_vegetarian: true,
  });

  useEffect(() => {
    if (activeTab === 'outlets') fetchOutlets();
    else if (activeTab === 'menu') fetchMenuItems();
  }, [activeTab]);

  const fetchOutlets = async () => {
    try {
      const { data, error } = await supabase.from('outlets').select('*');
      if (error) throw error;
      setOutlets(data || []);
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*');
      if (error) throw error;
      setMenuItems(data || []);
      if (data && data.length > 0 && !selectedOutlet) {
        setSelectedOutlet(data[0].outlet_id);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Add a local loading state if you have one
    try {
      if (editingId) {
        const { error } = await supabase
          .from('outlets')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            cuisine_type: formData.cuisine_type,
            delivery_time: formData.delivery_time,
          })
          .eq('id', editingId);
        
        if (error) throw error;
        alert('Outlet updated successfully!');
      } else {
        const { error } = await supabase.from('outlets').insert([formData]);
        if (error) throw error;
        alert('New outlet added!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', image_url: '', cuisine_type: '', delivery_time: '' });
      
      // Refresh the list immediately
      await fetchOutlets(); 
    } catch (error) {
      console.error('Error saving outlet:', error);
      alert('Error saving outlet: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet) {
      alert('Please select an outlet');
      return;
    }

    try {
      const data = {
        ...menuFormData,
        outlet_id: selectedOutlet,
        price: parseFloat(menuFormData.price),
      };

      if (editingId) {
        const { error } = await supabase
          .from('menu_items')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu_items').insert([data]);
        if (error) throw error;
      }

      setShowForm(false);
      setMenuFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        is_vegetarian: true,
      });
      setEditingId(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item');
    }
  };

  const handleDeleteOutlet = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        const { error } = await supabase.from('outlets').delete().eq('id', id);
        if (error) throw error;
        fetchOutlets();
      } catch (error) {
        console.error('Error deleting outlet:', error);
      }
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) throw error;
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const handleEditOutlet = (outlet: Outlet) => {
    setFormData({
      name: outlet.name,
      description: outlet.description,
      image_url: outlet.image_url,
      cuisine_type: outlet.cuisine_type,
      delivery_time: outlet.delivery_time,
    });
    setEditingId(outlet.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Helpful to see the form
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image_url: item.image_url,
      category: item.category,
      is_vegetarian: item.is_vegetarian,
    });
    setSelectedOutlet(item.outlet_id);
    setEditingId(item.id);
    setShowForm(true);
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
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
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
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('outlets')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'outlets'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Store className="h-5 w-5" />
            Outlets
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Menu Items
          </button>
        </div>

        {activeTab === 'outlets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Outlets</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    description: '',
                    image_url: '',
                    cuisine_type: '',
                    delivery_time: '',
                  });
                }}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add Outlet
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Outlet' : 'New Outlet'}</h3>
                <form onSubmit={handleOutletSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Outlet Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Cuisine Type"
                    value={formData.cuisine_type}
                    onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Delivery Time"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outlets.map((outlet) => (
                <div key={outlet.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={outlet.image_url} alt={outlet.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{outlet.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{outlet.description}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      <p>{outlet.cuisine_type} • {outlet.delivery_time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditOutlet(outlet)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOutlet(outlet.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage Menu Items</h2>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Outlet</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setMenuFormData({
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    category: '',
                    is_vegetarian: true,
                  });
                }}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Menu Item' : 'New Menu Item'}</h3>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    required
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={menuFormData.description}
                    onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    required
                    step="0.01"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={menuFormData.image_url}
                    onChange={(e) => setMenuFormData({ ...menuFormData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={menuFormData.is_vegetarian}
                      onChange={(e) => setMenuFormData({ ...menuFormData, is_vegetarian: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Item Name</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menuItems
                    .filter((item) => !selectedOutlet || item.outlet_id === selectedOutlet)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">₹{item.price}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.is_vegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.is_vegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
