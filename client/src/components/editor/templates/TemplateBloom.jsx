import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
 FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
 FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
 FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateBloom({ 
 config, 
 business, 
 products, 
 devicePreview, 
 website, 
 isEditable = false, 
 onUpdateConfig, 
 onUpdateProduct, 
 onAddProduct,
 onDeleteProduct
}) {
 const [scrolled, setScrolled] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const [activeFaq, setActiveFaq] = useState(null);
 const [currentPage, setCurrentPage] = useState('home');
 const [activeEditProductId, setActiveEditProductId] = useState(null);

 const isCustomPage = !['home', 'shop', 'contact'].includes(currentPage);
 const activeCustomPage = (config.customPages || []).find(p => p.id === currentPage);

 // Catalog Filters State
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('All');
 const [selectedSkinType, setSelectedSkinType] = useState('All');
 const [sortBy, setSortBy] = useState('default');

 // Contact Form State
 const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
 const [formSubmitted, setFormSubmitted] = useState(false);

 // Background Editor Modal State
 const [showBgModal, setShowBgModal] = useState(false);
 const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'ai'
 const [aiPrompt, setAiPrompt] = useState('');
 const [aiStyle, setAiStyle] = useState('watercolor');
 const [isGenerating, setIsGenerating] = useState(false);

 const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'My Store');
 const storeName = website?.storeName || business?.businessName || 'My Store';
 const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
 const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
 const description = config.header.heroHeading || 'Radiant beauty, naturally curated.';
 const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
 const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
 const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
 
 const primaryColor = config.theme?.primary || '#500724'; // Deep rose-burgundy for high-contrast luxury feel
 const accentColor = config.theme?.accent || '#EC4899'; // Pink 500
 const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

 const getProductImageUrl = (product, i) => {
 const imgUrl = product.img || product.imageUrl;
 if (!imgUrl) return `https://picsum.photos/seed/beauty${i}/600/600`;
 if (imgUrl.startsWith('http')) return imgUrl;
 return `http://localhost:5000${imgUrl}`;
 };

 const PRESETS = [
 { name: 'Rose Petals Bokeh', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Floral Cosmetics Backdrop', url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Zen Spa Stones & Orchid', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Aroma Oils & Botanical Herbs', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Pink Watercolor Art', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Rose Gold Gradient Light', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80' }
 ];

 // Ticking countdown timer logic
 const countdownEndDate = config.countdown?.endDate;
 const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
 useEffect(() => {
 if (!countdownEndDate) return;
 const interval = setInterval(() => {
 const difference = +new Date(countdownEndDate) - +new Date();
 if (difference <= 0) {
 clearInterval(interval);
 setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
 } else {
 setTimeLeft({
 days: Math.floor(difference / (1000 * 60 * 60 * 24)),
 hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((difference / 1000 / 60) % 60),
 seconds: Math.floor((difference / 1000) % 60)
 });
 }
 }, 1000);
 return () => clearInterval(interval);
 }, [countdownEndDate]);

 useEffect(() => {
 const handleScroll = () => {
 const container = document.getElementById('preview-scroll-container');
 const scrollTop = container ? container.scrollTop : window.scrollY;
 setScrolled(scrollTop > 50);
 };
 const container = document.getElementById('preview-scroll-container');
 if (container) {
 container.addEventListener('scroll', handleScroll);
 }
 window.addEventListener('scroll', handleScroll);
 return () => {
 if (container) {
 container.removeEventListener('scroll', handleScroll);
 }
 window.removeEventListener('scroll', handleScroll);
 };
 }, []);

 const changePage = (pageName) => {
 setCurrentPage(pageName);
 setMenuOpen(false);
 const container = document.getElementById('preview-scroll-container');
 if (container) {
 container.scrollTop = 0;
 }
 };

 const handleContactSubmit = async (e) => {
 e.preventDefault();
 if (!contactForm.name || !contactForm.email || !contactForm.message) {
 alert('Please fill out all fields.');
 return;
 }
 
 const websiteId = website?._id || website?.id;
 const businessId = business?._id || business?.id || (typeof website?.businessId === 'object' ? website?.businessId?._id : website?.businessId);
 
 if (!businessId || !websiteId) {
 // Fallback for previews/mockups without database bindings
 setFormSubmitted(true);
 setContactForm({ name: '', email: '', message: '' });
 setTimeout(() => setFormSubmitted(false), 5000);
 return;
 }
 
 try {
 await axios.post(`http://localhost:5000/api/business/${businessId}/inquiries`, {
 name: contactForm.name,
 email: contactForm.email,
 message: contactForm.message,
 websiteId
 });
 setFormSubmitted(true);
 setContactForm({ name: '', email: '', message: '' });
 setTimeout(() => setFormSubmitted(false), 5000);
 } catch (err) {
 console.error('Failed to submit inquiry:', err);
 alert('Failed to send message: ' + (err.response?.data?.error || err.message));
 }
 };

 const handleGenerateAiBg = async () => {
 if (!aiPrompt.trim()) {
 alert('Please enter a description prompt.');
 return;
 }
 setIsGenerating(true);
 try {
 const res = await axios.post('http://localhost:5000/api/ai/generate-background', {
 prompt: aiPrompt,
 style: aiStyle
 });
 if (res.data && res.data.url) {
 const fullUrl = `http://localhost:5000${res.data.url}`;
 onUpdateConfig('header', 'heroImage', fullUrl);
 setShowBgModal(false);
 } else {
 alert('Could not generate background. Please try again.');
 }
 } catch (err) {
 console.error(err);
 alert('Error generating background: ' + (err.response?.data?.error || err.message));
 } finally {
 setIsGenerating(false);
 }
 };

 const handleProductImageUpload = async (productId, e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const formData = new FormData();
 formData.append('image', file);
 try {
 const res = await axios.post('http://localhost:5000/api/upload/product-image', formData);
 if (res.data && res.data.url) {
 onUpdateProduct(productId, 'img', res.data.url);
 onUpdateProduct(productId, 'imageUrl', res.data.url);
 }
 } catch (err) {
 console.error(err);
 alert('Failed to upload product image: ' + err.message);
 }
 };

 // Categories extraction
 const categoriesList = ['All', ...new Set(products.map(p => p.category || 'general'))];

 // Filtering & sorting logic (with dynamic case-insensitive text match for skin concerns)
 const sortedFilteredProducts = products
 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
 .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
 .filter(p => {
 if (selectedSkinType === 'All') return true;
 const term = selectedSkinType.toLowerCase().replace(' skin', '');
 return p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term);
 })
 .sort((a, b) => {
 if (sortBy === 'price-low') return a.price - b.price;
 if (sortBy === 'price-high') return b.price - a.price;
 // Sort by orderCount descending. If equal, sort by isBestseller flag.
 const orderA = a.orderCount || 0;
 const orderB = b.orderCount || 0;
 if (orderB !== orderA) {
 return orderB - orderA;
 }
 return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
 });

 const defaultOrder = ['hero', 'ingredients', 'products', 'routine', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
 const order = config.sectionOrder || defaultOrder;
 const sectionsVisible = config.sections || {
 hero: true,
 ingredients: true,
 products: true,
 routine: true,
 gallery: true,
 faq: true,
 testimonials: true,
 hours: true,
 contact: true
 };

 const renderSection = (key) => {
 if (sectionsVisible[key] === false) return null;

 switch (key) {
 case 'hero':
 return (
 <SectionWrapper key="hero" isEditable={isEditable} sectionKey="hero" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <header className="relative py-20 px-8 text-center animate-fade-in overflow-hidden min-h-[60vh] flex items-center justify-center">
 <div className="absolute inset-0 z-0">
 <img src={heroImage} className="w-full h-full object-cover" alt="Hero Background" />
 <div className="absolute inset-0 bg-gradient-to-b from-rose-950/25 via-[#fff5f6]/40 to-[#fff5f6]"></div>
 </div>
 
 {isEditable && (
 <button 
 onClick={() => setShowBgModal(true)}
 className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface/95 backdrop-blur border border-pink-200 text-pink-900 rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
 >
 🎨 Edit Hero Background
 </button>
 )}

 <div className="relative z-10 max-w-3xl mx-auto w-full px-4" style={{ textAlign: config.header.heroAlign }}>
 <p className="inline-block text-xs font-black tracking-[0.2em] uppercase mb-6 px-4 py-1.5 rounded-full bg-theme-surface/80 backdrop-blur-md border border-pink-200/50 shadow-theme transition-all duration-300 hover:scale-105" style={{ color: accentColor }}>
 ✦ BEAUTY & WELLNESS ✦
 </p>
 <EditableText
 isEditable={isEditable}
 value={config.header.heroHeading || storeName}
 onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
 tagName="h1"
 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight drop-shadow-theme"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <EditableText
 isEditable={isEditable}
 value={config.header.heroSubheading || description}
 onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
 tagName="p"
 className="text-lg md:text-xl mb-10 max-w-xl font-medium leading-relaxed"
 style={{ color: '#88626c', marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
 />
 <div className={`flex flex-wrap gap-4 items-center ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-4 text-white rounded-full font-bold shadow-theme hover:shadow-theme hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
 style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px ${accentColor}40` }}
 >
 <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Explore Collection'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
 <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
 </button>
 {phoneNumber && (
 <a 
 href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="px-8 py-4 bg-theme-surface/90 backdrop-blur-sm rounded-full font-bold border border-pink-200 text-rose-950 shadow-theme hover:bg-theme-primary text-white hover:text-white hover:border-pink-500 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center"
 >
 <FaWhatsapp className="mr-2 text-theme-primary text-lg" /> Chat with Us
 </a>
 )}
 </div>
 </div>
 </header>
 </SectionWrapper>
 );

 case 'ingredients':
 const ingredientsList = config.beauty?.ingredients || [
 { id: '1', name: 'Organic Aloe Vera', desc: 'Soothes and hydrates irritated skin.', icon: '🌿' },
 { id: '2', name: 'Hyaluronic Acid', desc: 'Retains moisture for a plump look.', icon: '💧' },
 { id: '3', name: 'Vitamin C Extract', desc: 'Brightens and evens out skin tone.', icon: '🍊' }
 ];
 return (
 <SectionWrapper key="ingredients" isEditable={isEditable} sectionKey="ingredients" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-20 bg-gradient-to-tr from-pink-50/40 via-amber-50/20 to-pink-50/30 border border-pink-100/40 rounded-theme my-10 shadow-theme">
 <div className="text-center mb-12 animate-fade-in">
 <EditableText
 isEditable={isEditable}
 value={config.beauty?.sectionTitle || 'Key Active Ingredients'}
 onChange={(val) => onUpdateConfig('beauty', 'sectionTitle', val)}
 tagName="h2"
 className="text-3.5xl font-black mb-3 tracking-tight"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <EditableText
 isEditable={isEditable}
 value={config.beauty?.sectionSubtitle || 'All-natural clean extracts formulated for skin nutrition.'}
 onChange={(val) => onUpdateConfig('beauty', 'sectionSubtitle', val)}
 tagName="p"
 className="text-sm font-medium"
 style={{ color: '#88626c' }}
 />
 <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {ingredientsList.map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface/90 backdrop-blur-md rounded-theme p-8 border border-pink-100/50 shadow-theme hover:shadow-theme hover:shadow-pink-200/30 hover:border-pink-300/30 transition-all duration-300 relative group">
 {isEditable && (
 <button 
 onClick={() => {
 const updated = ingredientsList.filter(ing => ing.id !== item.id);
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-50 text-theme-primary hover:bg-red-100 flex items-center justify-center font-bold text-xs"
 title="Remove Ingredient"
 >
 ×
 </button>
 )}
 <div className="mb-4">
 {isEditable ? (
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
 <img 
 src={item.icon.startsWith('http') ? item.icon : `http://localhost:5000${item.icon}`} 
 alt={item.name} 
 className="w-12 h-12 object-contain rounded-theme bg-pink-50 border border-pink-100 p-1" 
 />
 ) : (
 <span className="text-4xl">{item.icon || '🌸'}</span>
 )}
 <input 
 type="text"
 value={item.icon || ''}
 placeholder="Emoji or Image URL"
 onChange={(e) => {
 const updated = ingredientsList.map(ing => ing.id === item.id ? { ...ing, icon: e.target.value } : ing);
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 className="flex-1 p-2 border border-pink-100 rounded-theme text-xs bg-pink-50/20 outline-none focus:border-pink-500"
 />
 </div>
 <div className="flex flex-col gap-1.5 bg-theme-bg/50 p-2 rounded-theme border border-pink-50">
 <div className="flex gap-1.5 flex-wrap justify-center">
 {['🌿', '💧', '🍊', '🌸', '🧪', '✨', '🌹', '🥥', '🍯', '🍃'].map(emoji => (
 <button 
 key={emoji}
 type="button"
 onClick={() => {
 const updated = ingredientsList.map(ing => ing.id === item.id ? { ...ing, icon: emoji } : ing);
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 className="hover:scale-125 transition-transform text-lg"
 >
 {emoji}
 </button>
 ))}
 </div>
 <label className="w-full inline-block px-3 py-1 bg-pink-100 hover:bg-pink-200 text-pink-950 font-bold rounded-theme text-[10px] cursor-pointer transition-colors text-center border border-pink-200 shadow-theme">
 📁 Upload Picture
 <input 
 type="file" 
 accept="image/*" 
 className="hidden" 
 onChange={async (e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const formData = new FormData();
 formData.append('image', file);
 try {
 const res = await axios.post('http://localhost:5000/api/upload/product-image', formData);
 if (res.data && res.data.url) {
 const updated = ingredientsList.map(ing => ing.id === item.id ? { ...ing, icon: res.data.url } : ing);
 onUpdateConfig('beauty', 'ingredients', updated);
 }
 } catch (err) {
 console.error(err);
 alert('Upload failed: ' + err.message);
 }
 }}
 />
 </label>
 </div>
 </div>
 ) : (
 item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
 <img 
 src={item.icon.startsWith('http') ? item.icon : `http://localhost:5000${item.icon}`} 
 alt={item.name} 
 className="w-14 h-14 object-contain rounded-theme bg-pink-50/50 p-1.5" 
 />
 ) : (
 <span className="text-4xl block text-left">{item.icon || '🌸'}</span>
 )
 )}
 </div>
 {isEditable ? (
 <div className="space-y-2">
 <input 
 type="text"
 value={item.name}
 onChange={(e) => {
 const updated = ingredientsList.map(ing => ing.id === item.id ? { ...ing, name: e.target.value } : ing);
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 className="w-full font-bold text-[#831843] border-b border-dashed border-pink-200 focus:border-pink-500 outline-none text-base"
 style={{ fontFamily: "'Playfair Display', serif" }}
 />
 <textarea 
 value={item.desc}
 onChange={(e) => {
 const updated = ingredientsList.map(ing => ing.id === item.id ? { ...ing, desc: e.target.value } : ing);
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 rows={2}
 className="w-full text-xs text-theme-muted border border-pink-100 rounded p-1 bg-pink-50/10 focus:border-pink-500 outline-none resize-none"
 />
 </div>
 ) : (
 <>
 <h4 className="text-lg font-bold mb-2" style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
 {item.name}
 </h4>
 <p className="text-xs text-theme-muted leading-relaxed">{item.desc}</p>
 </>
 )}
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={() => {
 const updated = [...ingredientsList, { id: Date.now().toString(), name: 'New Flora Extract', desc: 'Describe botanical benefits here.', icon: '🌸' }];
 onUpdateConfig('beauty', 'ingredients', updated);
 }}
 className="border-2 border-dashed border-pink-200/80 rounded-theme p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-100/10 hover:shadow-inner transition-all duration-300 min-h-[180px]"
 >
 <div className="w-10 h-10 rounded-full bg-pink-100 text-theme-primary flex items-center justify-center font-bold text-lg mb-3">+</div>
 <span className="font-bold text-pink-900 text-xs">Add Ingredient</span>
 </div>
 )}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'products':
 return (
 <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="products" className="max-w-7xl mx-auto px-8 py-20">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionTitle || 'Our Collection'}
 onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
 tagName="h2"
 className="text-4xl font-black mb-3 tracking-tight"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionSubtitle || 'Handpicked beauty essentials formulated for skincare health.'}
 onChange={(val) => onUpdateConfig('products', 'sectionSubtitle', val)}
 tagName="p"
 className="text-sm font-medium"
 style={{ color: '#88626c' }}
 />
 <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
 </div>
 
 <div 
 className="grid gap-8"
 style={{ 
 gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
 : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
 : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
 }}
 >
 {products.slice(0, 4).map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-theme-surface/95 backdrop-blur-md rounded-theme overflow-hidden hover:-translate-y-2 hover:shadow-theme hover:shadow-pink-200/30 hover:border-pink-300/40 transition-all duration-300 group flex flex-col justify-between border border-pink-100/50"
 style={{ boxShadow: `0 8px 30px ${accentColor}0e`, borderRadius: '24px' }}
 >
 <div>
 <div className="h-60 overflow-hidden bg-[#fce7f3] relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-[#EC4899] text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-pink-200 hover:bg-[#500724] hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-6 text-center">
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-bold mb-1 truncate"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 {config.products?.showPrices !== false && (
 <div className="font-bold text-lg mb-4 flex items-center justify-center gap-0.5" style={{ color: accentColor }}>
 <span>₹</span>
 <EditableText
 isEditable={isEditable}
 value={String(product.price)}
 onChange={(val) => {
 const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
 onUpdateProduct(product._id || product.id, 'price', num);
 }}
 tagName="span"
 />
 </div>
 )}
 </div>
 </div>
 <div className="p-6 pt-0 text-center">
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`w-full py-2.5 text-white rounded-full font-bold text-sm transition-all ${
 product.inStock === false 
 ? 'opacity-60 cursor-not-allowed bg-gray-400' 
 : 'hover:opacity-85 transition-opacity'
 }`}
 style={product.inStock !== false ? { backgroundColor: accentColor } : {}}
 >
 {product.inStock === false ? 'Out of Stock' : 'Add to Bag'}
 </button>
 )}
 </div>
 </div>
 ))}
 </div>

 <div className="text-center mt-12 flex justify-center gap-4">
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-3.5 border-2 rounded-full font-bold transition-all text-sm"
 style={{ color: primaryColor, borderColor: accentColor }}
 >
 View All Products
 </button>
 {isEditable && (
 <button 
 onClick={onAddProduct}
 className="px-8 py-3.5 text-white rounded-full font-bold transition-all text-sm hover:opacity-90 shadow-theme flex items-center gap-1.5"
 style={{ backgroundColor: accentColor }}
 >
 + Add New Product
 </button>
 )}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'routine':
 const routineObj = config.beauty?.routine || {
 title: 'Your Daily Glow Routine',
 steps: [
 { id: '1', num: '01', title: 'Cleanse', text: 'Wash away impurities with our gentle cleanser.' },
 { id: '2', num: '02', title: 'Tone', text: 'Balance your skin pH level with floral mist.' },
 { id: '3', num: '03', title: 'Serum', text: 'Apply key vitamins and active ingredients.' },
 { id: '4', num: '04', title: 'Moisturize', text: 'Lock in hydration for all-day radiance.' }
 ]
 };
 return (
 <SectionWrapper key="routine" isEditable={isEditable} sectionKey="routine" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-4xl mx-auto px-8 py-20 bg-gradient-to-tr from-rose-50/30 via-pink-50/20 to-amber-50/30 border border-pink-100/30 rounded-theme my-10 shadow-theme">
 <div className="text-center mb-16 space-y-2">
 <EditableText
 isEditable={isEditable}
 value={routineObj.title || 'Your Daily Glow Routine'}
 onChange={(val) => onUpdateConfig('beauty', 'routine', { ...routineObj, title: val })}
 tagName="h2"
 className="text-3xl md:text-4xl font-black mb-2 text-center"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <EditableText
 isEditable={isEditable}
 value={routineObj.subtitle || 'Follow our curated skincare routine steps for optimal botanical hydration.'}
 onChange={(val) => onUpdateConfig('beauty', 'routine', { ...routineObj, subtitle: val })}
 tagName="p"
 className="text-sm font-medium text-center"
 style={{ color: '#88626c' }}
 />
 <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
 </div>

 <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-pink-200/50">
 {(routineObj.steps || []).map((step, idx) => (
 <div key={step.id || idx} className="flex gap-6 relative items-start">
 <div className="w-12 h-12 rounded-full bg-theme-primary text-white text-white font-extrabold flex items-center justify-center shrink-0 border-4 border-white shadow-theme font-mono text-sm z-10 hover:scale-110 transition-transform">
 {step.num || `0${idx + 1}`}
 </div>
 <div className="bg-theme-surface/95 backdrop-blur-sm border border-pink-100/50 rounded-theme p-6 shadow-theme hover:shadow-theme transition-all duration-300 flex-1">
 {isEditable ? (
 <div className="space-y-2">
 <input 
 type="text"
 value={step.title}
 onChange={(e) => {
 const updatedSteps = routineObj.steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
 onUpdateConfig('beauty', 'routine', { ...routineObj, steps: updatedSteps });
 }}
 className="w-full font-bold text-[#831843] border-b border-dashed border-pink-200 focus:border-pink-500 outline-none text-base bg-transparent"
 style={{ fontFamily: "'Playfair Display', serif" }}
 />
 <textarea 
 value={step.text}
 onChange={(e) => {
 const updatedSteps = routineObj.steps.map(s => s.id === step.id ? { ...s, text: e.target.value } : s);
 onUpdateConfig('beauty', 'routine', { ...routineObj, steps: updatedSteps });
 }}
 rows={2}
 className="w-full text-xs text-theme-muted border border-pink-100 rounded p-2 focus:border-pink-500 outline-none resize-none bg-transparent"
 />
 </div>
 ) : (
 <>
 <h4 className="text-lg font-bold mb-2" style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
 {step.title}
 </h4>
 <p className="text-sm text-theme-muted leading-relaxed">{step.text}</p>
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'gallery':
 const galleryTitle = config.gallery?.title || 'Our Photo Gallery';
 const galleryImages = config.gallery?.images || [];
 return (
 <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-20">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={galleryTitle}
 onChange={(val) => onUpdateConfig('gallery', 'title', val)}
 tagName="h2"
 className="text-3xl font-extrabold mb-3"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="w-12 h-0.5 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
 {galleryImages.map((img, idx) => (
 <div key={idx} className="relative aspect-square rounded-theme overflow-hidden group shadow-theme border border-pink-100/30 bg-theme-surface">
 <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 {isEditable && (
 <div className="absolute inset-0 bg-[#500724]/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
 <input
 type="text"
 defaultValue={img}
 placeholder="Paste Image URL"
 onBlur={(e) => {
 const newUrl = e.target.value.trim();
 if (newUrl && newUrl !== img) {
 const updated = [...galleryImages];
 updated[idx] = newUrl;
 onUpdateConfig('gallery', 'images', updated);
 }
 }}
 className="w-full px-4 py-2 bg-theme-surface rounded-full text-xs text-rose-900 border border-pink-200 outline-none focus:ring-2 focus:ring-pink-500"
 />
 <button 
 onClick={() => {
 const updated = galleryImages.filter((_, i) => i !== idx);
 onUpdateConfig('gallery', 'images', updated);
 }}
 className="px-4 py-1.5 bg-theme-primary text-white text-white rounded-full text-[10px] font-bold shadow hover:bg-theme-primary text-white transition-colors"
 >
 Delete Image
 </button>
 </div>
 )}
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={() => {
 const updated = [...galleryImages, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'];
 onUpdateConfig('gallery', 'images', updated);
 }}
 className="border-2 border-dashed border-pink-200/80 rounded-theme flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-100/10 hover:shadow-inner transition-all duration-300 aspect-square"
 >
 <div className="w-10 h-10 rounded-full bg-pink-100 text-theme-primary flex items-center justify-center font-bold text-lg mb-3">+</div>
 <span className="font-bold text-pink-900 text-xs">Add Image Slot</span>
 </div>
 )}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'faq':
 const faqTitle = config.faq?.title || 'Frequently Asked Questions';
 const faqList = config.faq?.questions || [];
 return (
 <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-4xl mx-auto px-8 py-20">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={faqTitle}
 onChange={(val) => onUpdateConfig('faq', 'title', val)}
 tagName="h2"
 className="text-3xl font-extrabold mb-3"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="w-12 h-0.5 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {faqList.map((item, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <div key={item.id || idx} className="bg-theme-surface border border-pink-50 rounded-theme overflow-hidden shadow-theme">
 <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-rose-950 flex items-center justify-between hover:bg-pink-50/20 transition-colors">
 <EditableText
 isEditable={isEditable}
 value={item.question}
 onChange={(val) => {
 const updated = faqList.map(q => q.id === item.id ? { ...q, question: val } : q);
 onUpdateConfig('faq', 'questions', updated);
 }}
 tagName="span"
 className="flex-1 mr-4"
 />
 <span className="text-xl text-pink-400">{isOpen ? '−' : '+'}</span>
 </button>
 {isOpen && (
 <div className="px-6 py-4 bg-pink-50/10 border-t border-pink-50 text-rose-800 text-sm leading-relaxed">
 <EditableText
 isEditable={isEditable}
 value={item.answer}
 onChange={(val) => {
 const updated = faqList.map(q => q.id === item.id ? { ...q, answer: val } : q);
 onUpdateConfig('faq', 'questions', updated);
 }}
 tagName="p"
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'testimonials':
 const testimonialTitle = config.testimonials?.title || 'What Our Customers Say';
 const testimonialList = config.testimonials?.list || [];
 return (
 <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="bg-gradient-to-tr from-[#fff5f7] via-[#fff0f6]/70 to-[#fdf4f5] border-t border-b border-pink-100/40 py-20 px-8 rounded-theme my-10 shadow-theme">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={testimonialTitle}
 onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
 tagName="h2"
 className="text-3.5xl font-black mb-3 tracking-tight"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {testimonialList.map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface/95 backdrop-blur-md rounded-theme p-8 shadow-theme border border-pink-100/50 hover:shadow-theme hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
 <div>
 <div className="flex gap-1 mb-4">
 {[...Array(5)].map((_, starIdx) => (
 <button
 key={starIdx}
 disabled={!isEditable}
 onClick={() => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, rating: starIdx + 1 } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 className={`text-lg transition-colors ${starIdx < item.rating ? 'text-amber-400' : 'text-slate-200'}`}
 >
 ★
 </button>
 ))}
 </div>
 <EditableText
 isEditable={isEditable}
 value={item.review}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, review: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="p"
 className="text-rose-800 text-sm italic leading-relaxed mb-6"
 />
 </div>
 <div>
 <EditableText
 isEditable={isEditable}
 value={item.name}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, name: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="h5"
 className="font-bold text-rose-950 text-sm"
 />
 <EditableText
 isEditable={isEditable}
 value={item.role}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="span"
 className="text-rose-700/60 text-xs font-semibold block mt-0.5"
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'hours':
 const hoursTitle = config.hours?.title || 'Business Hours';
 const hoursDays = config.hours?.days || [];
 return (
 <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="bg-theme-surface py-20 px-8">
 <div className="max-w-xl mx-auto bg-[#fff0f6]/30 border border-pink-100 rounded-theme p-8 shadow-theme">
 <div className="text-center mb-8">
 <EditableText
 isEditable={isEditable}
 value={hoursTitle}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="h3"
 className="text-xl font-bold mb-2"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="w-12 h-0.5 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {hoursDays.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-pink-50 pb-3 last:border-b-0 last:pb-0">
 <div className="flex items-center gap-2">
 {isEditable && (
 <button
 onClick={() => {
 const updated = hoursDays.filter((_, i) => i !== idx);
 onUpdateConfig('hours', 'days', updated);
 }}
 className="text-theme-primary hover:text-theme-primary text-xs font-bold mr-1"
 title="Remove Day"
 >
 ×
 </button>
 )}
 <EditableText
 isEditable={isEditable}
 value={item.day}
 onChange={(val) => {
 const updated = hoursDays.map((d, i) => i === idx ? { ...d, day: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-rose-800 text-sm"
 />
 </div>
 <EditableText
 isEditable={isEditable}
 value={item.hours}
 onChange={(val) => {
 const updated = hoursDays.map((d, i) => i === idx ? { ...d, hours: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-rose-950 text-sm"
 />
 </div>
 ))}
 {isEditable && (
 <button
 onClick={() => {
 const updated = [...hoursDays, { day: 'New Day', hours: '9:00 AM - 5:00 PM' }];
 onUpdateConfig('hours', 'days', updated);
 }}
 className="w-full mt-4 py-2 border border-dashed border-pink-200 hover:border-pink-500 text-theme-primary rounded-theme text-xs font-bold transition-all text-center"
 >
 + Add Row
 </button>
 )}
 </div>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'countdown':
 if (!config.countdown?.show) return null;
 const countdownTitle = config.countdown?.title || 'Mega Summer Sale Ending Soon!';
 return (
 <SectionWrapper key="countdown" isEditable={isEditable} sectionKey="countdown" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="w-full py-12 px-6 text-white text-center relative overflow-hidden" style={{ backgroundColor: accentColor }}>
 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="text-left">
 <EditableText
 isEditable={isEditable}
 value={countdownTitle}
 onChange={(val) => onUpdateConfig('countdown', 'title', val)}
 tagName="h3"
 className="text-2xl font-black mb-2"
 />
 <EditableText
 isEditable={isEditable}
 value={config.countdown?.subtitle || 'Hurry up! Claim exclusive botanical benefits before the timer runs out.'}
 onChange={(val) => onUpdateConfig('countdown', 'subtitle', val)}
 tagName="p"
 className="text-pink-50 text-xs"
 />
 </div>
 
 <div className="flex gap-4">
 {[
 { label: 'Days', val: timeLeft.days },
 { label: 'Hours', val: timeLeft.hours },
 { label: 'Mins', val: timeLeft.minutes },
 { label: 'Secs', val: timeLeft.seconds }
 ].map((col, idx) => (
 <div key={idx} className="flex flex-col items-center bg-black/15 px-4 py-3 rounded-theme min-w-[70px] border border-white/20 backdrop-blur-sm">
 <span className="text-2xl font-black">{String(col.val).padStart(2, '0')}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-pink-100 mt-1">{col.label}</span>
 </div>
 ))}
 </div>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'contact':
 return (
 <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="contact" className="bg-[#fff0f6]/40 py-24 px-8 text-center border-t border-pink-100/30">
 <EditableText
 isEditable={isEditable}
 value={config.contact?.sectionTitle || '🌿 Get in Touch'}
 onChange={(val) => onUpdateConfig('contact', 'sectionTitle', val)}
 tagName="h3"
 className="text-2xl font-black mb-6 text-center"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="inline-block bg-theme-surface border border-pink-100/40 rounded-theme p-8 text-left shadow-theme min-w-[300px] space-y-4">
 {phoneNumber && <p><strong style={{ color: accentColor }}>Phone:</strong> {phoneNumber}</p>}
 {email && <p><strong style={{ color: accentColor }}>Email:</strong> {email}</p>}
 {address && <p><strong style={{ color: accentColor }}>Address:</strong> {address}</p>}
 </div>
 </section>
 </SectionWrapper>
 );

 default:
 return null;
 }
 };

 return (
 <div 
 id="preview-scroll-container"
 className="w-full h-full overflow-y-auto animate-fade-in"
 style={{
 '--primary': primaryColor,
 '--accent': accentColor,
 background: 'linear-gradient(to bottom, #fff5f6 0%, #fff1f4 20%, #ffeef2 50%, #fff1f4 80%, #fff5f6 100%)',
 color: '#3d1a27',
 fontFamily: "'Lato', sans-serif",
 fontSize: 'var(--base-size)',
 lineHeight: 'var(--line-height)',
 letterSpacing: 'var(--letter-spacing)'
 }}
 >
 {/* Announcement Bar */}
 {config.header?.announcement?.show && (
 <div className="px-4 py-2 text-center text-xs font-bold text-white relative z-50 animate-fade-in" style={{ backgroundColor: config.header.announcement.color || accentColor }}>
 {config.header.announcement.text}
 </div>
 )}

 {/* NAV */}
 <nav className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-pink-100/50 ${scrolled ? 'bg-theme-surface/90 backdrop-blur-md shadow-theme' : 'bg-theme-surface/80 backdrop-blur-md'}`}>
 <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
 <div 
 className="flex items-center gap-2 cursor-pointer"
 onClick={() => !isEditable && changePage('home')}
 >
 {fullLogoUrl ? (
 <img src={fullLogoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
 ) : (
 <EditableText
 isEditable={isEditable}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-extrabold text-[1.4rem] cursor-text"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 )}
 </div>

 {devicePreview === 'desktop' ? (
 <div className="flex gap-8 text-[0.9rem] font-bold text-rose-900 items-center">
 <button 
 onClick={() => changePage('home')}
 className={`transition-colors py-1 border-b-2 ${currentPage === 'home' ? 'text-theme-primary border-pink-500' : 'border-transparent hover:text-theme-primary'}`}
 >
 Home
 </button>
 <button 
 onClick={() => changePage('shop')}
 className={`transition-colors py-1 border-b-2 ${currentPage === 'shop' ? 'text-theme-primary border-pink-500' : 'border-transparent hover:text-theme-primary'}`}
 >
 Shop
 </button>
 {(config.customPages || []).map(page => (
 <button 
 key={page.id} 
 onClick={() => changePage(page.id)}
 className={`transition-colors py-1 border-b-2 ${currentPage === page.id ? 'text-theme-primary border-pink-500' : 'border-transparent hover:text-theme-primary'}`}
 >
 {page.title}
 </button>
 ))}
 <button 
 onClick={() => changePage('contact')}
 className={`transition-colors py-1 border-b-2 ${currentPage === 'contact' ? 'text-theme-primary border-pink-500' : 'border-transparent hover:text-theme-primary'}`}
 >
 Contact
 </button>
 </div>
 ) : (
 <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl text-rose-800"><FaBars /></button>
 )}
 </div>

 {/* Mobile Menu */}
 {devicePreview !== 'desktop' && (
 <div className={`overflow-hidden transition-all bg-theme-surface border-b border-pink-100 ${menuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
 <div className="p-4 flex flex-col gap-2 font-bold text-rose-900">
 <button onClick={() => changePage('home')} className="p-3 hover:bg-pink-50 rounded-theme text-left w-full">Home</button>
 <button onClick={() => changePage('shop')} className="p-3 hover:bg-pink-50 rounded-theme text-left w-full">Shop</button>
 {(config.customPages || []).map(page => (
 <button key={page.id} onClick={() => changePage(page.id)} className="p-3 hover:bg-pink-50 rounded-theme text-left w-full">{page.title}</button>
 ))}
 <button onClick={() => changePage('contact')} className="p-3 hover:bg-pink-50 rounded-theme text-left w-full">Contact</button>
 </div>
 </div>
 )}
 </nav>

 {/* RENDER ACTIVE PAGE */}
 {currentPage === 'home' && (
 <div className="animate-fade-in">
 {order.map(key => renderSection(key))}
 </div>
 )}

 {currentPage === 'shop' && (
 <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in">
 {/* Filters Bar */}
 <div className="bg-theme-surface/95 backdrop-blur-sm border border-pink-100 rounded-theme p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-theme">
 <div>
 <h2 className="text-2xl font-extrabold" style={{ color: config.navbar?.textColor || primaryColor, fontFamily: "'Playfair Display', serif" }}>Botanical Store</h2>
 <p className="text-rose-700/60 text-xs mt-1">Ethically formulated clean skin/body catalog.</p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl md:justify-end">
 <div className="relative flex-1">
 <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
 <input 
 type="text" 
 placeholder="Search botanical items..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-pink-50/20 border border-pink-200 text-xs text-rose-950 rounded-full outline-none focus:ring-2 focus:ring-pink-400"
 />
 </div>

 <div className="relative">
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="pl-4 pr-8 py-2.5 bg-pink-50/20 border border-pink-200 text-xs text-rose-900 rounded-full outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer appearance-none font-bold"
 >
 <option value="default">Bestselling</option>
 <option value="price-low">Price: Low to High</option>
 <option value="price-high">Price: High to Low</option>
 </select>
 <FaSortAmountDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Skin Type Filters (Category-specific beauty concerns) */}
 <div className="mb-8 bg-theme-surface/95 backdrop-blur-sm border border-pink-100/50 p-5 rounded-theme shadow-theme">
 <span className="block text-xs font-bold text-[#9d8189] uppercase tracking-widest mb-3">Skin Type Target:</span>
 <div className="flex flex-wrap gap-2.5">
 {['All', 'Dry Skin', 'Oily Skin', 'Sensitive', 'Normal'].map(type => (
 <button 
 key={type}
 onClick={() => setSelectedSkinType(type)}
 className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${selectedSkinType === type ? 'bg-[#EC4899] text-white shadow' : 'bg-[#fff0f6] border border-pink-100/40 text-[#831843] hover:bg-pink-100/25'}`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 {/* Categories Selector */}
 <div className="flex flex-wrap gap-2.5 mb-8">
 {categoriesList.map(cat => (
 <button 
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all ${selectedCategory === cat ? 'text-white shadow-theme' : 'bg-theme-surface border border-pink-100 text-rose-700 hover:bg-pink-50/50'}`}
 style={{ backgroundColor: selectedCategory === cat ? accentColor : '' }}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Catalog Grid */}
 {sortedFilteredProducts.length === 0 ? (
 <div className="text-center py-20 bg-theme-surface rounded-theme border border-pink-100 shadow-theme">
 <div className="text-4xl mb-3">🌸</div>
 <h3 className="font-bold text-rose-900 text-lg">No products found</h3>
 <p className="text-rose-400/60 text-xs mt-1">Try refining search parameters or filters.</p>
 </div>
 ) : (
 <div 
 className="grid gap-8"
 style={{ 
 gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
 : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
 : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
 }}
 >
 {sortedFilteredProducts.map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-theme-surface rounded-theme overflow-hidden hover:-translate-y-1.5 transition-transform group flex flex-col justify-between border border-pink-50/50"
 style={{ boxShadow: `0 2px 12px ${accentColor}14`, borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-60 overflow-hidden bg-[#fce7f3] relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-[#EC4899] text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-pink-200 hover:bg-[#500724] hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-6 text-center">
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-bold mb-1 truncate"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 {config.products?.showPrices !== false && (
 <div className="font-bold text-lg mb-4 flex items-center justify-center gap-0.5" style={{ color: accentColor }}>
 <span>₹</span>
 <EditableText
 isEditable={isEditable}
 value={String(product.price)}
 onChange={(val) => {
 const num = parseFloat(val.replace(/[^\d.]/g, '')) || 0;
 onUpdateProduct(product._id || product.id, 'price', num);
 }}
 tagName="span"
 />
 </div>
 )}
 </div>
 </div>

 <div className="p-6 pt-0 text-center">
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`w-full py-2.5 text-white rounded-full font-bold text-sm transition-all ${
 product.inStock === false 
 ? 'opacity-60 cursor-not-allowed bg-gray-400' 
 : 'hover:opacity-85 transition-opacity'
 }`}
 style={product.inStock !== false ? { backgroundColor: accentColor } : {}}
 >
 {product.inStock === false ? 'Out of Stock' : 'Add to Bag'}
 </button>
 )}
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={onAddProduct}
 className="bg-theme-surface border-2 border-dashed border-pink-200 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50/20 transition-all duration-300 min-h-[300px]"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div className="w-12 h-12 rounded-full bg-pink-50 text-theme-primary flex items-center justify-center text-xl font-bold mb-3">+</div>
 <h4 className="font-bold text-pink-900">Add New Product</h4>
 <p className="text-xs text-pink-400 mt-1 max-w-[180px]">Quickly create a new product card in your catalog</p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {currentPage === 'contact' && (
 <div className="max-w-7xl mx-auto px-8 py-24 animate-fade-in text-rose-950">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {/* Info panel */}
 <div className="space-y-6">
 <div>
 <EditableText
 isEditable={isEditable}
 value={config.contact?.pageTitle || 'Get in Touch'}
 onChange={(val) => onUpdateConfig('contact', 'pageTitle', val)}
 tagName="h2"
 className="text-3xl font-extrabold"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 <EditableText
 isEditable={isEditable}
 value={config.contact?.pageSubtitle || 'Send us an inquiry or ask for custom bulk cosmetic options.'}
 onChange={(val) => onUpdateConfig('contact', 'pageSubtitle', val)}
 tagName="p"
 className="text-rose-700/60 text-sm mt-1"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {phoneNumber && (
 <div className="bg-theme-surface border border-pink-100 rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-pink-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaPhoneAlt /></div>
 <div>
 <EditableText
 isEditable={isEditable}
 value={config.contact?.phoneLabel || 'Call Us'}
 onChange={(val) => onUpdateConfig('contact', 'phoneLabel', val)}
 tagName="div"
 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest"
 />
 <div className="font-bold text-rose-950 text-sm break-all">{phoneNumber}</div>
 </div>
 </div>
 )}
 {email && (
 <div className="bg-theme-surface border border-pink-100 rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-pink-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaEnvelope /></div>
 <div>
 <EditableText
 isEditable={isEditable}
 value={config.contact?.emailLabel || 'Email Us'}
 onChange={(val) => onUpdateConfig('contact', 'emailLabel', val)}
 tagName="div"
 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest"
 />
 <div className="font-bold text-rose-950 text-sm break-all">{email}</div>
 </div>
 </div>
 )}
 {address && (
 <div className="bg-theme-surface border border-pink-100 rounded-theme p-6 shadow-theme flex items-center gap-4 sm:col-span-2">
 <div className="w-12 h-12 bg-pink-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaMapMarkerAlt /></div>
 <div>
 <EditableText
 isEditable={isEditable}
 value={config.contact?.addressLabel || 'Store Address'}
 onChange={(val) => onUpdateConfig('contact', 'addressLabel', val)}
 tagName="div"
 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest"
 />
 <div className="font-bold text-rose-950 text-sm">{address}</div>
 </div>
 </div>
 )}
 </div>

 {/* Hours Card */}
 <div className="bg-theme-surface border border-pink-100 rounded-theme p-8 shadow-theme">
 <h3 className="font-bold text-xl mb-4" style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
 <EditableText
 isEditable={isEditable}
 value={config.hours?.title || 'Business Hours'}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="span"
 />
 </h3>
 <div className="space-y-3">
 {(config.hours?.days || []).map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-pink-50 pb-2.5 last:border-b-0 last:pb-0">
 <div className="flex items-center gap-2">
 {isEditable && (
 <button
 onClick={() => {
 const updated = (config.hours?.days || []).filter((_, i) => i !== idx);
 onUpdateConfig('hours', 'days', updated);
 }}
 className="text-theme-primary hover:text-theme-primary text-xs font-bold mr-1"
 title="Remove Day"
 >
 ×
 </button>
 )}
 <EditableText
 isEditable={isEditable}
 value={item.day}
 onChange={(val) => {
 const updated = (config.hours?.days || []).map((d, i) => i === idx ? { ...d, day: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-rose-800 text-sm"
 />
 </div>
 <EditableText
 isEditable={isEditable}
 value={item.hours}
 onChange={(val) => {
 const updated = (config.hours?.days || []).map((d, i) => i === idx ? { ...d, hours: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-extrabold text-rose-950 text-sm"
 />
 </div>
 ))}
 {isEditable && (
 <button
 onClick={() => {
 const updated = [...(config.hours?.days || []), { day: 'New Day', hours: '9:00 AM - 5:00 PM' }];
 onUpdateConfig('hours', 'days', updated);
 }}
 className="w-full mt-4 py-2 border border-dashed border-pink-200 hover:border-pink-500 text-theme-primary rounded-theme text-xs font-bold transition-all text-center"
 >
 + Add Row
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Inquiry Form */}
 <div className="bg-theme-surface border border-pink-100 rounded-theme p-8 md:p-10 shadow-theme relative overflow-hidden">
 <EditableText
 isEditable={isEditable}
 value={config.contact?.formTitle || 'Send a Message'}
 onChange={(val) => onUpdateConfig('contact', 'formTitle', val)}
 tagName="h3"
 className="text-2xl font-bold mb-6"
 style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}
 />
 
 {formSubmitted && (
 <div className="absolute inset-0 bg-theme-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
 <div className="w-16 h-16 bg-pink-50 text-theme-primary rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
 <h4 className="font-bold text-rose-950 text-xl">Inquiry Sent Successfully</h4>
 <p className="text-rose-600/70 text-sm mt-1 max-w-[280px]">Our botanical cosmetics team will examine your inquiry.</p>
 </div>
 )}

 <form onSubmit={handleContactSubmit} className="space-y-5">
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2 text-left">Your Name</label>
 <input 
 type="text" 
 placeholder="Jane Doe" 
 value={contactForm.name}
 onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
 className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm text-rose-950"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2 text-left">Your Email</label>
 <input 
 type="email" 
 placeholder="jane@example.com" 
 value={contactForm.email}
 onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
 className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm text-rose-950"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2 text-left">Message Details</label>
 <textarea 
 placeholder="How may we assist you?" 
 value={contactForm.message}
 onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
 rows={4}
 className="w-full px-4 py-3 bg-pink-50/30 border border-pink-100 rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm text-rose-950 resize-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full py-4 rounded-full text-white font-extrabold shadow hover:opacity-95 transition-opacity"
 style={{ backgroundColor: accentColor }}
 >
 <EditableText
 isEditable={isEditable}
 value={config.contact?.submitLabel || 'Submit Inquiry'}
 onChange={(val) => onUpdateConfig('contact', 'submitLabel', val)}
 tagName="span"
 />
 </button>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Render active custom page layouts */}
 {isCustomPage && activeCustomPage && (
 <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in text-rose-950">
 <div className="text-center mb-16">
 {isEditable ? (
 <input 
 type="text"
 value={activeCustomPage.title}
 onChange={(e) => {
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, title: e.target.value } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="text-center font-black text-4xl text-[#500724] border-b-2 border-dashed border-pink-200 focus:border-pink-500 outline-none w-full max-w-lg bg-transparent"
 style={{ fontFamily: "'Playfair Display', serif" }}
 />
 ) : (
 <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight" style={{ color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
 {activeCustomPage.title}
 </h1>
 )}
 <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
 </div>

 {/* Render layouts */}
 {activeCustomPage.layout === 'menu' && (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {(activeCustomPage.items || []).map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface/90 backdrop-blur-md rounded-theme p-6 border border-pink-100/50 shadow-theme relative group flex gap-4">
 {isEditable && (
 <button 
 onClick={() => {
 const updatedItems = activeCustomPage.items.filter(it => it.id !== item.id);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-50 text-theme-primary hover:bg-red-100 flex items-center justify-center font-bold text-xs"
 >
 ×
 </button>
 )}
 <div className="text-4xl flex items-center shrink-0">
 {isEditable ? (
 <input 
 type="text" 
 value={item.icon} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, icon: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-12 p-1 border border-pink-100 rounded text-center bg-pink-50/10 text-xl"
 />
 ) : (
 <span>{item.icon}</span>
 )}
 </div>
 <div className="flex-1 space-y-1.5">
 <div className="flex justify-between items-baseline gap-2">
 {isEditable ? (
 <input 
 type="text" 
 value={item.name} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, name: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="font-bold text-rose-950 border-b border-dashed border-pink-200 outline-none flex-1 text-sm bg-transparent"
 />
 ) : (
 <h4 className="font-bold text-rose-950 text-base">{item.name}</h4>
 )}
 <div className="flex items-center gap-0.5 text-theme-primary font-bold">
 <span>₹</span>
 {isEditable ? (
 <input 
 type="text" 
 value={item.price} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, price: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-16 text-right font-bold text-theme-primary border-b border-dashed border-pink-100 outline-none text-sm bg-transparent"
 />
 ) : (
 <span>{item.price}</span>
 )}
 </div>
 </div>
 {isEditable ? (
 <textarea 
 value={item.desc} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, desc: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 rows={2}
 className="w-full text-xs text-rose-800/70 border border-pink-100 rounded p-1.5 focus:border-pink-500 outline-none resize-none bg-transparent"
 />
 ) : (
 <p className="text-xs text-rose-800/70 leading-relaxed">{item.desc}</p>
 )}
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={() => {
 const updatedItems = [...(activeCustomPage.items || []), { id: Date.now().toString(), icon: '🍽️', name: 'New Item Name', price: '199', desc: 'Description of the special item.' }];
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="border-2 border-dashed border-pink-200/80 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-100/10 hover:shadow-inner transition-all duration-300 min-h-[140px]"
 >
 <div className="w-10 h-10 rounded-full bg-pink-100 text-theme-primary flex items-center justify-center font-bold text-lg mb-3">+</div>
 <span className="font-bold text-pink-900 text-xs">Add Menu Item</span>
 </div>
 )}
 </div>
 </div>
 )}

 {activeCustomPage.layout === 'specials' && (
 <div className="max-w-5xl mx-auto space-y-8">
 {(activeCustomPage.items || []).map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface/95 backdrop-blur-md rounded-theme overflow-hidden border border-pink-100/50 shadow-theme relative group flex flex-col md:flex-row gap-6">
 {isEditable && (
 <button 
 onClick={() => {
 const updatedItems = activeCustomPage.items.filter(it => it.id !== item.id);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-100 text-theme-primary hover:bg-red-200 flex items-center justify-center font-bold text-lg z-10"
 >
 ×
 </button>
 )}
 <div className="w-full md:w-1/3 h-52 md:h-auto bg-pink-100 shrink-0 relative overflow-hidden">
 <img src={item.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'} className="w-full h-full object-cover" alt="Special Banner" />
 {isEditable && (
 <div className="absolute inset-0 bg-[#500724]/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
 <input
 type="text"
 defaultValue={item.image}
 placeholder="Paste Image URL"
 onBlur={(e) => {
 const newUrl = e.target.value.trim();
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, image: newUrl } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-full px-4 py-2 bg-theme-surface rounded-full text-xs text-rose-900 border border-pink-200 outline-none focus:ring-2 focus:ring-pink-500"
 />
 </div>
 )}
 </div>
 <div className="p-8 flex-1 flex flex-col justify-between">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 {isEditable ? (
 <input 
 type="text" 
 value={item.name} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, name: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="font-black text-rose-950 border-b border-dashed border-pink-200 outline-none text-xl bg-transparent"
 />
 ) : (
 <h3 className="font-black text-rose-950 text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
 )}
 <span className="text-theme-primary font-extrabold text-lg">
 {isEditable ? (
 <input 
 type="text" 
 value={item.badge || 'Limited'} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, badge: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-24 text-right font-black text-theme-primary border-b border-dashed border-pink-100 outline-none text-sm bg-transparent"
 />
 ) : (
 item.badge || 'Limited'
 )}
 </span>
 </div>
 {isEditable ? (
 <textarea 
 value={item.desc} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, desc: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 rows={3}
 className="w-full text-sm text-rose-800/80 border border-pink-100 rounded p-2 focus:border-pink-500 outline-none resize-none bg-transparent"
 />
 ) : (
 <p className="text-sm text-rose-800/80 leading-relaxed">{item.desc}</p>
 )}
 </div>
 
 <button 
 onClick={() => changePage('shop')}
 className="px-6 py-2.5 text-white font-bold rounded-full hover:scale-105 transition-transform text-xs shadow-theme mt-6 self-start"
 style={{ backgroundColor: accentColor }}
 >
 {isEditable ? (
 <input 
 type="text" 
 value={item.btnLabel || 'Order Special'} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, btnLabel: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-24 text-center font-bold text-white outline-none bg-transparent"
 />
 ) : (
 item.btnLabel || 'Order Special'
 )}
 </button>
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={() => {
 const updatedItems = [...(activeCustomPage.items || []), { id: Date.now().toString(), name: 'Weekly Special Deal', desc: 'Description of the exclusive offer.', badge: '50% OFF', image: '', btnLabel: 'Claim Deal' }];
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="border-2 border-dashed border-pink-200/80 rounded-theme p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-100/10 hover:shadow-inner transition-all duration-300 min-h-[160px]"
 >
 <div className="w-10 h-10 rounded-full bg-pink-100 text-theme-primary flex items-center justify-center font-bold text-lg mb-3">+</div>
 <span className="font-bold text-pink-900 text-xs">Add Special Offer Card</span>
 </div>
 )}
 </div>
 )}

 {activeCustomPage.layout === 'features' && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {(activeCustomPage.items || []).map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface/90 backdrop-blur-md rounded-theme p-8 border border-pink-100/50 shadow-theme relative group flex flex-col justify-between">
 {isEditable && (
 <button 
 onClick={() => {
 const updatedItems = activeCustomPage.items.filter(it => it.id !== item.id);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="absolute top-4 right-4 w-6 h-6 rounded-full bg-red-50 text-theme-primary hover:bg-red-100 flex items-center justify-center font-bold text-xs"
 >
 ×
 </button>
 )}
 <div>
 <div className="text-4xl mb-4 flex items-center">
 {isEditable ? (
 <input 
 type="text" 
 value={item.icon} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, icon: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-12 p-1 border border-pink-100 rounded text-center bg-pink-50/10 text-xl"
 />
 ) : (
 <span>{item.icon}</span>
 )}
 </div>
 {isEditable ? (
 <input 
 type="text" 
 value={item.name} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, name: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-full font-bold text-rose-950 border-b border-dashed border-pink-200 outline-none text-base mb-2 bg-transparent"
 />
 ) : (
 <h4 className="text-lg font-bold text-rose-950 mb-2">{item.name}</h4>
 )}
 {isEditable ? (
 <textarea 
 value={item.desc} 
 onChange={(e) => {
 const updatedItems = activeCustomPage.items.map(it => it.id === item.id ? { ...it, desc: e.target.value } : it);
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 rows={3}
 className="w-full text-xs text-rose-800/70 border border-pink-100 rounded p-1.5 focus:border-pink-500 outline-none resize-none bg-transparent"
 />
 ) : (
 <p className="text-xs text-rose-800/70 leading-relaxed">{item.desc}</p>
 )}
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={() => {
 const updatedItems = [...(activeCustomPage.items || []), { id: Date.now().toString(), icon: '🌟', name: 'Value Feature Title', desc: 'Describe key brand values or unique features here.' }];
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, items: updatedItems } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="border-2 border-dashed border-pink-200/80 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-400 hover:bg-pink-100/10 hover:shadow-inner transition-all duration-300 min-h-[180px]"
 >
 <div className="w-10 h-10 rounded-full bg-pink-100 text-theme-primary flex items-center justify-center font-bold text-lg mb-3">+</div>
 <span className="font-bold text-pink-900 text-xs">Add Feature Card</span>
 </div>
 )}
 </div>
 )}

 {activeCustomPage.layout === 'text' && (
 <div className="max-w-3xl mx-auto bg-theme-surface/90 backdrop-blur-md rounded-theme p-8 md:p-12 border border-pink-100/50 shadow-theme space-y-6 text-left">
 {isEditable && (
 <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-theme mb-4 space-y-2">
 <label className="block text-[10px] font-bold text-theme-primary uppercase tracking-widest">Optional Image Banner URL</label>
 <input
 type="text"
 value={activeCustomPage.image || ''}
 placeholder="Paste banner image URL here"
 onChange={(e) => {
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, image: e.target.value } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 className="w-full px-3 py-2 bg-theme-surface border border-pink-100 rounded-theme text-xs outline-none focus:ring-1 focus:ring-pink-400"
 />
 </div>
 )}

 {activeCustomPage.image && (
 <div className="w-full h-64 rounded-theme overflow-hidden bg-pink-50 mb-6 shadow-theme border border-pink-100/30">
 <img src={activeCustomPage.image} className="w-full h-full object-cover" alt="Page Banner" />
 </div>
 )}

 {isEditable ? (
 <textarea
 value={activeCustomPage.desc || 'Type your custom rich text content here. You can outline your brand history, specials, store menu details, or staff bios.'}
 onChange={(e) => {
 const updatedPages = config.customPages.map(p => p.id === activeCustomPage.id ? { ...p, desc: e.target.value } : p);
 onUpdateConfig('customPages', null, updatedPages);
 }}
 rows={10}
 className="w-full text-sm text-rose-950 border border-pink-100 rounded-theme p-4 focus:border-pink-500 outline-none resize-y bg-transparent leading-relaxed"
 />
 ) : (
 <p className="text-sm text-rose-950 leading-relaxed whitespace-pre-wrap">{activeCustomPage.desc}</p>
 )}
 </div>
 )}
 </div>
 )}

 {/* FOOTER */}
 <footer className="pt-16 pb-8 px-6 text-emerald-100" style={{ backgroundColor: primaryColor }}>
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
 <div className="md:col-span-2">
 <div className="flex items-center gap-2 mb-6">
 <span className="font-black text-[1.4rem] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{storeName}</span>
 </div>
 <EditableText
 isEditable={isEditable}
 value={config.footer?.tagline || '100% natural, ethically sourced and handcrafted products.'}
 onChange={(val) => onUpdateConfig('footer', 'tagline', val)}
 tagName="p"
 className="leading-relaxed max-w-sm mb-6 text-pink-200/70 text-sm"
 />
 {phoneNumber && (
 <p className="flex items-center text-white font-medium">
 <FaPhoneAlt className="mr-2" style={{ color: accentColor }} /> {phoneNumber}
 </p>
 )}
 </div>
 
 <div>
 <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
 <ul className="space-y-3 text-sm text-pink-200/80">
 <li><button onClick={() => changePage('home')} className="hover:text-white transition-colors">Home</button></li>
 <li><button onClick={() => changePage('shop')} className="hover:text-white transition-colors">Shop</button></li>
 <li><button onClick={() => changePage('contact')} className="hover:text-white transition-colors">Contact</button></li>
 </ul>
 </div>
 
 <div>
 <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Newsletter</h4>
 <div className="flex">
 <input type="email" placeholder="Your email" className="bg-[#5c0e2e] text-white px-4 py-3 rounded-l-full outline-none focus:ring-1 focus:ring-pink-200 border-none flex-1 text-sm" style={{ border: 'none' }} />
 <button className="text-white px-5 py-3 rounded-r-full font-bold text-sm" style={{ backgroundColor: accentColor }}><FaPaperPlane /></button>
 </div>
 </div>
 </div>
 
 <div className="border-t border-pink-950/40 pt-8 flex flex-wrap justify-between items-center gap-4 text-pink-200/50 text-sm">
 <p>© 2026 {storeName}. All rights reserved.</p>
 
 <div className="flex gap-6 opacity-80">
 {config.trust?.badges?.secure && <span className="flex items-center"><FaShieldAlt className="mr-1" /> Secure</span>}
 {config.trust?.badges?.returns && <span className="flex items-center"><FaClock className="mr-1" /> 30 Days</span>}
 </div>

 <p>Powered by <span className="text-white font-bold">VendorBuild</span></p>
 </div>
 </div>
 </footer>

 {/* Background Customizer Modal */}
 {showBgModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-theme-surface rounded-theme max-w-xl w-full p-6 shadow-theme relative font-sans text-theme-text text-left">
 <button 
 onClick={() => setShowBgModal(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
 >
 ×
 </button>
 <h3 className="text-xl font-extrabold text-[#831843] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Hero Background Settings</h3>
 
 {/* Tabs */}
 <div className="flex border-b border-pink-100 mb-6">
 <button 
 onClick={() => setActiveTab('presets')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#EC4899] text-[#EC4899]' : 'border-transparent text-gray-400 hover:text-theme-muted'}`}
 >
 Curated Presets
 </button>
 <button 
 onClick={() => setActiveTab('ai')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#EC4899] text-[#EC4899]' : 'border-transparent text-gray-400 hover:text-theme-muted'}`}
 >
 AI Background Generator
 </button>
 </div>

 {activeTab === 'presets' ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
 {PRESETS.map((item, idx) => (
 <div 
 key={idx}
 onClick={() => {
 onUpdateConfig('header', 'heroImage', item.url);
 setShowBgModal(false);
 }}
 className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border-2 border-transparent hover:border-[#EC4899] transition-all bg-gray-100"
 >
 <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
 <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[10px] text-white font-bold leading-tight truncate">{item.name}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your background image</label>
 <textarea 
 placeholder="e.g. pastel organic leaves backdrop, soft focus cosmetic aesthetic, realistic pink bokeh"
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-pink-50/20 border border-pink-100 rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm resize-none"
 />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
 <select 
 value={aiStyle} 
 onChange={(e) => setAiStyle(e.target.value)}
 className="w-full p-3 bg-pink-50/20 border border-pink-100 rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm font-bold bg-theme-surface"
 >
 <option value="realistic">Realistic Photo</option>
 <option value="abstract">Abstract Art</option>
 <option value="watercolor">Watercolor Painting</option>
 <option value="minimalist">Minimalist Banner</option>
 <option value="3D render">3D Mockup Render</option>
 </select>
 </div>
 </div>

 <button 
 onClick={handleGenerateAiBg}
 disabled={isGenerating}
 className="w-full py-3.5 bg-[#EC4899] text-white font-bold rounded-full shadow hover:bg-[#db2777] transition-colors flex items-center justify-center gap-2"
 >
 {isGenerating ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 Generating image...
 </>
 ) : 'Generate & Apply Background'}
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Inline Product Settings Modal Overlay */}
 {isEditable && activeEditProductId && (() => {
 const product = products.find(p => (p._id || p.id) === activeEditProductId);
 if (!product) return null;
 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-pink-100">
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="absolute top-4 right-4 text-gray-400 hover:text-theme-muted font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
 >
 ×
 </button>
 <h3 className="text-xl font-extrabold text-[#500724] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
 Edit Product Settings
 </h3>
 <p className="text-xs text-theme-muted mb-6">Modify product details, upload/change local image, or delete this product.</p>

 <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
 {/* Product Name */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Product Name</label>
 <input 
 type="text"
 value={product.name}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Price */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Price (₹)</label>
 <input 
 type="number"
 value={product.price}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm"
 />
 </div>

 {/* Category */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Category</label>
 <input 
 type="text"
 value={product.category || ''}
 placeholder="e.g. Skincare, Cleanser, Serum"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm"
 />
 </div>
 </div>

 {/* Description */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Description & Target Skin Type</label>
 <textarea 
 value={product.description || ''}
 placeholder="Describe product benefits. Tip: Include terms like 'Dry Skin', 'Oily Skin', 'Sensitive' or 'Normal' so customers can filter products on the page!"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm resize-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-4 py-1.5">
 {/* Bestseller Badge */}
 <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-pink-50/20 hover:bg-pink-50/45 border border-pink-100/60 rounded-theme transition-all">
 <input 
 type="checkbox"
 checked={!!product.isBestseller}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
 className="w-4 h-4 accent-[#EC4899] cursor-pointer"
 />
 <div className="text-xs font-bold text-gray-700 select-none">
 ⭐ Mark as Bestseller
 </div>
 </label>

 {/* In Stock Toggle */}
 <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-pink-50/20 hover:bg-pink-50/45 border border-pink-100/60 rounded-theme transition-all">
 <input 
 type="checkbox"
 checked={product.inStock !== false}
 onChange={(e) => {
 const checked = e.target.checked;
 onUpdateProduct(product._id || product.id, 'inStock', checked);
 onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
 }}
 className="w-4 h-4 accent-[#EC4899] cursor-pointer"
 />
 <div className="text-xs font-bold text-gray-700 select-none">
 📦 Product In Stock
 </div>
 </label>
 </div>

 {/* Stock Quantity */}
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-1.5">Stock Quantity (Items Left)</label>
 <input 
 type="number"
 min="0"
 value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 0;
 onUpdateProduct(product._id || product.id, 'stockQuantity', val);
 onUpdateProduct(product._id || product.id, 'inStock', val > 0);
 }}
 className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-theme outline-none focus:ring-2 focus:ring-[#EC4899] text-sm font-medium"
 placeholder="Quantity in Stock"
 />
 </div>

 {/* Product Image Section */}
 <div className="p-4 border border-pink-100 rounded-theme bg-pink-50/20 space-y-3">
 <span className="block text-xs font-bold text-pink-900 uppercase">Product Image</span>
 
 <div className="flex gap-4 items-center">
 <div className="w-20 h-20 rounded-theme overflow-hidden bg-[#fce7f3] border border-pink-200 shrink-0">
 <img 
 src={getProductImageUrl(product, 0)} 
 className="w-full h-full object-cover" 
 alt="Product preview" 
 />
 </div>

 <div className="flex-1 space-y-2">
 {/* Local File Upload */}
 <div>
 <label className="inline-block px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-900 font-bold rounded-theme text-xs cursor-pointer shadow-theme transition-all text-center">
 📁 Upload Image from PC
 <input 
 type="file" 
 accept="image/*" 
 onChange={(e) => handleProductImageUpload(product._id || product.id, e)} 
 className="hidden" 
 />
 </label>
 </div>

 {/* URL input fallback */}
 <input 
 type="text" 
 value={product.img || ''} 
 placeholder="Or paste external Image URL" 
 onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
 className="w-full px-3 py-1.5 bg-[#ffffff] border border-theme-border rounded-theme text-xs outline-none focus:ring-1 focus:ring-[#EC4899]" 
 />
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-3 pt-4 border-t border-theme-border justify-between items-center">
 <button 
 onClick={() => {
 if (onDeleteProduct) {
 onDeleteProduct(product._id || product.id);
 setActiveEditProductId(null);
 } else {
 alert("Delete callback not registered.");
 }
 }}
 className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-theme-primary rounded-full font-bold text-xs shadow-theme transition-all"
 >
 Delete Product
 </button>
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="px-6 py-2.5 bg-[#500724] hover:opacity-90 text-white rounded-full font-bold text-xs shadow transition-all"
 >
 Done
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 })()}
 </div>
 );
}
