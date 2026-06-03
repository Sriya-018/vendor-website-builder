import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
import { 
  FaStore, FaArrowRight, FaTimes, FaSearch, 
  FaChevronRight, FaPlus, FaCheck, FaTrash, 
  FaStar, FaMobileAlt, FaDesktop, FaShoppingCart
} from 'react-icons/fa';

// --- MOCK DATA ---
const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Food & Beverage', 'Beauty', 'Home Decor', 'Services'];

const MOCK_TEMPLATES = [
  {
    id: 't1',
    name: 'Aurora',
    category: 'Fashion',
    description: 'A clean, minimalist design perfect for modern apparel.',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#111827', secondary: '#F3F4F6', accent: '#3B82F6' },
    isNew: true
  },
  {
    id: 't2',
    name: 'Slate',
    category: 'Electronics',
    description: 'Dark, sleek, and high-tech. Great for gadgets and electronics.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#0F172A', secondary: '#1E293B', accent: '#38BDF8' },
    isPopular: true
  },
  {
    id: 't3',
    name: 'Bloom',
    category: 'Beauty',
    description: 'Soft pastels and elegant typography for cosmetics and skincare.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bf84033005?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#831843', secondary: '#FCE7F3', accent: '#EC4899' }
  },
  {
    id: 't4',
    name: 'Crave',
    category: 'Food & Beverage',
    description: 'Vibrant and appetizing layout designed for restaurants and cafes.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#7C2D12', secondary: '#FFEDD5', accent: '#F97316' },
    isPopular: true
  },
  {
    id: 't5',
    name: 'Haven',
    category: 'Home Decor',
    description: 'Warm, inviting, and spacious. Showcase furniture beautifully.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#451A03', secondary: '#FEF3C7', accent: '#D97706' }
  },
  {
    id: 't6',
    name: 'Nexus',
    category: 'Services',
    description: 'Professional and trustworthy corporate styling for service providers.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#1E3A8A', secondary: '#EFF6FF', accent: '#2563EB' }
  },
  {
    id: 't7',
    name: 'Vogue',
    category: 'Fashion',
    description: 'Editorial-style layout with large image areas for lookbooks.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#000000', secondary: '#FFFFFF', accent: '#6B7280' },
    isNew: true
  },
  {
    id: 't8',
    name: 'Pixel',
    category: 'Electronics',
    description: 'Grid-heavy, spec-focused design for computer parts and accessories.',
    image: 'https://images.unsplash.com/photo-1550009158-9ffff6ab31c1?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#020617', secondary: '#F8FAFC', accent: '#10B981' }
  },
  {
    id: 't9',
    name: 'Glow',
    category: 'Beauty',
    description: 'Radiant and airy design perfect for organic and natural products.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    colors: { primary: '#064E3B', secondary: '#ECFDF5', accent: '#10B981' }
  }
];

