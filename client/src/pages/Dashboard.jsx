import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaEye, FaPlus, FaEdit, FaStore, FaChartLine,
  FaBoxOpen, FaMoneyBillWave, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaGlobe, FaArrowRight, FaBox
} from 'react-icons/fa';

import OverviewTab from '../components/dashboard/OverviewTab';
import ProductsTab from '../components/dashboard/ProductsTab';
import OrdersTab from '../components/dashboard/OrdersTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import EditWebsiteTab from '../components/dashboard/EditWebsiteTab';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token, businessId }) {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({ views: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard Tabs: 'overview', 'products', 'orders', 'settings', 'edit-website'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {
      const [businessRes, websitesRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/business/${businessId}`),
        axios.get(`${API_URL}/website/business/${businessId}/all`),
        axios.get(`${API_URL}/business/${businessId}/orders`)
      ]);
      setBusiness(businessRes.data);
      setWebsites(websitesRes.data);
      setStats({
        views: websitesRes.data.reduce((sum, w) => sum + (w.views || 0), 0),
        orders: ordersRes.data.length,
        revenue: ordersRes.data.reduce((sum, o) => sum + o.totalAmount, 0)
      });
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    navigate('/');
  };

  const handleDeleteWebsite = async (websiteId) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/website/${websiteId}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete website:', error);
        alert('Failed to delete store');
      }
    }
  };

  if (!business) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} recentOrders={recentOrders} websites={websites} navigate={setActiveTab} routerNavigate={navigate} setSelectedWebsite={setSelectedWebsite} onDeleteWebsite={handleDeleteWebsite} />;
      case 'products':
        return <ProductsTab businessId={businessId} websites={websites} />;
      case 'orders':
        return <OrdersTab businessId={businessId} websites={websites} />;
      case 'settings':
        return <SettingsTab businessId={businessId} businessData={business} onUpdate={setBusiness} />;
      case 'edit-website':
        return <EditWebsiteTab businessId={businessId} businessData={business} selectedWebsite={selectedWebsite} />;
      default:
        return <OverviewTab stats={stats} recentOrders={recentOrders} websites={websites} navigate={setActiveTab} setSelectedWebsite={setSelectedWebsite} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === id
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon className={activeTab === id ? 'text-blue-600' : 'text-gray-400'} />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-gray-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-md font-bold">
            {business.businessName?.charAt(0).toUpperCase() || 'B'}
          </div>
          <span className="font-bold text-lg text-gray-900 truncate">
            {business.businessName || 'My Workspace'}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Overview</div>
          <nav className="space-y-1">
            <NavItem id="overview" icon={FaChartLine} label="Dashboard" />
            <NavItem id="edit-website" icon={FaEdit} label="Design & Theme" />
            <NavItem id="products" icon={FaBox} label="Products" />
            <NavItem id="orders" icon={FaBoxOpen} label="Orders" />
          </nav>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</div>
          <nav className="space-y-1">
            <NavItem id="settings" icon={FaCog} label="Store Settings" />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors"
          >
            <FaSignOutAlt className="text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {/* Top Navbar Mobile */}
        <div className="md:hidden flex items-center justify-between bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-md font-bold">
              {business.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <span className="font-bold text-lg text-gray-900 truncate max-w-[150px]">{business.businessName}</span>
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-600 p-2">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isSidebarOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 absolute w-full z-10 shadow-lg">
            <nav className="flex flex-col space-y-1">
              <NavItem id="overview" icon={FaChartLine} label="Dashboard" />
              <NavItem id="edit-website" icon={FaEdit} label="Design & Theme" />
              <NavItem id="products" icon={FaBox} label="Products" />
              <NavItem id="orders" icon={FaBoxOpen} label="Orders" />
              <NavItem id="settings" icon={FaCog} label="Store Settings" />
              <div className="h-px bg-gray-200 my-2"></div>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                <FaSignOutAlt /> Sign Out
              </button>
            </nav>
          </div>
        )}

        <div className="p-4 md:p-8 lg:p-10">
          {/* Header Section for non-overview tabs */}
          {activeTab === 'overview' && (
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Overview</h1>
                <p className="text-gray-500 text-sm">Welcome back! Here is what's happening with your store today.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/templates')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                  <FaPlus />
                  Create New Store
                </button>
              </div>
            </div>
          )}

          {/* Render Active Tab Content */}
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;