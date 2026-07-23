import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
 FaEye, FaPlus, FaEdit, FaStore, FaChartLine,
 FaBoxOpen, FaMoneyBillWave, FaCog, FaSignOutAlt,
 FaBars, FaTimes, FaGlobe, FaArrowRight, FaBox, FaEnvelope,
 FaPaintBrush, FaHome, FaUser
} from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

import OverviewTab from '../components/dashboard/OverviewTab';
import ProductsTab from '../components/dashboard/ProductsTab';
import OrdersTab from '../components/dashboard/OrdersTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import EditWebsiteTab from '../components/dashboard/EditWebsiteTab';
import InquiriesTab from '../components/dashboard/InquiriesTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import BrandAssetsTab from '../components/dashboard/BrandAssetsTab';
import AccountSettingsTab from '../components/dashboard/AccountSettingsTab';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token, businessId }) {
 const { theme } = useTheme();
 const navigate = useNavigate();
 const [business, setBusiness] = useState(null);
 const [stats, setStats] = useState({ views: 0, orders: 0, revenue: 0 });
 const [orders, setOrders] = useState([]);
 const [recentOrders, setRecentOrders] = useState([]);
 const [websites, setWebsites] = useState([]);
 const [selectedWebsite, setSelectedWebsite] = useState(null);
 const [isSidebarOpen, setSidebarOpen] = useState(false);

 // Dashboard Tabs: 'overview', 'products', 'orders', 'settings', 'edit-website'
 const [activeTab, setActiveTab] = useState('overview');

 // Import Modal States
 const [showImportModal, setShowImportModal] = useState(false);
 const [scrapeUrl, setScrapeUrl] = useState('');
 const [isImporting, setIsImporting] = useState(false);
 const [importError, setImportError] = useState(null);

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
 setOrders(ordersRes.data);
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

 const handleImportWebsite = async (e) => {
 e.preventDefault();
 if (!scrapeUrl.trim()) return;
 setIsImporting(true);
 setImportError(null);

 const categoryToTemplate = {
 restaurant: { id: 't4', name: 'Crave', category: 'Food & Beverage', colors: { primary: '#27272A', secondary: '#FFFBEB', accent: '#D97706' } },
 tailor: { id: 't1', name: 'Aurora', category: 'Fashion', colors: { primary: '#111827', secondary: '#F3F4F6', accent: '#3B82F6' } },
 grocery: { id: 't15', name: 'Flora', category: 'Florist', colors: { primary: '#0A3B2F', secondary: '#FAF7F2', accent: '#C86D51' } },
 salon: { id: 't3', name: 'Bloom', category: 'Beauty', colors: { primary: '#2D3748', secondary: '#FFF5F5', accent: '#E53E3E' } },
 mechanic: { id: 't33', name: 'Pulse', category: 'Services', colors: { primary: '#DC2626', secondary: '#111827', accent: '#EF4444' } },
 tea_shop: { id: 't10', name: 'Bistro', category: 'Food & Beverage', colors: { primary: '#3E2723', secondary: '#FDFBF7', accent: '#8D6E63' } }
 };

 try {
 const response = await axios.post(`${API_URL}/ai/scrape-and-recommend`, { url: scrapeUrl });
 const scrapedCategory = response.data.recommendedTemplate || 'grocery';
 const chosenTemplate = categoryToTemplate[scrapedCategory] || categoryToTemplate.grocery;

 const genRes = await axios.post(`${API_URL}/ai/generate-website`, {
 businessData: {
 businessName: response.data.business?.businessName || 'My Imported Store',
 description: response.data.business?.description || '',
 phone: response.data.business?.phone || '',
 email: response.data.business?.email || '',
 address: response.data.business?.address || '',
 socialMedia: { whatsapp: response.data.business?.phone || '', instagram: '', facebook: '', twitter: '' }
 },
 productImages: [],
 template: chosenTemplate.id,
 templateName: chosenTemplate.name,
 theme: {
 primaryColor: chosenTemplate.colors.primary,
 secondaryColor: chosenTemplate.colors.secondary,
 accentColor: chosenTemplate.colors.accent
 }
 });

 const saveRes = await axios.post(`${API_URL}/website/${businessId}/new`, {
 html: genRes.data.html,
 css: genRes.data.css,
 template: chosenTemplate.id,
 published: true,
 storeName: response.data.business?.businessName || `${chosenTemplate.name} Hub - ${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
 storeInfo: {
 description: response.data.business?.description || '',
 category: chosenTemplate.category,
 contact: {
 phone: response.data.business?.phone || '',
 email: response.data.business?.email || ''
 },
 location: {
 address: response.data.business?.address || ''
 },
 socialMedia: { whatsapp: response.data.business?.phone || '', instagram: '', facebook: '', twitter: '' }
 }
 });

 const newWebsiteId = saveRes.data._id;
 const extractedProducts = response.data.extractedProducts || [];
 for (const product of extractedProducts) {
 await axios.post(`${API_URL}/business/${businessId}/products`, {
 websiteId: newWebsiteId,
 name: product.name,
 price: Number(product.price) || 0,
 category: 'general',
 description: product.description || '',
 imageUrl: ''
 });
 }

 setShowImportModal(false);
 setScrapeUrl('');
 navigate(`/editor/${newWebsiteId}`);
 } catch (err) {
 console.error('Import error:', err);
 setImportError(err.response?.data?.error || err.message || 'Failed to import site. Please try again.');
 } finally {
 setIsImporting(false);
 }
 };

 if (!business) return (
 <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#09080E]">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
 <p className="text-slate-600 dark:text-slate-400 text-sm">Loading your workspace...</p>
 </div>
 </div>
 );

 const renderActiveTab = () => {
 switch (activeTab) {
 case 'overview':
 return <OverviewTab stats={stats} recentOrders={recentOrders} websites={websites} navigate={setActiveTab} routerNavigate={navigate} setSelectedWebsite={setSelectedWebsite} onDeleteWebsite={handleDeleteWebsite} />;
 case 'analytics':
 return <AnalyticsTab businessId={businessId} websites={websites} orders={orders} />;
 case 'brand-assets':
 return <BrandAssetsTab businessId={businessId} websites={websites} />;
 case 'products':
 return <ProductsTab businessId={businessId} websites={websites} />;
 case 'orders':
 return <OrdersTab businessId={businessId} websites={websites} />;
 case 'inquiries':
 return <InquiriesTab businessId={businessId} websites={websites} />;
 case 'settings':
 return <SettingsTab businessId={businessId} businessData={business} onUpdate={setBusiness} refreshData={fetchData} websites={websites} selectedWebsite={selectedWebsite} setSelectedWebsite={setSelectedWebsite} />;
 case 'account-settings':
 return <AccountSettingsTab business={business} onUpdate={setBusiness} />;
 case 'edit-website':
 return <EditWebsiteTab businessId={businessId} businessData={business} selectedWebsite={selectedWebsite} setSelectedWebsite={setSelectedWebsite} websites={websites} routerNavigate={navigate} />;
 default:
 return <OverviewTab stats={stats} recentOrders={recentOrders} websites={websites} navigate={setActiveTab} setSelectedWebsite={setSelectedWebsite} />;
 }
 };

 const NavItem = ({ id, icon: Icon, label }) => (
 <button
 onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === id
 ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 shadow-sm shadow-purple-500/10'
 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Icon className={`text-sm ${activeTab === id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-500'}`} />
 {label}
 </button>
 );

 return (
 <div className={`flex min-h-screen font-sans transition-colors duration-300 theme-${theme} ${theme === 'dark' ? 'bg-slate-50 dark:bg-[#09080E] text-slate-200' : 'bg-[#F8FAFC] text-slate-800'}`}>
 {/* Sidebar - Desktop */}
 <aside className={`hidden md:flex flex-col w-64 ${theme === 'dark' ? 'bg-white dark:bg-[#0D0C14] border-slate-200 dark:border-slate-800/60' : 'bg-white border-slate-200'} border-r h-screen sticky top-0`}>
 <div
 className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
 onClick={() => navigate('/')}
 >
 <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center rounded-xl font-extrabold shadow-lg shadow-indigo-500/20 text-sm">
 {business.businessName?.charAt(0).toUpperCase() || 'B'}
 </div>
 <div className="flex-1 min-w-0">
 <span className={`font-extrabold text-sm truncate block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
 {business.businessName || 'My Workspace'}
 </span>
 <span className="text-xs text-purple-700 dark:text-purple-400 font-medium">Vendor Dashboard</span>
 </div>
 <ThemeToggle />
 </div>

 <div className="p-4 flex-1 overflow-y-auto">
 <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 px-2">Main</div>
 <nav className="space-y-1">
 <NavItem id="overview" icon={FaHome} label="Dashboard" />
 <NavItem id="analytics" icon={FaChartLine} label="Live Analytics" />
 <NavItem id="brand-assets" icon={FaPaintBrush} label="AI Logo Maker" />
 <NavItem id="edit-website" icon={FaEdit} label="Design & Theme" />
 <NavItem id="products" icon={FaBox} label="Products" />
 <NavItem id="orders" icon={FaBoxOpen} label="Orders" />
 <NavItem id="inquiries" icon={FaEnvelope} label="Messages" />
 </nav>

 <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-8 mb-3 px-2">Account</div>
 <nav className="space-y-1">
 <NavItem id="settings" icon={FaStore} label="Business Settings" />
 <NavItem id="account-settings" icon={FaUser} label="Account Settings" />
 </nav>
 </div>

 <div className="p-4 border-t border-slate-200 dark:border-slate-800/60">
 <button
 onClick={handleSignOut}
 className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-600 dark:text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg font-medium transition-colors text-sm"
 >
 <FaSignOutAlt className="text-slate-600" />
 Sign Out
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 max-w-7xl mx-auto w-full">
 {/* Top Navbar Mobile */}
 <div className={`md:hidden flex items-center justify-between px-4 py-4 border-b sticky top-0 z-20 ${theme === 'dark' ? 'bg-white dark:bg-[#0D0C14] border-slate-200 dark:border-slate-800/60' : 'bg-white border-slate-200'}`}>
 <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
 <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center rounded-lg font-extrabold shadow-md shadow-indigo-500/10 text-xs">
 {business.businessName?.charAt(0).toUpperCase() || 'B'}
 </div>
 <span className={`font-extrabold text-base truncate max-w-[150px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{business.businessName}</span>
 </div>
 <div className="flex items-center gap-2">
 <ThemeToggle />
 <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
 {isSidebarOpen ? <FaTimes /> : <FaBars />}
 </button>
 </div>
 </div>

 {/* Mobile menu dropdown */}
 {isSidebarOpen && (
 <div className="md:hidden bg-white dark:bg-[#0D0C14] border-b border-slate-200 dark:border-slate-800/60 p-4 absolute w-full z-10 shadow-2xl shadow-black/50">
 <nav className="flex flex-col space-y-1">
 <NavItem id="overview" icon={FaHome} label="Dashboard" />
 <NavItem id="analytics" icon={FaChartLine} label="Live Analytics" />
 <NavItem id="brand-assets" icon={FaPaintBrush} label="AI Logo Maker" />
 <NavItem id="edit-website" icon={FaEdit} label="Design & Theme" />
 <NavItem id="products" icon={FaBox} label="Products" />
 <NavItem id="orders" icon={FaBoxOpen} label="Orders" />
 <NavItem id="inquiries" icon={FaEnvelope} label="Messages" />
 <NavItem id="settings" icon={FaStore} label="Business Settings" />
 <NavItem id="account-settings" icon={FaUser} label="Account Settings" />
 <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
 <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg font-medium text-sm">
 <FaSignOutAlt /> Sign Out
 </button>
 </nav>
 </div>
 )}

 <div className="p-4 md:p-8 lg:p-10">
 {/* Header Section for overview tab */}
 {activeTab === 'overview' && (
 <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">Overview</h1>
 <p className="text-slate-600 dark:text-slate-500 text-sm">Welcome back! Here's what's happening with your store today.</p>
 </div>
 <div className="flex gap-3">
 <button
 onClick={() => setShowImportModal(true)}
 className="flex items-center gap-2 bg-white dark:bg-[#13121A] border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:border-slate-600 transition-colors shadow-sm text-sm"
 >
 <FaGlobe className="text-slate-600 dark:text-slate-500" />
 Import from Website
 </button>
 <button
 onClick={() => navigate('/templates')}
 className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.01] text-sm"
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

 {/* Import Modal */}
 {showImportModal && (
 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
 <div className="bg-white dark:bg-[#13121A] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800/60 relative">
 <button
 onClick={() => { setShowImportModal(false); setImportError(null); setScrapeUrl(''); }}
 className="absolute top-4 right-4 text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800"
 >
 <FaTimes className="text-lg" />
 </button>

 <div className="text-center">
 <div className="w-12 h-12 bg-purple-600/20 text-purple-700 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
 <FaGlobe className="text-xl" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Import Site from Website</h3>
 <p className="text-slate-600 dark:text-slate-500 text-xs mt-1">Paste any URL to crawl, analyze, detect the best template layout, and build your store instantly.</p>
 </div>

 <form onSubmit={handleImportWebsite} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Website URL</label>
 <input
 type="url"
 placeholder="e.g. https://floral-boutique.com"
 value={scrapeUrl}
 onChange={(e) => setScrapeUrl(e.target.value)}
 disabled={isImporting}
 required
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#09080E] placeholder-slate-600 transition-all"
 />
 </div>

 {importError && (
 <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
 ⚠️ {importError}
 </div>
 )}

 <button
 type="submit"
 disabled={isImporting || !scrapeUrl.trim()}
 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-3.5 font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isImporting ? (
 <>
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 Importing & Building...
 </>
 ) : (
 <>Start Import <FaArrowRight className="text-xs" /></>
 )}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

export default Dashboard;