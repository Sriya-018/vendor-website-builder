import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaDesktop, FaTabletAlt, FaMobileAlt, FaExternalLinkAlt, FaSave } from 'react-icons/fa';
import EditorControls from '../components/editor/EditorControls';
import LivePreview from '../components/editor/LivePreview';

const API_URL = 'http://localhost:5000/api';

const DEFAULT_CONFIG = {
  template: 't1',
  themeColor: '#2563eb', // Blue
  typography: {
    headingFont: 'sans',
    bodyFont: 'sans',
    baseSize: 16,
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  navbar: {
    position: 'top',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    logoText: 'My Store',
    showSearch: true,
    searchPosition: 'right',
    links: [{ id: '1', label: 'Home', url: '/' }, { id: '2', label: 'Products', url: '/products' }],
  },
  header: {
    announcement: { show: false, text: 'Free shipping on orders over $50!', color: '#2563eb', dismissible: true },
    heroImage: '',
    heroAlign: 'center',
    heroHeading: 'Welcome to our store',
    heroSubheading: 'Discover our amazing products',
    ctaLabel: 'Shop Now',
    bgColor: '#f3f4f6',
    parallax: false,
    slider: false,
  },
  spacing: {
    borderRadius: 'rounded',
    maxWidth: 'normal',
    padding: 'comfortable',
  },
  products: {
    sectionTitle: 'Featured Products',
    columnsDesktop: 4,
    columnsMobile: 2,
    showPrices: true,
    showAddToCart: true,
    showStars: true,
    starColor: '#fbbf24',
    showWishlist: false,
    wishlistPosition: 'top-right',
    badgeStyle: 'sale', // sale, new, none
    hoverEffect: 'zoom', // none, zoom, second-image
  },
  buttons: {
    primaryStyle: 'filled',
    secondaryStyle: 'outlined',
    size: 'medium',
    fullWidthMobile: false,
    addToCartLabel: 'Add to Cart',
  },
  media: {
    aspectRatio: 'square', // square, portrait, landscape
    fitMode: 'cover',
  },
  mobile: {
    navStyle: 'hamburger', // hamburger, bottom-tab
  },
  footer: {
    tagline: 'Your one-stop shop for everything.',
    bgColor: '#1f2937',
    textColor: '#f9fafb',
    social: { instagram: true, facebook: true, twitter: false, tiktok: false },
    showSocialFeed: false,
  },
  trust: {
    badges: { secure: true, returns: true, support: false },
    testimonials: { show: false, layout: 'grid', showStars: true },
    liveCounter: false,
  },
  popups: {
    emailCapture: { show: false, delaySeconds: 5, heading: 'Get 10% Off', ctaLabel: 'Subscribe', bgColor: '#ffffff' },
    countdown: { show: false, endDate: '', style: 'bar' },
    floatingChat: { show: false, position: 'bottom-right' },
  },
  seo: {
    title: '',
    description: '',
    ogImage: '',
    favicon: '',
  },
  accessibility: {
    darkMode: 'off', // off, auto, always
    focusRingColor: '#3b82f6',
    focusRingThickness: 2,
  }
};

function WebsiteEditor() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  
  const [website, setWebsite] = useState(null);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [devicePreview, setDevicePreview] = useState('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchData();
  }, [websiteId]);

  // Auto-save debouncing
  useEffect(() => {
    if (!website) return;
    
    const timeoutId = setTimeout(() => {
      saveConfigToDatabase(config, false); // silent save
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [config]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/website/id/${websiteId}`);
      const siteData = res.data;
      setWebsite(siteData);
      setBusiness(siteData.businessId);
      
      // Fetch products for this specific storefront
      if (siteData && siteData.businessId) {
        const businessIdStr = siteData.businessId._id || siteData.businessId;
        try {
          const prodRes = await axios.get(`${API_URL}/business/${businessIdStr}/products`, {
            params: { websiteId: siteData._id }
          });
          setProducts(prodRes.data);
        } catch (e) {
          console.error("Failed to load products for preview", e);
        }
      }
      
      // Base initialization with defaults
      let mergedConfig = { ...DEFAULT_CONFIG };
      
      // Apply root level properties from the legacy generation
      if (siteData.template) mergedConfig.template = siteData.template;
      if (siteData.theme) mergedConfig.themeColor = siteData.theme;
      
      // Merge saved designConfig if it exists
      if (siteData.designConfig && Object.keys(siteData.designConfig).length > 0) {
        const dbConfig = siteData.designConfig;
        mergedConfig = {
          ...mergedConfig,
          ...dbConfig,
          navbar: { ...DEFAULT_CONFIG.navbar, ...(dbConfig.navbar || {}) },
          header: { 
            ...DEFAULT_CONFIG.header, 
            ...(dbConfig.header || {}),
            announcement: { ...DEFAULT_CONFIG.header.announcement, ...((dbConfig.header && dbConfig.header.announcement) || {}) }
          },
          products: { ...DEFAULT_CONFIG.products, ...(dbConfig.products || {}) },
          typography: { ...DEFAULT_CONFIG.typography, ...(dbConfig.typography || {}) },
          footer: { ...DEFAULT_CONFIG.footer, ...(dbConfig.footer || {}) },
          trust: { 
            ...DEFAULT_CONFIG.trust, 
            ...(dbConfig.trust || {}),
            badges: { ...DEFAULT_CONFIG.trust.badges, ...((dbConfig.trust && dbConfig.trust.badges) || {}) },
            testimonials: { ...DEFAULT_CONFIG.trust.testimonials, ...((dbConfig.trust && dbConfig.trust.testimonials) || {}) }
          },
          media: { ...DEFAULT_CONFIG.media, ...(dbConfig.media || {}) },
          buttons: { ...DEFAULT_CONFIG.buttons, ...(dbConfig.buttons || {}) },
          spacing: { ...DEFAULT_CONFIG.spacing, ...(dbConfig.spacing || {}) },
          mobile: { ...DEFAULT_CONFIG.mobile, ...(dbConfig.mobile || {}) },
        };
      }
      
      setConfig(mergedConfig);
    } catch (err) {
      console.error('Failed to load website', err);
      alert('Could not load website editor.');
    }
  };

  const saveConfigToDatabase = async (currentConfig, isPublish = false) => {
    try {
      if (isPublish) setIsSaving(true);
      
      const payload = { designConfig: currentConfig };
      if (isPublish) payload.published = true;
      
      await axios.put(`${API_URL}/website/update/${websiteId}`, payload);
      
      setLastSaved(new Date());
      
      if (isPublish) {
        setIsSaving(false);
        // Toast could be added here
      }
    } catch (error) {
      console.error('Error saving config', error);
      if (isPublish) setIsSaving(false);
    }
  };

  const handlePublish = () => {
    saveConfigToDatabase(config, true);
    alert('✅ Design Published Successfully!');
  };

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-lg">
              {business?.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Editing storefront:</div>
              <div className="font-bold text-gray-900 leading-tight">{website.slug}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded-md transition-colors ${devicePreview === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Desktop"
            >
              <FaDesktop />
            </button>
            <button 
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded-md transition-colors ${devicePreview === 'tablet' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Tablet"
            >
              <FaTabletAlt />
            </button>
            <button 
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded-md transition-colors ${devicePreview === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Mobile"
            >
              <FaMobileAlt />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          {lastSaved && (
            <div className="text-xs text-gray-500 font-medium">
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}

          <button 
            onClick={() => window.open(`/website/${website.slug}`, '_blank')}
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold border border-gray-200 transition-colors text-sm"
          >
            <FaExternalLinkAlt className="text-xs" /> View Live Site
          </button>
          
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-all text-sm disabled:opacity-70"
          >
            <FaSave /> {isSaving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: 40% Width */}
        <div className="w-[40%] bg-white border-r border-gray-200 flex flex-col overflow-y-auto relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <EditorControls config={config} setConfig={setConfig} website={website} />
        </div>

        {/* Right Panel: 60% Width */}
        <div className="w-[60%] bg-gray-100 flex items-center justify-center p-8 overflow-hidden relative">
          <LivePreview config={config} devicePreview={devicePreview} website={website} business={business} products={products} />
        </div>
        
      </div>
    </div>
  );
}

export default WebsiteEditor;
