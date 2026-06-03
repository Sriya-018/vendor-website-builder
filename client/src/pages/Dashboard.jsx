import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaEye, FaPlus, FaEdit, FaStore, FaChartLine, 
  FaBoxOpen, FaMoneyBillWave, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaGlobe, FaArrowRight
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token, businessId }) {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({ views: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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

  if (!business) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const websiteUrl = `/website/${business.businessName?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-gray-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-md font-bold">
            {business.businessName?.charAt(0).toUpperCase() || 'B'}
          </div>
          <span className="font-bold text-lg text-gray-900 truncate">
            {business.businessName || 'My Workspace'}
          </span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Overview</div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors">
              <FaChartLine className="text-blue-600" />
              Dashboard
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/edit'); }} className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <FaEdit className="text-gray-400" />
              Edit Website
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/setup'); }} className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <FaPlus className="text-gray-400" />
              Add Products
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <FaBoxOpen className="text-gray-400" />
              Orders
            </a>
          </nav>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <FaCog className="text-gray-400" />
              Store Settings
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
            <FaSignOutAlt className="text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {/* Top Navbar Mobile */}
        <div className="md:hidden flex items-center justify-between bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-md font-bold">
              {business.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <span className="font-bold text-lg text-gray-900">{business.businessName}</span>
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-600 p-2">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isSidebarOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 absolute w-full z-10 shadow-lg">
            <nav className="flex flex-col space-y-2">
              <button className="text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-md font-medium">Dashboard</button>
              <button onClick={() => { setSidebarOpen(false); navigate('/edit'); }} className="text-left px-3 py-2 text-gray-600 font-medium">Edit Website</button>
              <button onClick={() => { setSidebarOpen(false); navigate('/setup'); }} className="text-left px-3 py-2 text-gray-600 font-medium">Add Products</button>
            </nav>
          </div>
        )}

        <div className="p-6 md:p-8 lg:p-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Overview</h1>
              <p className="text-gray-500 text-sm">Welcome back! Here is what's happening with your store today.</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={() => window.open(websiteUrl, '_blank')}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
              >
                <FaGlobe className="text-gray-400" />
                View Website
              </button>
              <button 
                onClick={() => navigate('/edit')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                <FaEdit />
                Edit Site
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FaEye className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.views}</div>
              <div className="text-sm text-gray-500 font-medium">Total Page Views</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FaBoxOpen className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.orders}</div>
              <div className="text-sm text-gray-500 font-medium">Total Orders</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FaMoneyBillWave className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Today</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">₹{stats.revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Orders - Takes up 2 columns on lg */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all <FaArrowRight className="text-xs" />
                </a>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-900">No orders yet</p>
                    <p className="text-sm mt-1">When customers place orders, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                          <th className="px-6 py-4 font-medium">Order ID</th>
                          <th className="px-6 py-4 font-medium">Customer</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {recentOrders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                            <td className="px-6 py-4 text-gray-600">
                              <div>{order.customerPhone}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                {order.items?.map(i => `${i.name}`).join(', ') || 'Order placed'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                              ₹{order.totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Setup / Help Section */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Setup</h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Add your first product</h3>
                      <p className="text-sm text-gray-500 mt-1">Start by adding items to your store.</p>
                      <button onClick={() => navigate('/setup')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                        Add product &rarr;
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gray-100"></div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Customize design</h3>
                      <p className="text-sm text-gray-500 mt-1">Change colors, fonts, and layout.</p>
                      <button onClick={() => navigate('/edit')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                        Edit website &rarr;
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gray-100"></div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Share your store</h3>
                      <p className="text-sm text-gray-500 mt-1">Get your first visitors by sharing.</p>
                      <button onClick={() => window.open(websiteUrl, '_blank')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                        View website &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;