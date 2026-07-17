import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
 FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
 FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
 FaSearch, FaFilter, FaSortAmountDown, FaUtensils
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateBistro({ 
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
 const [activeFaq, setActiveFaq] = useState(null);
 const [currentPage, setCurrentPage] = useState('home');
 const [activeEditProductId, setActiveEditProductId] = useState(null);

 // Custom Bistro specific state
 const [activeCourseTab, setActiveCourseTab] = useState('All');

 // Catalog Filters State
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('All');
 const [sortBy, setSortBy] = useState('default');

 // Contact/Reservation Form State
 const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
 const [reservationDetails, setReservationDetails] = useState({ date: '', time: '', guests: '2' });
 const [formSubmitted, setFormSubmitted] = useState(false);

 // Background Editor Modal State
 const [showBgModal, setShowBgModal] = useState(false);
 const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'ai'
 const [aiPrompt, setAiPrompt] = useState('');
 const [aiStyle, setAiStyle] = useState('realistic');
 const [isGenerating, setIsGenerating] = useState(false);

 const businessName = config.navbar?.logoText || (website?.storeInfo?.businessName ?? business?.businessName ?? 'Le Bistro');
 const storeName = website?.storeName || business?.businessName || 'My Store';
 const logo = website?.storeInfo?.logo ?? business?.logo ?? null;
 const fullLogoUrl = logo ? (logo.startsWith('http') ? logo : `http://localhost:5000${logo}`) : null;
 const description = config.header.heroHeading || 'Exquisite culinary artistry and fine dining.';
 const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
 const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
 const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
 
 const primaryColor = config.theme?.primary || '#1E1E1C'; // Elegant charcoal
 const accentColor = config.theme?.accent || '#C5A880'; // Rich gold
 const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

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
 const container = document.getElementById('preview-scroll-container');
 if (container) {
 container.scrollTop = 0;
 }
 };

 const getProductImageUrl = (product, i) => {
 const imgUrl = product.img || product.imageUrl;
 if (!imgUrl) return `https://picsum.photos/seed/bistro${i}/600/600`;
 if (imgUrl.startsWith('http')) return imgUrl;
 return `http://localhost:5000${imgUrl}`;
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

 const handleContactSubmit = async (e) => {
 e.preventDefault();
 if (!contactForm.name || !contactForm.email || !contactForm.message) {
 alert('Please fill out all fields.');
 return;
 }
 const websiteId = website?._id || website?.id;
 const businessId = business?._id || business?.id || (typeof website?.businessId === 'object' ? website?.businessId?._id : website?.businessId);
 
 // Check for Reservation Details to append to Message
 let submissionMessage = contactForm.message;
 if (reservationDetails.date || reservationDetails.time) {
 submissionMessage = `RESERVATION REQUEST:\n` +
 `Date: ${reservationDetails.date || 'Not specified'}\n` +
 `Time: ${reservationDetails.time || 'Not specified'}\n` +
 `Guests: ${reservationDetails.guests} Person(s)\n` +
 `---------------------------------\n` +
 `Notes: ${contactForm.message}`;
 }

 if (!businessId || !websiteId) {
 setFormSubmitted(true);
 setContactForm({ name: '', email: '', message: '' });
 setReservationDetails({ date: '', time: '', guests: '2' });
 setTimeout(() => setFormSubmitted(false), 5000);
 return;
 }
 try {
 await axios.post(`http://localhost:5000/api/business/${businessId}/inquiries`, {
 name: contactForm.name,
 email: contactForm.email,
 message: submissionMessage,
 websiteId
 });
 setFormSubmitted(true);
 setContactForm({ name: '', email: '', message: '' });
 setReservationDetails({ date: '', time: '', guests: '2' });
 setTimeout(() => setFormSubmitted(false), 5000);
 } catch (err) {
 console.error('Failed to submit inquiry:', err);
 alert('Failed to send reservation inquiry: ' + (err.response?.data?.error || err.message));
 }
 };

 // Categories extraction
 const categoriesList = ['All', ...new Set(products.map(p => p.category || 'general'))];

 // Filtering & sorting for full catalog page
 const sortedFilteredProducts = products
 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
 .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
 .sort((a, b) => {
 if (sortBy === 'price-low') return a.price - b.price;
 if (sortBy === 'price-high') return b.price - a.price;
 if (sortBy === 'default') {
 if (a.isBestseller && !b.isBestseller) return -1;
 if (!a.isBestseller && b.isBestseller) return 1;
 }
 return 0;
 });

 // Bistro Unique Feature: Filter featured catalog items by course tab
 const activeBistroFeatured = products.filter(p => {
 if (activeCourseTab === 'All') return true;
 return (p.category || '').toLowerCase() === activeCourseTab.toLowerCase();
 });

 const bestSellers = products.filter(p => p.isBestseller);

 const defaultOrder = ['hero', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
 const order = config.sectionOrder || defaultOrder;
 const sectionsVisible = config.sections || {
 hero: true,
 products: true,
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
 <header className="relative -mt-20 pt-20 flex items-center justify-center min-h-[75vh] text-center px-8 animate-fade-in">
 <div className="absolute inset-0 z-0">
 <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
 <div className="absolute inset-0 bg-black/65"></div>
 </div>
 
 {isEditable && (
 <button 
 onClick={() => setShowBgModal(true)}
 className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-[#1E1E1C] border border-amber-300 text-white rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
 style={{ borderColor: accentColor }}
 >
 🎨 Edit Hero Background
 </button>
 )}
 <div className="relative z-10 max-w-3xl mx-auto py-16" style={{ textAlign: config.header.heroAlign }}>
 <span className="block text-xs uppercase tracking-[0.25em] mb-4 font-bold" style={{ color: accentColor }}>Fine Dining Experience</span>
 <EditableText
 isEditable={isEditable}
 value={config.header.heroHeading || storeName}
 onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
 tagName="h1"
 className="text-4xl md:text-6xl text-white mb-6 font-serif uppercase tracking-wide leading-tight"
 />
 <EditableText
 isEditable={isEditable}
 value={config.header.heroSubheading || description}
 onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
 tagName="p"
 className="text-lg text-gray-300 mb-10 max-w-lg font-light italic"
 style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}
 />
 <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
 <button 
 onClick={() => changePage('shop')}
 className="inline-block px-10 py-4 text-[#1E1E1C] rounded-none font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-opacity shadow-theme flex items-center gap-2"
 style={{ backgroundColor: accentColor }}
 >
 <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'See Our Menu'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
 <FaArrowRight />
 </button>
 </div>
 </div>
 </header>
 </SectionWrapper>
 );

 case 'products':
 return (
 <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="products" className="max-w-7xl mx-auto px-8 py-24 bg-[#1E1E1C] text-white">
 
 {/* Chef's Specials Showcase Carousel/Deck */}
 {bestSellers.length > 0 && (
 <div className="mb-24 p-8 border border-[#C5A880]/30 bg-black/40 rounded-none relative">
 <div className="absolute -top-3.5 left-8 bg-[#1E1E1C] px-4 text-xs font-serif uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
 <FaUtensils size={10} /> Chef's Signature Selection
 </div>
 <div className="grid md:grid-cols-2 gap-8 items-center">
 <div className="h-72 overflow-hidden border border-[#C5A880]/20">
 <img 
 src={getProductImageUrl(bestSellers[0], 99)} 
 alt={bestSellers[0].name} 
 className="w-full h-full object-cover"
 />
 </div>
 <div>
 <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A880] mb-2 block">Special of the House</span>
 <h3 className="text-3xl font-serif uppercase mb-4 tracking-wide">{bestSellers[0].name}</h3>
 <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">
 {bestSellers[0].description || "Savor our finest signature selection, handcrafted using premium locally-sourced ingredients to deliver an exquisite flavor profile."}
 </p>
 <div className="flex justify-between items-center">
 <span className="text-2xl font-serif text-[#C5A880]">₹{bestSellers[0].price}</span>
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add="true"
 data-product-name={bestSellers[0].name}
 data-product-price={bestSellers[0].price}
 data-product-image={getProductImageUrl(bestSellers[0], 99)}
 className="px-6 py-2.5 bg-[#C5A880] text-black font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
 >
 Book Experience
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Title */}
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionTitle || 'The Menu'}
 onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
 tagName="h2"
 className="text-4xl mb-4 font-serif uppercase tracking-widest"
 style={{ color: accentColor }}
 />
 <div className="w-16 h-0.5 mx-auto bg-[#C5A880]/40"></div>
 </div>

 {/* Bistro Unique Feature: Course selection tabs */}
 <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-[#C5A880]/20 pb-6">
 {['All', 'Appetizers', 'Main Course', 'Desserts', 'Drinks'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveCourseTab(tab)}
 className={`px-5 py-2 font-serif text-xs uppercase tracking-widest border transition-all ${
 activeCourseTab === tab 
 ? 'bg-[#C5A880] text-black border-[#C5A880]' 
 : 'border-[#C5A880]/30 text-gray-300 hover:border-[#C5A880] hover:text-white'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>
 
 <div 
 className="grid gap-8"
 style={{ 
 gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
 : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
 : `repeat(${config.products.columnsDesktop || 3}, minmax(0, 1fr))`
 }}
 >
 {activeBistroFeatured.slice(0, 6).map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-black/30 border border-white/5 group hover:border-[#C5A880]/40 transition-colors flex flex-col justify-between"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-56 overflow-hidden relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {product.isBestseller && (
 <span className="absolute top-4 left-4 px-3 py-1 bg-[#C5A880] text-black font-serif text-[10px] uppercase tracking-widest">
 Signature
 </span>
 )}
 {product.inStock === false && (
 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
 <span className="px-4 py-2 border border-red-500 text-theme-primary font-serif text-xs uppercase tracking-widest bg-red-950/20">
 Unavailable Today
 </span>
 </div>
 )}
 </div>
 <div className="p-6">
 <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] mb-2 block">{product.category || 'Entrée'}</span>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-serif uppercase tracking-wide truncate group-hover:text-[#C5A880] transition-colors"
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 <p className="text-xs text-theme-muted mt-2 font-light leading-relaxed line-clamp-2">
 {product.description || "Indulge in this beautifully presented signature dish prepared by our master chef."}
 </p>
 </div>
 </div>
 <div className="p-6 pt-0">
 <div className="flex items-center justify-between border-t border-white/5 pt-4">
 {config.products?.showPrices !== false && (
 <div className="font-serif text-lg text-[#C5A880]">
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
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add="true"
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className="px-4 py-2 bg-transparent border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-black font-serif text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#C5A880]"
 >
 Order
 </button>
 )}
 </div>
 {isEditable && (
 <button 
 onClick={() => setActiveEditProductId(product._id || product.id)}
 className="w-full mt-4 py-1.5 bg-theme-surface/5 text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-wider border border-transparent hover:border-white/10"
 >
 ⚙️ Edit Dish Parameters
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 <div className="text-center mt-16">
 <button 
 onClick={() => changePage('shop')}
 className="px-10 py-3.5 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-black font-serif text-xs uppercase tracking-widest transition-colors"
 >
 View Full Menu
 </button>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'gallery':
 const galleryTitle = config.gallery?.title || 'Inside Le Bistro';
 const galleryImages = config.gallery?.images || [];
 return (
 <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-20 bg-black/25 text-white border-t border-b border-[#C5A880]/10">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={galleryTitle}
 onChange={(val) => onUpdateConfig('gallery', 'title', val)}
 tagName="h2"
 className="text-3xl font-serif uppercase tracking-widest"
 style={{ color: accentColor }}
 />
 <div className="w-12 h-0.5 mx-auto mt-4 bg-[#C5A880]/40"></div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {galleryImages.map((img, idx) => (
 <div key={idx} className="relative aspect-square overflow-hidden group border border-white/5 bg-[#1E1E1C]">
 <img src={img} alt={`Bistro View ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 {isEditable && (
 <div className="absolute inset-0 bg-[#1E1E1C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
 className="w-full px-3 py-1.5 bg-[#1E1E1C] border border-[#C5A880]/30 text-white rounded text-xs outline-none focus:ring-1 focus:ring-amber-500"
 />
 </div>
 )}
 </div>
 ))}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'faq':
 const faqTitle = config.faq?.title || 'Reservations & Service Info';
 const faqList = config.faq?.questions || [];
 return (
 <SectionWrapper key="faq" isEditable={isEditable} sectionKey="faq" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-4xl mx-auto px-8 py-20 text-white">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={faqTitle}
 onChange={(val) => onUpdateConfig('faq', 'title', val)}
 tagName="h2"
 className="text-3xl font-serif uppercase tracking-widest"
 style={{ color: accentColor }}
 />
 <div className="w-12 h-0.5 mx-auto mt-4 bg-[#C5A880]/40"></div>
 </div>
 <div className="space-y-4">
 {faqList.map((item, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <div key={item.id || idx} className="bg-black/20 border border-white/5 overflow-hidden transition-all">
 <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-serif uppercase tracking-wider text-gray-250 flex items-center justify-between hover:bg-theme-surface/5 transition-colors">
 <EditableText
 isEditable={isEditable}
 value={item.q}
 onChange={(val) => {
 const updated = [...faqList];
 updated[idx].q = val;
 onUpdateConfig('faq', 'questions', updated);
 }}
 tagName="span"
 className="text-sm font-medium"
 />
 <span className="text-[#C5A880] text-lg font-light">{isOpen ? '—' : '+'}</span>
 </button>
 {isOpen && (
 <div className="px-6 pb-5 pt-1 text-xs text-gray-400 font-light leading-relaxed border-t border-white/5">
 <EditableText
 isEditable={isEditable}
 value={item.a}
 onChange={(val) => {
 const updated = [...faqList];
 updated[idx].a = val;
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
 const testTitle = config.testimonials?.title || 'Guest Experiences';
 const testList = config.testimonials?.items || [];
 return (
 <SectionWrapper key="testimonials" isEditable={isEditable} sectionKey="testimonials" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="bg-black/35 py-24 text-white">
 <div className="max-w-7xl mx-auto px-8">
 <div className="text-center mb-16">
 <EditableText
 isEditable={isEditable}
 value={testTitle}
 onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
 tagName="h2"
 className="text-3xl font-serif uppercase tracking-widest"
 style={{ color: accentColor }}
 />
 <div className="w-12 h-0.5 mx-auto mt-4 bg-[#C5A880]/40"></div>
 </div>
 <div className="grid md:grid-cols-3 gap-8">
 {testList.map((item, idx) => (
 <div key={idx} className="p-8 border border-white/5 bg-[#1E1E1C] relative text-center flex flex-col justify-between">
 <div className="text-[#C5A880] text-4xl font-serif leading-none mb-6">“</div>
 <EditableText
 isEditable={isEditable}
 value={item.text}
 onChange={(val) => {
 const updated = [...testList];
 updated[idx].text = val;
 onUpdateConfig('testimonials', 'items', updated);
 }}
 tagName="p"
 className="text-sm font-light italic leading-relaxed text-gray-300"
 />
 <div className="mt-8 border-t border-white/5 pt-6">
 <EditableText
 isEditable={isEditable}
 value={item.author}
 onChange={(val) => {
 const updated = [...testList];
 updated[idx].author = val;
 onUpdateConfig('testimonials', 'items', updated);
 }}
 tagName="h5"
 className="font-serif text-xs uppercase tracking-wider text-[#C5A880]"
 />
 <EditableText
 isEditable={isEditable}
 value={item.role || 'Fine Dining Patron'}
 onChange={(val) => {
 const updated = [...testList];
 updated[idx].role = val;
 onUpdateConfig('testimonials', 'items', updated);
 }}
 tagName="span"
 className="text-[10px] text-theme-muted tracking-wide font-light"
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
 const hoursTitle = config.hours?.title || 'Hours of Operation';
 const hoursDays = config.hours?.days || [];
 return (
 <SectionWrapper key="hours" isEditable={isEditable} sectionKey="hours" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-xl mx-auto px-8 py-20 text-white text-center">
 <div className="text-center mb-8">
 <EditableText
 isEditable={isEditable}
 value={hoursTitle}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="h2"
 className="text-2xl font-serif uppercase tracking-widest"
 style={{ color: accentColor }}
 />
 <div className="w-12 h-0.5 mx-auto mt-4 bg-[#C5A880]/40"></div>
 </div>
 <div className="divide-y divide-[#C5A880]/10 border-t border-b border-[#C5A880]/10 py-4">
 {hoursDays.map((item, idx) => (
 <div key={idx} className="flex justify-between py-3.5 text-sm font-light">
 <span className="text-gray-400 font-serif tracking-wider uppercase">{item.day}</span>
 <span className="font-semibold text-white tracking-widest">{item.hours}</span>
 </div>
 ))}
 </div>
 </section>
 </SectionWrapper>
 );

 case 'contact':
 const contactTitle = config.contact?.title || 'Table Reservation';
 const contactSubtitle = config.contact?.subtitle || 'Reserve your fine dining table experience below.';
 return (
 <SectionWrapper key="contact" isEditable={isEditable} sectionKey="contact" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="contact" className="max-w-4xl mx-auto px-8 py-24 text-white">
 <div className="grid md:grid-cols-2 gap-16 items-start">
 <div className="space-y-8">
 <div>
 <EditableText
 isEditable={isEditable}
 value={contactTitle}
 onChange={(val) => onUpdateConfig('contact', 'title', val)}
 tagName="h2"
 className="text-3xl font-serif uppercase tracking-widest mb-4"
 style={{ color: accentColor }}
 />
 <EditableText
 isEditable={isEditable}
 value={contactSubtitle}
 onChange={(val) => onUpdateConfig('contact', 'subtitle', val)}
 tagName="p"
 className="text-sm text-gray-400 font-light"
 />
 </div>
 <div className="space-y-4 text-sm font-light text-gray-300">
 {phoneNumber && (
 <div className="flex items-center gap-4">
 <FaPhoneAlt className="text-[#C5A880]" />
 <span>{phoneNumber}</span>
 </div>
 )}
 {email && (
 <div className="flex items-center gap-4">
 <FaEnvelope className="text-[#C5A880]" />
 <span>{email}</span>
 </div>
 )}
 {address && (
 <div className="flex items-center gap-4">
 <FaMapMarkerAlt className="text-[#C5A880]" />
 <span>{address}</span>
 </div>
 )}
 </div>
 </div>

 <div className="bg-[#1E1E1C] p-8 border border-[#C5A880]/20 rounded-none shadow-theme relative">
 {formSubmitted ? (
 <div className="text-center py-12 text-[#C5A880] space-y-4">
 <FaPaperPlane size={36} className="mx-auto" />
 <h4 className="text-xl font-serif uppercase tracking-widest">Reservation Sent</h4>
 <p className="text-xs text-gray-400 font-light">We will send a confirmation details summary to your email address.</p>
 </div>
 ) : (
 <form onSubmit={handleContactSubmit} className="space-y-5">
 <h4 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] border-b border-[#C5A880]/10 pb-3 mb-6">Inquiry & Reservation Form</h4>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Guests Limit</label>
 <select 
 value={reservationDetails.guests}
 onChange={(e) => setReservationDetails({...reservationDetails, guests: e.target.value})}
 className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880] font-serif"
 >
 <option value="1" className="bg-[#1E1E1C]">1 Guest</option>
 <option value="2" className="bg-[#1E1E1C]">2 Guests</option>
 <option value="4" className="bg-[#1E1E1C]">4 Guests</option>
 <option value="6" className="bg-[#1E1E1C]">6 Guests</option>
 <option value="8" className="bg-[#1E1E1C]">8+ Guests (Event)</option>
 </select>
 </div>

 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Desired Date</label>
 <input 
 type="date"
 value={reservationDetails.date}
 onChange={(e) => setReservationDetails({...reservationDetails, date: e.target.value})}
 className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880]"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4">
 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Preferred Time</label>
 <input 
 type="time"
 value={reservationDetails.time}
 onChange={(e) => setReservationDetails({...reservationDetails, time: e.target.value})}
 className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880]"
 />
 </div>
 </div>

 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Your Name</label>
 <input 
 type="text"
 required
 value={contactForm.name}
 onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
 placeholder="e.g. John Doe"
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880]"
 />
 </div>

 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Email Address</label>
 <input 
 type="email"
 required
 value={contactForm.email}
 onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
 placeholder="e.g. john@example.com"
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880]"
 />
 </div>

 <div>
 <label className="block text-[9px] uppercase tracking-widest text-theme-muted mb-1.5">Special Notes / Requests</label>
 <textarea 
 rows={3}
 required
 value={contactForm.message}
 onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
 placeholder="Please note dietary constraints, allergic considerations, etc."
 className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880] resize-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full py-3.5 bg-[#C5A880] text-black font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity"
 >
 Request Table Booking
 </button>
 </form>
 )}
 </div>
 </div>
 </section>
 </SectionWrapper>
 );

 default:
 return null;
 }
 };

 if (currentPage === 'shop') {
 return (
 <div 
 id="preview-scroll-container"
 className="w-full h-full overflow-y-auto relative bg-[#1E1E1C] text-white flex flex-col justify-between font-sans"
 >
 {/* Simple Header */}
 <nav className="py-6 px-8 border-b border-[#C5A880]/10 flex items-center justify-between">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-xl uppercase tracking-wider text-[#C5A880] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-xl uppercase tracking-wider text-[#C5A880]">
 {businessName}
 </button>
 )}
 <button 
 onClick={() => changePage('home')}
 className="text-xs uppercase tracking-widest hover:text-[#C5A880] font-serif border border-[#C5A880]/30 px-4 py-2 transition-all"
 >
 ← Back To Restaurant
 </button>
 </nav>

 {/* Content */}
 <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
 <div className="text-center mb-16">
 <h1 className="text-4xl font-serif uppercase tracking-widest text-[#C5A880]">The Gastronomic Menu</h1>
 <p className="text-xs text-gray-400 mt-2 font-light italic">Explore our complete collection of seasonal dishes, crafted by culinary experts.</p>
 </div>

 {/* Search, Filter & Sort */}
 <div className="bg-black/35 p-6 border border-white/5 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative w-full md:max-w-xs">
 <input 
 type="text" 
 placeholder="Search menu..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/10 rounded-none text-xs text-white outline-none focus:border-[#C5A880]"
 />
 <FaSearch className="absolute left-3.5 top-3 text-gray-550" size={10} />
 </div>

 <div className="flex gap-4 w-full md:w-auto">
 <select 
 value={selectedCategory} 
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="px-3 py-2 bg-black/30 border border-white/10 text-xs text-white rounded-none outline-none focus:border-[#C5A880] font-serif uppercase tracking-widest shrink-0"
 >
 {categoriesList.map(cat => (
 <option key={cat} value={cat} className="bg-[#1E1E1C]">{cat}</option>
 ))}
 </select>

 <select 
 value={sortBy} 
 onChange={(e) => setSortBy(e.target.value)}
 className="w-full md:w-auto px-3 py-2 bg-black/30 border border-white/10 text-xs text-white rounded-none outline-none focus:border-[#C5A880] font-serif uppercase tracking-widest"
 >
 <option value="default" className="bg-[#1E1E1C]">Featured List</option>
 <option value="price-low" className="bg-[#1E1E1C]">Price: Low to High</option>
 <option value="price-high" className="bg-[#1E1E1C]">Price: High to Low</option>
 </select>
 </div>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
 {sortedFilteredProducts.map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-black/20 border border-white/5 hover:border-[#C5A880]/30 group flex flex-col justify-between"
 style={{
 '--primary': primaryColor,
 '--accent': accentColor, borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-56 overflow-hidden relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 {product.isBestseller && (
 <span className="absolute top-4 left-4 px-3 py-1 bg-[#C5A880] text-black font-serif text-[10px] uppercase tracking-widest">
 Chef's Recommendation
 </span>
 )}
 {product.inStock === false && (
 <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
 <span className="px-4 py-2 border border-red-500 text-theme-primary font-serif text-xs uppercase tracking-widest bg-red-950/20">
 Unavailable
 </span>
 </div>
 )}
 </div>
 <div className="p-6">
 <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] mb-2 block">{product.category || 'Dishes'}</span>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-serif uppercase tracking-wide truncate group-hover:text-[#C5A880] transition-colors"
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 <p className="text-xs text-theme-muted mt-2 font-light leading-relaxed">
 {product.description || "Indulge in this beautifully presented signature dish prepared by our master chef."}
 </p>
 </div>
 </div>
 <div className="p-6 pt-0">
 <div className="flex items-center justify-between border-t border-white/5 pt-4">
 {config.products?.showPrices !== false && (
 <div className="font-serif text-lg text-[#C5A880]">
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
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add="true"
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className="px-4 py-2 bg-transparent border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-black font-serif text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
 >
 Add To Order
 </button>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 </main>

 {/* Simple Footer */}
 <footer className="py-8 text-center text-xs text-theme-muted border-t border-white/5 bg-black/20">
 <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
 </footer>
 </div>
 );
 }

 return (
 <div 
 id="preview-scroll-container"
 className="w-full h-full overflow-y-auto relative bg-[#1E1E1C] flex flex-col justify-between font-sans text-gray-200"
 >
 {/* Navigation */}
 <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 px-8 ${scrolled ? 'bg-[#1E1E1C]/95 border-b border-[#C5A880]/10 shadow-theme' : 'bg-transparent'}`}>
 <div className="max-w-7xl mx-auto flex items-center justify-between">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-serif text-2xl uppercase tracking-widest text-[#C5A880] cursor-text"
 />
 ) : (
 <button onClick={() => changePage('home')} className="font-serif text-2xl uppercase tracking-widest text-[#C5A880] focus:outline-none">
 {businessName}
 </button>
 )}
 
 <div className="flex items-center gap-6">
 <button 
 onClick={() => changePage('shop')} 
 className="px-5 py-2 border border-[#C5A880] hover:bg-[#C5A880] hover:text-black text-xs font-serif uppercase tracking-widest text-[#C5A880] transition-colors"
 >
 Order Online
 </button>
 </div>
 </div>
 </nav>

 {/* Main Sections */}
 <div className="flex-1">
 {order.map((sectionKey) => renderSection(sectionKey))}
 </div>

 {/* Footer */}
 <footer className="bg-black/60 py-12 px-8 border-t border-[#C5A880]/10 text-center text-xs text-theme-muted font-light">
 <div className="max-w-7xl mx-auto space-y-4">
 <p className="font-serif text-[#C5A880] uppercase tracking-widest text-sm">{businessName}</p>
 <p>© {new Date().getFullYear()} {businessName}. All Culinary Delights Reserved.</p>
 </div>
 </footer>

 {/* Dish Parameter Editor Modal */}
 {isEditable && activeEditProductId && (() => {
 const product = products.find(p => (p._id || p.id) === activeEditProductId);
 if (!product) return null;
 return (
 <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-[#1E1E1C] rounded-none max-w-lg w-full p-6 border border-[#C5A880]/40 shadow-theme relative text-left">
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
 >
 ×
 </button>
 
 <h3 className="text-xl font-serif uppercase tracking-wider text-[#C5A880] border-b border-[#C5A880]/20 pb-3 mb-6">
 Dish Settings & Parameters
 </h3>

 <div className="space-y-4 font-sans text-xs text-gray-300">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Dish Name</label>
 <input 
 type="text"
 value={product.name}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#C5A880]"
 />
 </div>

 <div>
 <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Price (₹)</label>
 <input 
 type="number"
 value={product.price}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#C5A880]"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4">
 <div>
 <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Course / Category</label>
 <input 
 type="text"
 value={product.category || ''}
 placeholder="e.g. Appetizers, Main Course, Desserts, Drinks"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#C5A880]"
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Ingredients & Details</label>
 <textarea 
 value={product.description || ''}
 placeholder="Provide menu description, ingredient listings, allergy info."
 onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#C5A880] resize-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-4 py-1.5">
 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-white/10 bg-black/20 transition-all">
 <input 
 type="checkbox"
 checked={!!product.isBestseller}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
 className="w-4 h-4 accent-[#C5A880] cursor-pointer"
 />
 <div className="text-[10px] font-serif uppercase tracking-widest text-[#C5A880] select-none">
 ⭐ Chef's Signature
 </div>
 </label>

 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-white/10 bg-black/20 transition-all">
 <input 
 type="checkbox"
 checked={product.inStock !== false}
 onChange={(e) => {
 const checked = e.target.checked;
 onUpdateProduct(product._id || product.id, 'inStock', checked);
 onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
 }}
 className="w-4 h-4 accent-[#C5A880] cursor-pointer"
 />
 <div className="text-[10px] font-serif uppercase tracking-widest text-white select-none">
 📦 Available Today
 </div>
 </label>
 </div>

 {/* Daily Portions */}
 <div>
 <label className="block text-[10px] uppercase tracking-wider text-theme-muted mb-1.5">Daily Portions Available</label>
 <input 
 type="number"
 min="0"
 value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 0;
 onUpdateProduct(product._id || product.id, 'stockQuantity', val);
 onUpdateProduct(product._id || product.id, 'inStock', val > 0);
 }}
 className="w-full px-4 py-2.5 bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#C5A880]"
 placeholder="Daily portions"
 />
 </div>

 {/* Presentation Image */}
 <div className="p-4 border border-white/10 bg-black/25 space-y-3">
 <span className="block text-[10px] uppercase tracking-wider text-theme-muted">Dish Presentation Image</span>
 <div className="flex gap-4 items-center">
 <div className="w-20 h-20 border border-white/10 shrink-0">
 <img 
 src={getProductImageUrl(product, 0)} 
 className="w-full h-full object-cover" 
 alt="Product preview" 
 />
 </div>
 <div className="flex-1 space-y-2">
 <div>
 <label className="inline-block px-4 py-2 bg-theme-surface/5 border border-white/10 hover:bg-theme-surface/10 text-white font-bold rounded-none text-xs cursor-pointer shadow-theme transition-all text-center">
 📁 Upload Image
 <input 
 type="file" 
 accept="image/*" 
 onChange={(e) => handleProductImageUpload(product._id || product.id, e)} 
 className="hidden" 
 />
 </label>
 </div>
 <input 
 type="text" 
 value={product.img || ''} 
 placeholder="Paste image link" 
 onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
 className="w-full px-3 py-1.5 bg-black/30 border border-white/10 text-xs text-white outline-none focus:border-[#C5A880]" 
 />
 </div>
 </div>
 </div>

 <div className="flex gap-3 pt-4 border-t border-white/5 justify-between items-center">
 <button 
 onClick={() => {
 if (onDeleteProduct) {
 onDeleteProduct(product._id || product.id);
 setActiveEditProductId(null);
 } else {
 alert("Delete callback not registered.");
 }
 }}
 className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900 rounded-none font-serif text-[10px] uppercase tracking-wider"
 >
 Delete Dish
 </button>
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="px-6 py-2.5 text-black font-bold uppercase tracking-wider text-xs shadow transition-all"
 style={{ backgroundColor: accentColor }}
 >
 Done
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 })()}

 {/* Background Editor Modal */}
 {showBgModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-[#1E1E1C] rounded-none max-w-lg w-full p-6 shadow-theme border border-[#C5A880]/30 relative text-left">
 <button 
 onClick={() => setShowBgModal(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl w-8 h-8 flex items-center justify-center"
 >
 ×
 </button>
 <h3 className="text-xl font-serif uppercase tracking-widest text-[#C5A880] mb-1">
 Bistro Background Settings
 </h3>
 <p className="text-xs text-theme-muted mb-6">Select a fine dining preset or generate using AI.</p>

 <div className="flex border-b border-white/10 mb-6 font-semibold">
 <button 
 onClick={() => setActiveTab('presets')}
 className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
 >
 Presets
 </button>
 <button 
 onClick={() => setActiveTab('ai')}
 className={`flex-1 py-2 font-bold text-xs uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-theme-muted hover:text-gray-400'}`}
 >
 AI Generator
 </button>
 </div>

 {activeTab === 'presets' ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
 {[
 { name: 'Elegant Restaurant Table', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Fine Dining Plate Selection', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Chef Preparing Dish', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Candlelit Bistro Dining', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Elegant Bar & Lounge', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Exquisite Gourmet Plate', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80' }
 ].map((item, idx) => (
 <div 
 key={idx}
 onClick={() => {
 onUpdateConfig('header', 'heroImage', item.url);
 setShowBgModal(false);
 }}
 className="cursor-pointer group relative aspect-video border border-white/5 hover:border-[#C5A880] transition-all bg-black"
 >
 <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
 <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[9px] text-white font-serif uppercase tracking-wider truncate">{item.name}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-4 font-sans">
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your dining backdrop</label>
 <textarea 
 placeholder="e.g. elegant restaurant interior with mood lighting, gold decorations and white table cloth"
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-[#C5A880] text-sm text-white resize-none"
 />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
 <select 
 value={aiStyle} 
 onChange={(e) => setAiStyle(e.target.value)}
 className="w-full p-3 bg-black/30 border border-white/10 rounded-none outline-none focus:border-[#C5A880] text-sm text-white"
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
 className="w-full py-3.5 hover:opacity-90 text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
 style={{ backgroundColor: accentColor }}
 >
 {isGenerating ? (
 <>
 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
 Generating...
 </>
 ) : 'Generate & Apply'}
 </button>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
