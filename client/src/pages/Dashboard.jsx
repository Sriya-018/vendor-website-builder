import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaPlus, FaEdit, FaWhatsapp, FaStore, FaStar, FaBox, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token, businessId }) {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({ views: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [businessRes, statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/business/${businessId}`),
        axios.get(`${API_URL}/website/${businessId}/stats`),
        axios.get(`${API_URL}/business/${businessId}/orders`)
      ]);
      setBusiness(businessRes.data);
      setStats({
        views: statsRes.data.views,
        orders: ordersRes.data.length,
        revenue: ordersRes.data.reduce((sum, o) => sum + o.totalAmount, 0)
      });
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  if (!business) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-green-500 text-white px-4 py-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaStore className="text-2xl" />
              <h1 className="text-xl font-bold">{business.businessName || 'My Business'}</h1>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm opacity-90">
              <FaStar className="text-yellow-400" />
              <span>4.8</span>
              <span className="mx-1">•</span>
              <span>{business.location?.address || 'Add location'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 -mt-6">
        <button
          onClick={() => window.open(`/website/${business.businessName?.toLowerCase().replace(/\s/g, '-')}`, '_blank')}
          className="bg-white rounded-xl p-4 shadow-md text-center transition-transform active:scale-95"
        >
          <FaEye className="text-green-500 text-2xl mx-auto mb-1" />
          <div className="text-sm font-medium">View</div>
        </button>
        <button
          onClick={() => navigate('/edit')}
          className="bg-white rounded-xl p-4 shadow-md text-center transition-transform active:scale-95"
        >
          <FaEdit className="text-blue-500 text-2xl mx-auto mb-1" />
          <div className="text-sm font-medium">Edit</div>
        </button>
        <button
          onClick={() => navigate('/setup')}
          className="bg-white rounded-xl p-4 shadow-md text-center transition-transform active:scale-95"
        >
          <FaPlus className="text-orange-500 text-2xl mx-auto mb-1" />
          <div className="text-sm font-medium">Add</div>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mt-6">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <FaEye className="text-gray-400 text-xl mx-auto mb-1" />
          <div className="text-2xl font-bold">{stats.views}</div>
          <div className="text-xs text-gray-500">Views</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <FaBox className="text-gray-400 text-xl mx-auto mb-1" />
          <div className="text-2xl font-bold">{stats.orders}</div>
          <div className="text-xs text-gray-500">Orders</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <FaMoneyBillWave className="text-gray-400 text-xl mx-auto mb-1" />
          <div className="text-2xl font-bold">₹{stats.revenue}</div>
          <div className="text-xs text-gray-500">Revenue</div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-bold text-lg mb-3">📦 Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            No orders yet. Share your website!
          </div>
        ) : (
          recentOrders.map(order => (
            <div key={order._id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{order.customerPhone}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Order placed'}
                  </div>
                  <div className="font-bold mt-2">₹{order.totalAmount}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center text-green-500">
            <FaStore className="text-xl" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <FaBox className="text-xl" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <FaWhatsapp className="text-xl" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <button onClick={() => navigate('/edit')} className="flex flex-col items-center text-gray-400">
            <FaEdit className="text-xl" />
            <span className="text-xs mt-1">Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;