function Templates({ token, businessId }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Flow State
  const [storeDetails, setStoreDetails] = useState({ name: '', tagline: '' });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' });

  const filteredTemplates = activeCategory === 'All' 
    ? MOCK_TEMPLATES 
    : MOCK_TEMPLATES.filter(t => t.category === activeCategory);

  const openDrawer = (template) => {
    setPreviewTemplate(template);
    setIsDrawerOpen(true);
    setDrawerStep(1);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Optional: reset state here if desired
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    if (products.length >= 10) {
      alert("You can only add up to 10 products in this demo.");
      return;
    }
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name: '', price: '', category: '' });
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleLaunch = async () => {
    setIsPublishing(true);
    
    if (token && businessId) {
      try {
        const businessData = {
          businessName: storeDetails.name || 'My Awesome Store',
          description: storeDetails.tagline || '',
          category: previewTemplate?.category || 'General',
          services: products.map(p => ({ name: p.name, price: p.price, category: p.category }))
        };

        // Update business info
        await axios.put(`${API_URL}/business/${businessId}`, businessData);
        
        // Generate AI website
        const response = await axios.post(`${API_URL}/ai/generate-website`, {
          businessData,
          photos: [], // no photos in this flow
          template: previewTemplate?.category || 'General',
          theme: { 
            primaryColor: previewTemplate?.colors?.primary || '#2563eb', 
            secondaryColor: previewTemplate?.colors?.secondary || '#4f46e5' 
          }
        });
        
        // Save the generated website
        await axios.post(`${API_URL}/website/${businessId}`, {
          html: response.data.html,
          css: response.data.css,
          template: previewTemplate?.category || 'General',
          published: true
        });
        
        setIsPublishing(false);
        setShowSuccessToast(true);
        closeDrawer();
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (error) {
        console.error('Failed to launch website', error);
        alert('Failed to launch website. Please try again.');
        setIsPublishing(false);
      }
    } else {
      // For non-logged-in users, simulate success but alert them to log in
      setTimeout(() => {
        setIsPublishing(false);
        alert('Website generated! Please log in to save and manage your new store.');
        closeDrawer();
        navigate('/'); // redirect to landing for login
      }, 2000);
    }
  };

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hi! I can help you design your store. Say "change theme to blue" or "add a T-shirt for $20".' }]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChat = async () => {
    if(!chatMsg.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMsg }];
    setChatHistory(newHistory);
    setChatMsg('');
    setIsChatLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/ai/assistant`, { message: chatMsg });
      const action = res.data.action;
      let reply = "I'm not sure how to do that yet.";
      
      if(action.type === 'CHANGE_THEME') {
        reply = `I will change the theme color to ${action.color} when you launch your store!`;
        // In a full implementation, we'd update previewTemplate.colors here
      } else if(action.type === 'ADD_PRODUCT') {
        reply = `I've added ${action.productName} for $${action.price} to your catalog.`;
        setProducts(prev => [...prev, { id: Date.now(), name: action.productName, price: action.price, category: 'AI Added' }]);
      }
      
      setChatHistory([...newHistory, { role: 'ai', text: reply }]);
    } catch(e) {
      setChatHistory([...newHistory, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 relative">
      {/* FULL SCREEN PUBLISHING LOADER */}
      {isPublishing && (
        <div className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-bold font-jakarta mb-4 animate-pulse">Generating your store...</h2>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[progress_1.5s_ease-in-out_infinite]"></div>
          </div>
          <style>{`@keyframes progress { 0% { width: 0%; margin-left: 0%; } 50% { width: 100%; margin-left: 0%; } 100% { width: 0%; margin-left: 100%; } }`}</style>
        </div>
      )}
      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <FaCheck className="text-xl" />
          <span className="font-semibold">Store launched successfully! Redirecting...</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <FaStore className="text-xl" />
            </div>
            <span className="font-bold font-jakarta text-2xl tracking-tight text-gray-900">VendorBuild</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Home</button>
            {token && <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Dashboard</button>}
          </div>
        </div>
      </nav>

      {/* HERO & FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-jakarta text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Choose Your Store Template
          </h1>
          <p className="text-lg md:text-xl text-gray-500">
            Pick a design, add your products, and go live in minutes. No coding required.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* TEMPLATE GALLERY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col transform hover:-translate-y-1"
            >
              {/* Image Preview Area */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img 
                  src={template.image} 
                  alt={template.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={() => setPreviewTemplate(template)}
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaDesktop /> Live Preview
                  </button>
                </div>
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {template.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {template.isNew && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"><FaStar className="text-[10px]" /> New</span>}
                  {template.isPopular && <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Popular</span>}
                </div>
              </div>
              
              {/* Details Area */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-jakarta text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-500 text-sm flex-1 mb-6 leading-relaxed">{template.description}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => openDrawer(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No templates found for this category.</p>
          </div>
        )}
      </div>

      {/* FOOTER CTA STRIP */}
      <div className="bg-white border-t border-gray-200 mt-12 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaStar className="text-2xl" />
          </div>
          <h2 className="font-jakarta text-3xl font-bold text-gray-900 mb-4">Not sure which template to pick?</h2>
          <p className="text-gray-500 text-lg mb-8">Let our AI analyze your business and automatically generate the perfect storefront for you.</p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
            Ask AI for a Recommendation
          </button>
        </div>
      </div>

      {/* FULL-SCREEN PREVIEW MODAL */}
      {previewTemplate && !isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 md:p-8 animate-fade-in">
          <div className="bg-white w-full h-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
            {/* Modal Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 relative z-20">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">{previewTemplate.name} Preview</span>
                <div className="hidden md:flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button className="p-1.5 bg-white shadow-sm rounded-md text-gray-700"><FaDesktop /></button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700"><FaMobileAlt /></button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => openDrawer(previewTemplate)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-colors"
                >
                  Use This Template
                </button>
                <button 
                  onClick={() => setPreviewTemplate(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* MOCK STOREFRONT CONTENT */}
            <div className="flex-1 overflow-y-auto bg-gray-50 pb-20">
              {/* Mock Navbar */}
              <div className="h-20 flex items-center justify-between px-10 border-b border-gray-200" style={{ backgroundColor: previewTemplate.colors.secondary }}>
                <div className="font-bold text-2xl tracking-tighter" style={{ color: previewTemplate.colors.primary }}>MockStore.</div>
                <div className="hidden md:flex gap-8 font-medium text-gray-600">
                  <span>Home</span>
                  <span>Shop</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
                <div><FaShoppingCart className="text-xl" style={{ color: previewTemplate.colors.primary }} /></div>
              </div>

              {/* Mock Hero */}
              <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
                <img src={previewTemplate.image} className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
                <div className="absolute inset-0 bg-gray-900/50"></div>
                <div className="relative z-10 text-center px-4 max-w-3xl">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">Elevate Your Lifestyle</h1>
                  <p className="text-xl text-gray-200 mb-8">Discover our latest collection curated just for you.</p>
                  <button className="px-8 py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: previewTemplate.colors.accent }}>
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Mock Products */}
              <div className="max-w-6xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: previewTemplate.colors.primary }}>Featured Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {(products.length > 0 ? products : [
                    { id: 1, name: 'Sample Product 1', price: '49.99' },
                    { id: 2, name: 'Sample Product 2', price: '89.99' },
                    { id: 3, name: 'Sample Product 3', price: '129.99' }
                  ]).map((item, idx) => (
                    <div key={item.id || idx} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
                      <div className="h-64 bg-gray-200">
                        <img src={`https://picsum.photos/seed/${item.name}/600/600`} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="p-6 text-center">
                        <h4 className="font-bold text-lg mb-2 text-gray-800 truncate">{item.name}</h4>
                        <p className="text-gray-500 mb-4">${item.price}</p>
                        <button className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: previewTemplate.colors.primary }}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mock Footer */}
              <div className="py-12 text-center" style={{ backgroundColor: previewTemplate.colors.primary, color: 'white' }}>
                <p className="opacity-70">© 2026 MockStore. Powered by VendorBuild.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER: PRODUCT ADDITION FLOW */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 animate-fade-in" onClick={closeDrawer}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            
            {/* Drawer Header */}
            <div className="h-20 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
              <h2 className="font-jakarta text-xl font-bold text-gray-900">Setup Your Store</h2>
              <button onClick={closeDrawer} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* Progress Stepper */}
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-300`} style={{ width: drawerStep === 1 ? '0%' : drawerStep === 2 ? '50%' : '100%' }}></div>
                
                {[1, 2, 3].map(step => (
                  <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                    drawerStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {drawerStep > step ? <FaCheck className="text-xs" /> : step}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
                <span className={drawerStep >= 1 ? 'text-blue-600' : ''}>Details</span>
                <span className={drawerStep >= 2 ? 'text-blue-600' : ''}>Products</span>
                <span className={drawerStep >= 3 ? 'text-blue-600' : ''}>Publish</span>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* STEP 1: Details */}
              {drawerStep === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaStore className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="font-jakarta text-2xl font-bold text-gray-900">Store Details</h3>
                    <p className="text-gray-500 mt-2">Let's give your new store an identity.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                    <input 
                      type="text" 
                      value={storeDetails.name}
                      onChange={(e) => setStoreDetails({...storeDetails, name: e.target.value})}
                      placeholder="e.g. Acme SuperMart"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline (Optional)</label>
                    <input 
                      type="text" 
                      value={storeDetails.tagline}
                      onChange={(e) => setStoreDetails({...storeDetails, tagline: e.target.value})}
                      placeholder="e.g. Best quality goods for you"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-blue-600 font-medium text-sm">Click to upload logo</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Products */}
              {drawerStep === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="mb-6">
                    <h3 className="font-jakarta text-2xl font-bold text-gray-900">Add Products</h3>
                    <p className="text-gray-500 mt-1 text-sm">Add a few items to get your catalog started.</p>
                  </div>

                  {/* Add Product Form */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <input 
                          type="text" 
                          placeholder="Product Name (e.g. T-Shirt)"
                          value={newProduct.name}
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1/2 relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input 
                            type="number" 
                            placeholder="Price"
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Category"
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-1/2 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        />
                      </div>
                      <button 
                        onClick={addProduct}
                        disabled={!newProduct.name || !newProduct.price}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        <FaPlus className="text-xs" /> Add Product
                      </button>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex justify-between">
                      Added Products <span>{products.length}/10</span>
                    </h4>
                    {products.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                        No products added yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {products.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">IMG</div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                                <p className="text-xs text-gray-500">${p.price} {p.category && `• ${p.category}`}</p>
                              </div>
                            </div>
                            <button onClick={() => removeProduct(p.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Publish */}
              {drawerStep === 3 && (
                <div className="space-y-6 animate-fade-in-up text-center pt-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <FaCheck className="text-green-600 text-4xl relative z-10" />
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  
                  <h3 className="font-jakarta text-3xl font-bold text-gray-900">Ready to Launch!</h3>
                  <p className="text-gray-500 mt-2 text-lg">Your store is fully configured and ready to accept customers.</p>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left mt-8">
                    <h4 className="font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Store Name:</span>
                        <span className="font-semibold text-gray-900">{storeDetails.name || 'My Awesome Store'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Template:</span>
                        <span className="font-semibold text-gray-900">{previewTemplate?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Products Added:</span>
                        <span className="font-semibold text-gray-900">{products.length} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer / Navigation */}
            <div className="p-6 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-4">
                {drawerStep > 1 && (
                  <button 
                    onClick={() => setDrawerStep(drawerStep - 1)}
                    disabled={isPublishing}
                    className="flex-1 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {drawerStep < 3 ? (
                  <button 
                    onClick={() => setDrawerStep(drawerStep + 1)}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <FaChevronRight className="text-sm" />
                  </button>
                ) : (
                  <button 
                    onClick={handleLaunch}
                    disabled={isPublishing}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>Launch My Store 🚀</>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* AI Assistant Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl mb-4 border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
              <span>Vendor AI Assistant ✨</span>
              <button onClick={() => setChatOpen(false)} className="hover:text-gray-200"><FaTimes /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex gap-1 rounded-bl-none">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input 
                type="text" 
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask me anything..." 
                className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button 
                onClick={handleSendChat}
                disabled={!chatMsg.trim() || isChatLoading}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform group relative"
          >
            <FaStar className="text-2xl group-hover:animate-spin" />
            <span className="absolute -top-10 bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded shadow-lg whitespace-nowrap">Need Help?</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Templates;
