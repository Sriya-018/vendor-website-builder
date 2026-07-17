import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaDesktop, FaTabletAlt, FaMobileAlt, FaExternalLinkAlt, FaSave } from 'react-icons/fa';
import EditorControls from '../components/editor/EditorControls';
import LivePreview from '../components/editor/LivePreview';

const API_URL = 'http://localhost:5000/api';

const DEFAULT_CONFIG = {
  template: 't1',
  theme: {},
  typography: {
    headingFont: 'sans',
    bodyFont: 'sans',
    baseSize: 16,
    lineHeight: 'normal',
    letterSpacing: 'normal',
    fontWeight: 'normal',
  },
  navbar: {
    position: 'top',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    logoText: '',
    showSearch: true,
    searchPosition: 'right',
    links: [{ id: '1', label: 'Home', url: '/' }, { id: '2', label: 'Products', url: '/products' }],
    sticky: true,
    menuAlignment: 'center',
    height: 'normal',
    hoverStyle: 'underline',
  },
  header: {
    announcement: { show: false, text: 'Free shipping on orders over ₹50!', color: '#2563eb', dismissible: true },
    heroImage: '',
    heroAlign: 'center',
    heroHeading: 'Welcome to our store',
    heroSubheading: 'Discover our amazing products',
    ctaLabel: 'Shop Now',
    bgColor: '#f3f4f6',
    parallax: false,
    slider: false,
    heroHeight: 'large',
    overlayOpacity: '40',
    buttonStyle: 'filled',
    titleSize: 'large',
    subtitleSize: 'medium',
    ctaPosition: 'bottom',
  },
  spacing: {
    borderRadius: '8px',
    maxWidth: 'normal',
    padding: 'comfortable',
    sectionSpacing: 'normal',
    cardSpacing: 'normal',
    gridGap: 'normal',
    containerWidth: 'large',
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
    cardRadius: '8px',
    shadow: 'medium',
    imageRatio: 'square',
    imagePosition: 'top',
    border: 'true',
    buttonPosition: 'bottom',
    priceStyle: 'bold',
  },
  buttons: {
    primaryStyle: 'filled',
    secondaryStyle: 'outlined',
    size: 'medium',
    fullWidthMobile: false,
    addToCartLabel: 'Add to Cart',
    radius: '8px',
    padding: 'normal',
    hoverAnimation: 'scale',
    shadow: 'none',
    iconPosition: 'left',
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
    layout: 'standard',
    socialIconStyle: 'outlined',
    copyrightAlignment: 'center',
  },
  forms: {
    inputRadius: '8px',
    border: 'true',
    focusColor: '#3b82f6',
    labelStyle: 'bold',
    placeholderColor: '#9ca3af',
  },
  animations: {
    pageAnimation: 'fade',
    fade: true,
    zoom: false,
    slide: false,
    hoverEffects: 'subtle',
  },
  shadows: {
    globalStyle: 'medium', // light, medium, heavy, none
  },
  icons: {
    style: 'outlined', // outlined, filled, rounded
  },
  images: {
    borderRadius: '8px',
    overlay: false,
    brightness: 100,
    aspectRatio: 'auto',
  },
  customCss: '',
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
  },
  sectionOrder: ['hero', 'ingredients', 'products', 'routine', 'gallery', 'faq', 'testimonials', 'hours', 'contact'],
  sections: {
    hero: true,
    ingredients: true,
    products: true,
    routine: true,
    gallery: true,
    faq: true,
    testimonials: true,
    hours: true,
    contact: true,
    about: true,
    newsletter: true,
    footer: true
  },
  beauty: {
    ingredients: [
      { id: '1', name: 'Organic Aloe Vera', desc: 'Soothes and hydrates irritated skin.', icon: '🌿' },
      { id: '2', name: 'Hyaluronic Acid', desc: 'Retains moisture for a plump look.', icon: '💧' },
      { id: '3', name: 'Vitamin C Extract', desc: 'Brightens and evens out skin tone.', icon: '🍊' }
    ],
    routine: {
      title: 'Your Daily Glow Routine',
      steps: [
        { id: '1', num: '01', title: 'Cleanse', text: 'Wash away impurities with our gentle cleanser.' },
        { id: '2', num: '02', title: 'Tone', text: 'Balance your skin pH level with floral mist.' },
        { id: '3', num: '03', title: 'Serum', text: 'Apply key vitamins and active ingredients.' },
        { id: '4', num: '04', title: 'Moisturize', text: 'Lock in hydration for all-day radiance.' }
      ]
    }
  },
  faq: {
    title: 'Frequently Asked Questions',
    questions: [
      { id: '1', question: 'What are your delivery hours?', answer: 'We deliver daily from 9:00 AM to 9:00 PM.' },
      { id: '2', question: 'How can I track my order?', answer: 'You will receive SMS updates with a tracking link.' },
      { id: '3', question: 'What is your refund policy?', answer: 'We offer full refunds on items returned within 7 days.' }
    ]
  },
  testimonials: {
    title: 'What Our Customers Say',
    list: [
      { id: '1', name: 'Aarav Mehta', role: 'Verified Buyer', review: 'Absolutely love the quality of products here! Fast delivery and great customer support.', rating: 5 },
      { id: '2', name: 'Priya Sharma', role: 'Regular Customer', review: 'Excellent range of options. The ordering process was seamless and the packaging was premium.', rating: 5 },
      { id: '3', name: 'Rohan Gupta', role: 'Local Guide', review: 'Best prices in town. Strongly recommended to anyone looking for authentic items.', rating: 4 }
    ]
  },
  gallery: {
    title: 'Our Photo Gallery',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
      'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=600&q=80'
    ]
  },
  countdown: {
    show: true,
    title: 'Mega Summer Sale Ending Soon!',
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    bgColor: '#2563eb',
    textColor: '#ffffff'
  },
  hours: {
    title: 'Business Hours',
    days: [
      { day: 'Monday', hours: '9:00 AM - 9:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 9:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 9:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 9:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 10:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 10:00 PM' },
      { day: 'Sunday', hours: 'Closed' }
    ]
  },
  customPages: []
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
      
      // Fetch products for this specific store
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
      
      // Initialize default logoText based on template storeName
      mergedConfig.navbar = {
        ...DEFAULT_CONFIG.navbar,
        logoText: siteData.storeName || siteData.storeInfo?.businessName || siteData.businessId?.businessName || ''
      };
      
      // Merge saved designConfig if it exists
      if (siteData.designConfig && Object.keys(siteData.designConfig).length > 0) {
        const dbConfig = siteData.designConfig;
        const isGeneric = dbConfig.navbar && (dbConfig.navbar.logoText === 'My Store' || dbConfig.navbar.logoText === 'My Awesome Store');
        mergedConfig = {
          ...mergedConfig,
          ...dbConfig,
          sectionOrder: dbConfig.sectionOrder || DEFAULT_CONFIG.sectionOrder,
          sections: { ...DEFAULT_CONFIG.sections, ...(dbConfig.sections || {}) },
          faq: { ...DEFAULT_CONFIG.faq, ...(dbConfig.faq || {}) },
          testimonials: { ...DEFAULT_CONFIG.testimonials, ...(dbConfig.testimonials || {}) },
          gallery: { ...DEFAULT_CONFIG.gallery, ...(dbConfig.gallery || {}) },
          countdown: { ...DEFAULT_CONFIG.countdown, ...(dbConfig.countdown || {}) },
          hours: { ...DEFAULT_CONFIG.hours, ...(dbConfig.hours || {}) },
          navbar: { 
            ...DEFAULT_CONFIG.navbar, 
            ...(dbConfig.navbar || {}),
            logoText: (!isGeneric && dbConfig.navbar && dbConfig.navbar.logoText) || siteData.storeName || siteData.storeInfo?.businessName || siteData.businessId?.businessName || ''
          },
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
          beauty: {
            ...DEFAULT_CONFIG.beauty,
            ...(dbConfig.beauty || {}),
            routine: {
              ...DEFAULT_CONFIG.beauty.routine,
              ...((dbConfig.beauty && dbConfig.beauty.routine) || {})
            }
          },
          customPages: dbConfig.customPages || DEFAULT_CONFIG.customPages || [],
        };
      }
      
      if (typeof mergedConfig.themeColor === 'object' && mergedConfig.themeColor !== null) {
        mergedConfig.themeColor = mergedConfig.themeColor.primaryColor || '#2563eb';
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
      
      const payload = { 
        designConfig: currentConfig,
        theme: typeof currentConfig.themeColor === 'string' ? { primaryColor: currentConfig.themeColor } : undefined
      };
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

  const handleUpdateConfig = (category, field, value) => {
    setConfig(prev => {
      if (category === 'sectionOrder') {
        return { ...prev, sectionOrder: value };
      }
      if (category === 'sections') {
        return {
          ...prev,
          sections: {
            ...prev.sections,
            [field]: value
          }
        };
      }
      if (typeof prev[category] !== 'object') {
        return { ...prev, [category]: value };
      }
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
    });
  };

  const handleUpdateProduct = async (productId, field, value) => {
    setProducts(prev => prev.map(p => (p._id === productId || p.id === productId) ? { ...p, [field]: value } : p));
    
    try {
      if (productId && typeof productId === 'string' && productId.length === 24) {
        await axios.put(`${API_URL}/business/products/${productId}`, { [field]: value });
      }
    } catch (e) {
      console.error("Failed to update product inline", e);
    }
  };

  const handleAddProduct = async () => {
    try {
      const businessIdStr = business._id || business;
      const isBeauty = config.template === 't3' || config.template === 't9' || config.template === 't15' || website?.storeInfo?.category === 'beauty';
      
      const res = await axios.post(`${API_URL}/business/${businessIdStr}/products`, {
        websiteId: websiteId,
        name: isBeauty ? 'New Organic Serum' : 'New Premium Product',
        price: isBeauty ? 399 : 499,
        category: isBeauty ? 'skincare' : 'general',
        description: isBeauty ? 'Rich botanical extracts formulated for skin health.' : 'High-quality item description.',
        imageUrl: ''
      });
      setProducts(prev => [...prev, res.data]);
    } catch (e) {
      console.error("Failed to add product inline", e);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/business/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId && p.id !== productId));
    } catch (e) {
      console.error("Failed to delete product inline", e);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handlePublish = () => {
    saveConfigToDatabase(config, true);
    alert('✅ Design Published Successfully!');
  };

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9FD]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-[#09080E] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-[#13121A] border-b border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors bg-slate-100 dark:bg-[#1A1924] hover:bg-slate-200 dark:hover:bg-[#2A2934] p-2 rounded-xl"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center rounded-lg font-extrabold text-lg shadow-md shadow-indigo-500/10">
              {business?.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-500 font-semibold">Editing store:</div>
              <div className="font-extrabold text-slate-900 dark:text-white leading-tight">{website.slug}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-[#09080E] p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button 
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded-lg transition-colors ${devicePreview === 'desktop' ? 'bg-white dark:bg-[#13121A] shadow-sm text-purple-650 dark:text-purple-400' : 'text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Desktop"
            >
              <FaDesktop />
            </button>
            <button 
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded-lg transition-colors ${devicePreview === 'tablet' ? 'bg-white dark:bg-[#13121A] shadow-sm text-purple-650 dark:text-purple-400' : 'text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Tablet"
            >
              <FaTabletAlt />
            </button>
            <button 
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded-lg transition-colors ${devicePreview === 'mobile' ? 'bg-white dark:bg-[#13121A] shadow-sm text-purple-650 dark:text-purple-400' : 'text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Mobile"
            >
              <FaMobileAlt />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-250 dark:bg-slate-700"></div>
          
          {lastSaved && (
            <div className="text-xs text-slate-600 dark:text-slate-500 font-semibold">
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}

          <button 
            onClick={() => window.open(`/website/${website.slug}`, '_blank')}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-[#1A1924] px-4 py-2 rounded-xl font-bold transition-all text-sm"
          >
            <FaExternalLinkAlt className="text-xs" /> View Live Site
          </button>
          
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-extrabold shadow-md shadow-indigo-500/10 hover:scale-[1.01] transition-all text-sm disabled:opacity-75"
          >
            <FaSave /> {isSaving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: 40% Width */}
        <div className="w-[40%] bg-white dark:bg-[#09080E] border-r border-slate-200 dark:border-slate-700/60 flex flex-col overflow-y-auto relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <EditorControls config={config} setConfig={setConfig} website={website} />
        </div>

        {/* Right Panel: 60% Width */}
        <div className="w-[60%] bg-slate-50 dark:bg-[#1A1924] flex items-center justify-center p-8 overflow-hidden relative">
          <LivePreview 
            config={config} 
            devicePreview={devicePreview} 
            website={website} 
            business={business} 
            products={products}
            isEditable={true}
            onUpdateConfig={handleUpdateConfig}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
        
      </div>
    </div>
  );
}

export default WebsiteEditor;
