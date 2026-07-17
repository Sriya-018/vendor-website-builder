import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
 FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
 FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
 FaSearch, FaFilter, FaSortAmountDown, FaShoppingBag
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateVogue({ 
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
 const [activeSizeGuideProduct, setActiveSizeGuideProduct] = useState(null);

 // Catalog Filters State
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('All');
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
 const description = config.header.heroHeading || 'Curated fashion for the bold.';
 const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
 const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
 const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
 
 const primaryColor = config.theme?.primary || '#000000'; 
 const accentColor = config.theme?.accent || '#6B7280'; // Gray 500
 const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';

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
 if (!imgUrl) return `https://picsum.photos/seed/fashionvogue${i}/600/600`;
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
 
 if (!businessId || !websiteId) {
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

 // Categories extraction
 const categoriesList = ['All', ...new Set(products.map(p => p.category || 'general'))];

 // Filtering & sorting
 const sortedFilteredProducts = products
 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
 .filter(p => selectedCategory === 'All' || (p.category || 'general') === selectedCategory)
 .sort((a, b) => {
 if (sortBy === 'price-low') return a.price - b.price;
 if (sortBy === 'price-high') return b.price - a.price;
 const orderA = a.orderCount || 0;
 const orderB = b.orderCount || 0;
 if (orderB !== orderA) return orderB - orderA;
 return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
 });

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
 <header className="relative h-[90vh] flex items-end overflow-hidden animate-fade-in">
 <div className="absolute inset-0 z-0 bg-gray-100">
 <img src={heroImage} className="w-full h-full object-cover grayscale-[20%]" alt="Hero" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
 </div>
 
 {isEditable && (
 <button 
 onClick={() => setShowBgModal(true)}
 className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface text-black border border-black uppercase tracking-widest text-[9px] font-bold shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
 >
 🎨 Edit Hero Background
 </button>
 )}
 <div className="relative z-10 max-w-7xl mx-auto px-8 w-full pb-16" style={{ textAlign: config.header.heroAlign }}>
 <div className="max-w-2xl" style={{ marginInline: config.header.heroAlign === 'center' ? 'auto' : config.header.heroAlign === 'right' ? '0 0 0 auto' : '0' }}>
 <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-white/65 mb-3">New Season</p>
 <EditableText
 isEditable={isEditable}
 value={config.header.heroHeading || description}
 onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
 tagName="h1"
 className="text-5xl md:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-[-0.02em]"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
 <button 
 onClick={() => changePage('shop')}
 className="inline-flex items-center gap-2 px-8 py-3.5 bg-theme-surface text-black font-bold text-[0.85rem] tracking-[0.08em] uppercase hover:bg-gray-100 transition-colors"
 >
 <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Shop Collection'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
 <FaArrowRight />
 </button>
 </div>
 </div>
 </div>
 </header>
 </SectionWrapper>
 );

 case 'products':
 return (
 <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="collection" className="py-16">
 <div className="max-w-7xl mx-auto px-8 mb-8 border-b border-gray-250 pb-4 flex items-center justify-between">
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionTitle || 'The Collection'}
 onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
 tagName="h2"
 className="text-[1.75rem] font-semibold"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <span className="text-[0.8rem] text-theme-muted">{products.length} pieces</span>
 </div>
 
 <div className="max-w-7xl mx-auto px-8">
 <div 
 className="grid gap-[1px] bg-gray-200 border border-theme-border"
 style={{ 
 gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
 : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
 : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
 }}
 >
 {products.slice(0, 4).map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-theme-surface border-b-2 border-transparent hover:border-black transition-colors group relative flex flex-col justify-between"
 >
 <div>
 <div className="h-[300px] overflow-hidden bg-gray-100 relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-theme-border hover:bg-black hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-5">
 <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1.5 text-theme-muted">
 {product.category || 'Apparel'}
 </div>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-[1.05rem] font-semibold mb-2 truncate tracking-[0.02em]"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 {product.sizes && product.sizes.length > 0 && (
 <div className="flex gap-1 mb-2 flex-wrap justify-start">
 {product.sizes.map(sz => (
 <span key={sz} className="text-[8px] font-bold border border-theme-border px-1 py-0.5 rounded bg-theme-bg text-gray-400 uppercase">
 {sz}
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 <div className="p-5 pt-0">
 <div className="flex items-center justify-between">
 {config.products?.showPrices !== false && (
 <div className="font-bold text-[1.1rem] flex items-center gap-0.5">
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
 <div className="flex flex-col items-end gap-1.5">
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`px-3.5 py-1.5 text-[0.78rem] font-bold tracking-[0.05em] uppercase transition-all border ${
 product.inStock === false 
 ? 'opacity-65 cursor-not-allowed bg-gray-200 text-gray-400 border-theme-border' 
 : 'bg-black text-white hover:bg-gray-800 border-black'
 }`}
 >
 {product.inStock === false ? 'Out' : 'Add to Bag'}
 </button>
 )}
 {product.sizes && product.sizes.length > 0 && (
 <button 
 onClick={() => setActiveSizeGuideProduct(product)}
 className="text-[9px] font-semibold text-gray-400 hover:text-black transition-colors underline"
 >
 Size Guide
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="text-center mt-12">
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-3 bg-black text-white hover:bg-neutral-800 tracking-[0.1em] font-extrabold uppercase text-xs transition-colors"
 >
 View Entire Collection
 </button>
 </div>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'gallery':
 const galleryTitle = config.gallery?.title || 'Our Photo Gallery';
 const galleryImages = config.gallery?.images || [];
 return (
 <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-20 border-t border-b border-theme-border">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={galleryTitle}
 onChange={(val) => onUpdateConfig('gallery', 'title', val)}
 tagName="h2"
 className="text-2xl font-bold tracking-[0.08em] uppercase"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="w-16 h-px bg-black mx-auto mt-3"></div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-gray-200 border border-gray-250">
 {galleryImages.map((img, idx) => (
 <div key={idx} className="relative aspect-square overflow-hidden group bg-theme-surface">
 <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-550" />
 {isEditable && (
 <div className="absolute inset-0 bg-theme-surface/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 border border-black">
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
 className="w-full px-3 py-1.5 bg-black text-white rounded-none text-xs outline-none uppercase font-mono tracking-widest text-center"
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
 className="text-3xl font-semibold"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="w-16 h-px bg-black mx-auto mt-3"></div>
 </div>
 <div className="space-y-4">
 {faqList.map((item, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <div key={item.id || idx} className="bg-theme-surface border-b border-black rounded-none overflow-hidden shadow-none transition-all">
 <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full py-4 text-left font-bold text-black flex items-center justify-between hover:bg-theme-bg/50 transition-colors uppercase tracking-[0.05em] text-xs">
 <EditableText
 isEditable={isEditable}
 value={item.question}
 onChange={(val) => {
 const updated = faqList.map(q => q.id === item.id ? { ...q, question: val } : q);
 onUpdateConfig('faq', 'questions', updated);
 }}
 tagName="span"
 className="flex-1 mr-4 font-extrabold"
 />
 <span className="text-xl">{isOpen ? '−' : '+'}</span>
 </button>
 {isOpen && (
 <div className="py-4 text-theme-muted leading-relaxed text-sm">
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
 <section className="bg-theme-bg border-t border-b border-theme-border py-20 px-8">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={testimonialTitle}
 onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
 tagName="h2"
 className="text-3xl font-semibold"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="w-16 h-px bg-black mx-auto mt-3"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {testimonialList.map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface rounded-none p-6 shadow-none border border-theme-border flex flex-col justify-between">
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
 className={`text-lg transition-colors ${starIdx < item.rating ? 'text-black' : 'text-gray-200'}`}
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
 className="text-theme-muted text-sm italic leading-relaxed mb-6"
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
 className="font-bold text-black text-sm uppercase tracking-[0.05em]"
 />
 <EditableText
 isEditable={isEditable}
 value={item.role}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="span"
 className="text-gray-400 text-xs font-semibold block mt-0.5 tracking-wider uppercase"
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
 <section className="py-20 px-8 bg-theme-surface">
 <div className="max-w-2xl mx-auto bg-theme-bg border border-gray-250 rounded-none p-8 md:p-12 shadow-none">
 <div className="text-center mb-8">
 <EditableText
 isEditable={isEditable}
 value={hoursTitle}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="h3"
 className="text-2xl font-bold"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="w-16 h-px bg-black mx-auto mt-3"></div>
 </div>
 <div className="space-y-4">
 {hoursDays.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-gray-250 pb-3 last:border-b-0 last:pb-0 font-medium text-xs tracking-wider uppercase">
 <span className="text-theme-muted">{item.day}</span>
 <EditableText
 isEditable={isEditable}
 value={item.hours}
 onChange={(val) => {
 const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-black"
 />
 </div>
 ))}
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
 <section className="w-full py-12 px-8 text-white text-center relative overflow-hidden bg-black">
 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="text-left md:max-w-md">
 <EditableText
 isEditable={isEditable}
 value={countdownTitle}
 onChange={(val) => onUpdateConfig('countdown', 'title', val)}
 tagName="h3"
 className="text-2xl md:text-3xl font-extrabold mb-2 uppercase tracking-[0.05em]"
 />
 <p className="text-gray-400 text-sm">Hurry up! Take advantage of our exclusive offers before the timer hits zero.</p>
 </div>
 
 <div className="flex gap-4">
 {[
 { label: 'Days', val: timeLeft.days },
 { label: 'Hours', val: timeLeft.hours },
 { label: 'Min', val: timeLeft.minutes },
 { label: 'Sec', val: timeLeft.seconds }
 ].map((col, idx) => (
 <div key={idx} className="flex flex-col items-center bg-[#222] px-4 py-3 rounded-none min-w-[70px] border border-neutral-800 shadow-none">
 <span className="text-2xl font-black text-white">{String(col.val).padStart(2, '0')}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-1">{col.label}</span>
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
 <section id="contact" className="bg-theme-bg py-16 px-8 text-center border-t border-theme-border mt-8">
 <h3 className="text-[2rem] font-bold mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>Contact & Stockists</h3>
 <div className="inline-block text-left min-w-[280px] leading-[2.2] text-gray-700">
 <div className="space-y-4">
 {phoneNumber && (
 <p className="flex items-center gap-3">
 <FaPhoneAlt style={{ color: accentColor }} />
 <span className="font-bold text-black">{phoneNumber}</span>
 </p>
 )}
 {email && (
 <p className="flex items-center gap-3">
 <FaEnvelope style={{ color: accentColor }} />
 <span className="font-bold text-black">{email}</span>
 </p>
 )}
 {address && (
 <p className="flex items-center gap-3">
 <FaMapMarkerAlt style={{ color: accentColor }} />
 <span className="font-bold text-black">{address}</span>
 </p>
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

 return (
 <div 
 id="preview-scroll-container"
 className="w-full h-full overflow-y-auto relative"
 style={{
 '--primary': primaryColor,
 '--accent': accentColor,
 backgroundColor: '#ffffff',
 color: '#000000',
 fontFamily: "'DM Sans', sans-serif",
 fontSize: 'var(--base-size)',
 lineHeight: 'var(--line-height)',
 letterSpacing: 'var(--letter-spacing)'
 }}
 >
 {/* TOP BAR */}
 <div className="bg-black text-white text-center py-2 text-[0.75rem] tracking-[0.1em] uppercase">
 Free shipping on orders over ₹2000
 </div>

 {/* NAV */}
 <nav className="sticky top-0 z-50 bg-theme-surface border-b-2 border-black transition-all px-8">
 <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-bold text-[1.8rem] tracking-[-0.02em] cursor-text"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-bold text-[1.8rem] tracking-[-0.02em] text-left focus:outline-none hover:opacity-85"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 >
 {businessName}
 </button>
 )}
 {devicePreview === 'desktop' && (
 <div className="flex gap-10 text-[0.8rem] font-medium tracking-[0.08em] uppercase">
 {['Home', 'Shop', 'Contact'].map(page => (
 <button 
 key={page} 
 onClick={() => changePage(page.toLowerCase())}
 className={`font-semibold hover:opacity-100 transition-opacity ${currentPage === page.toLowerCase() ? 'opacity-100 border-b border-black pb-0.5 font-bold' : 'opacity-55'}`}
 >
 {page}
 </button>
 ))}
 </div>
 )}
 </div>
 </nav>

 {/* RENDER ACTIVE PAGE CONTENT */}
 {currentPage === 'home' && (
 <div className="animate-fade-in">
 {order.map(key => renderSection(key))}
 </div>
 )}

 {currentPage === 'shop' && (
 <div className="max-w-7xl mx-auto px-8 py-24 animate-fade-in">
 {/* Catalog Filters Header */}
 <div className="bg-theme-surface border-b-2 border-black p-8 mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
 <div>
 <h2 className="text-4xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>The Catalog</h2>
 <p className="text-theme-muted text-sm mt-1">Browse our seasonal fashion collections</p>
 </div>
 
 <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-xl md:justify-end">
 {/* Search */}
 <div className="relative flex-1">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
 <input 
 type="text" 
 placeholder="Search catalog..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-theme-bg border border-neutral-300 rounded-none outline-none focus:border-black text-sm transition-all"
 />
 </div>

 {/* Sorting */}
 <div className="relative">
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="pl-4 pr-10 py-3 bg-theme-bg border border-neutral-300 rounded-none outline-none focus:border-black text-sm cursor-pointer appearance-none uppercase font-bold tracking-widest text-black"
 >
 <option value="default">Popularity</option>
 <option value="price-low">Price: Low-High</option>
 <option value="price-high">Price: High-Low</option>
 </select>
 <FaSortAmountDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Categories Filter Row */}
 <div className="flex flex-wrap gap-2 mb-10">
 {categoriesList.map(cat => (
 <button 
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-black text-white' : 'bg-theme-surface border border-theme-border text-black hover:border-black'}`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Catalog Grid */}
 {sortedFilteredProducts.length === 0 ? (
 <div className="text-center py-20 bg-theme-surface border border-theme-border">
 <div className="text-4xl mb-3">🔍</div>
 <h3 className="font-bold text-black text-lg uppercase tracking-wider" style={{ fontFamily: "'Bodoni Moda', serif" }}>No pieces found</h3>
 <p className="text-theme-muted text-sm mt-1">Try another search keyword or category category</p>
 </div>
 ) : (
 <div 
 className="grid gap-[1px] bg-gray-200 border border-theme-border"
 style={{ 
 gridTemplateColumns: devicePreview === 'mobile' ? `repeat(${config.products.columnsMobile || 1}, minmax(0, 1fr))` 
 : devicePreview === 'tablet' ? 'repeat(2, minmax(0, 1fr))' 
 : `repeat(${config.products.columnsDesktop || 4}, minmax(0, 1fr))`
 }}
 >
 {sortedFilteredProducts.map((product, i) => (
 <div 
 key={product._id || product.id || i}
 className="bg-theme-surface border-b-2 border-transparent hover:border-black transition-colors group relative flex flex-col justify-between animate-fade-in"
 >
 <div>
 <div className="h-[300px] overflow-hidden bg-gray-100 relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 backdrop-blur border border-theme-border hover:bg-black hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-5">
 <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1.5 text-theme-muted">
 {product.category || 'Apparel'}
 </div>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-[1.05rem] font-semibold mb-2 truncate tracking-[0.02em]"
 style={{ fontFamily: "'Bodoni Moda', serif" }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 {product.sizes && product.sizes.length > 0 && (
 <div className="flex gap-1 mb-2 flex-wrap justify-start">
 {product.sizes.map(sz => (
 <span key={sz} className="text-[8px] font-bold border border-theme-border px-1 py-0.5 rounded bg-theme-bg text-theme-muted uppercase">
 {sz}
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 <div className="p-5 pt-0">
 <div className="flex items-center justify-between">
 {config.products?.showPrices !== false && (
 <div className="font-bold text-[1.1rem] flex items-center gap-0.5">
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
 <div className="flex flex-col items-end gap-1.5">
 {config.products?.showAddToCart !== false && (
 <button 
 data-cart-add={product.inStock !== false ? "true" : undefined}
 data-product-id={product._id || product.id}
 data-product-name={product.name}
 data-product-price={product.price}
 data-product-image={getProductImageUrl(product, i)}
 disabled={product.inStock === false}
 className={`px-3.5 py-1.5 text-[0.78rem] font-bold tracking-[0.05em] uppercase transition-all border ${
 product.inStock === false 
 ? 'opacity-65 cursor-not-allowed bg-gray-200 text-gray-400 border-theme-border' 
 : 'bg-black text-white hover:bg-gray-800 border-black'
 }`}
 >
 {product.inStock === false ? 'Out' : 'Add to Bag'}
 </button>
 )}
 {product.sizes && product.sizes.length > 0 && (
 <button 
 onClick={() => setActiveSizeGuideProduct(product)}
 className="text-[9px] font-semibold text-gray-400 hover:text-black transition-colors underline"
 >
 Size Guide
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}

 {isEditable && (
 <div 
 onClick={onAddProduct}
 className="bg-theme-surface border-2 border-dashed border-theme-border rounded-none p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition-all duration-300 min-h-[300px]"
 >
 <div className="w-12 h-12 rounded-none bg-neutral-100 text-black border border-black flex items-center justify-center text-xl font-bold mb-3">+</div>
 <h4 className="font-extrabold text-black uppercase tracking-widest text-xs">Add Fashion Piece</h4>
 <p className="text-xs text-gray-400 mt-1 max-w-[180px]">Quickly create a new product card in your catalog</p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {currentPage === 'contact' && (
 <div className="max-w-7xl mx-auto px-8 py-24 animate-fade-in">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {/* Contact Details & Hours */}
 <div className="space-y-8">
 <div>
 <h2 className="text-3xl font-extrabold uppercase tracking-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>Stockists & Contact</h2>
 <p className="text-theme-muted text-sm mt-1">Get in touch directly or visit our boutique showrooms.</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b border-black py-8">
 {phoneNumber && (
 <div className="bg-theme-surface border border-neutral-200 rounded-none p-6 shadow-none flex items-center gap-4">
 <div className="w-12 h-12 bg-neutral-100 rounded-none flex items-center justify-center text-xl shrink-0"><FaPhoneAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Us</div>
 <div className="font-bold text-black text-sm break-all">{phoneNumber}</div>
 </div>
 </div>
 )}
 {email && (
 <div className="bg-theme-surface border border-neutral-200 rounded-none p-6 shadow-none flex items-center gap-4">
 <div className="w-12 h-12 bg-neutral-100 rounded-none flex items-center justify-center text-xl shrink-0"><FaEnvelope /></div>
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</div>
 <div className="font-bold text-black text-sm break-all">{email}</div>
 </div>
 </div>
 )}
 {address && (
 <div className="bg-theme-surface border border-neutral-200 rounded-none p-6 shadow-none flex items-center gap-4 sm:col-span-2">
 <div className="w-12 h-12 bg-neutral-100 rounded-none flex items-center justify-center text-xl shrink-0"><FaMapMarkerAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Boutique Address</div>
 <div className="font-bold text-black text-sm">{address}</div>
 </div>
 </div>
 )}
 </div>

 {/* Hours panel */}
 <div className="bg-theme-surface border border-neutral-200 rounded-none p-8 shadow-none">
 <h3 className="font-bold text-black text-xl mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>{config.hours?.title || 'Business Hours'}</h3>
 <div className="space-y-3">
 {(config.hours?.days || []).map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-gray-150 pb-2.5 last:border-b-0 last:pb-0">
 <span className="font-bold text-theme-muted text-xs uppercase tracking-widest">{item.day}</span>
 <span className="font-extrabold text-black text-xs uppercase tracking-widest">{item.hours}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Contact Inquiry Form */}
 <div className="bg-theme-surface border border-black rounded-none p-8 md:p-10 shadow-none relative overflow-hidden">
 <h3 className="text-2xl font-bold mb-6 uppercase tracking-widest text-xs">Customer Service Form</h3>
 
 {formSubmitted ? (
 <div className="absolute inset-0 bg-theme-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
 <div className="w-16 h-16 bg-neutral-100 text-black border border-black rounded-none flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
 <h4 className="font-extrabold text-black text-xl uppercase tracking-widest">Message Received</h4>
 <p className="text-theme-muted text-sm mt-1 max-w-[280px]">Our support desk will prioritize your message and respond soon.</p>
 </div>
 ) : null}

 <form onSubmit={handleContactSubmit} className="space-y-5">
 <div>
 <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2 font-mono">Name</label>
 <input 
 type="text" 
 placeholder="ENTER NAME" 
 value={contactForm.name}
 onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
 className="w-full px-4 py-3 bg-theme-bg border border-neutral-350 rounded-none outline-none focus:border-black text-sm text-black transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2 font-mono">Email Address</label>
 <input 
 type="email" 
 placeholder="ENTER EMAIL ADDRESS" 
 value={contactForm.email}
 onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
 className="w-full px-4 py-3 bg-theme-bg border border-neutral-350 rounded-none outline-none focus:border-black text-sm text-black transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2 font-mono">Message</label>
 <textarea 
 placeholder="WHAT IS YOUR REQUEST?" 
 value={contactForm.message}
 onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
 rows={4}
 className="w-full px-4 py-3 bg-theme-bg border border-neutral-350 rounded-none outline-none focus:border-black text-sm text-black transition-all resize-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full py-4 bg-black text-white font-extrabold tracking-widest text-xs uppercase hover:bg-neutral-850 transition-colors"
 >
 Send Message
 </button>
 </form>
 </div>
 </div>
 </div>
 )}

 <footer className="bg-black py-8 text-center text-white/50 text-[0.8rem] tracking-[0.06em] uppercase">
 <p>© 2026 {storeName}. Powered by <span className="text-white font-bold">VendorBuild</span></p>
 </footer>

 {/* Size Guide Modal */}
 {activeSizeGuideProduct && (
 <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
 <div className="bg-theme-surface rounded-none max-w-md w-full p-8 shadow-theme relative font-sans text-black border border-black text-left animate-fade-in">
 <button 
 onClick={() => setActiveSizeGuideProduct(null)}
 className="absolute top-4 right-4 text-black hover:opacity-50 font-light text-3xl w-8 h-8 flex items-center justify-center"
 >
 ×
 </button>
 <h3 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>
 Size Guide
 </h3>
 <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-6">{activeSizeGuideProduct.name}</p>
 
 <div className="border border-black rounded-none overflow-hidden mb-6">
 <table className="w-full text-xs text-left border-collapse">
 <thead>
 <tr className="bg-neutral-50 text-black font-bold uppercase border-b border-black">
 <th className="p-3 font-mono">Size</th>
 <th className="p-3 font-mono">Chest (in)</th>
 <th className="p-3 font-mono">Waist (in)</th>
 <th className="p-3 font-mono">Hips (in)</th>
 </tr>
 </thead>
 <tbody className="text-neutral-600 divide-y divide-neutral-200">
 {['S', 'M', 'L', 'XL', 'XXL'].map((sz, idx) => (
 <tr key={sz} className={activeSizeGuideProduct.sizes?.includes(sz) ? 'bg-neutral-100 font-bold text-black' : ''}>
 <td className="p-3 font-mono">{sz}</td>
 <td className="p-3 font-mono">{34 + idx * 2}-{36 + idx * 2}</td>
 <td className="p-3 font-mono">{28 + idx * 2}-{30 + idx * 2}</td>
 <td className="p-3 font-mono">{36 + idx * 2}-{38 + idx * 2}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 bg-neutral-50 rounded-none border border-neutral-200 text-xs leading-relaxed text-neutral-600">
 <strong className="text-black uppercase tracking-widest text-[9px] block mb-1">Fabric & Care Notes:</strong>
 {activeSizeGuideProduct.material || "Refer to description: " + activeSizeGuideProduct.description}
 </div>
 
 <button 
 onClick={() => setActiveSizeGuideProduct(null)}
 className="w-full mt-6 py-3.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest transition-colors text-center"
 >
 Close
 </button>
 </div>
 </div>
 )}

 {/* Product Settings Edit Modal */}
 {isEditable && activeEditProductId && (() => {
 const product = products.find(p => (p._id || p.id) === activeEditProductId);
 if (!product) return null;
 return (
 <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-theme-surface rounded-none max-w-lg w-full p-8 shadow-theme relative font-sans text-black text-left animate-fade-in border border-black">
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="absolute top-4 right-4 text-black hover:opacity-50 font-light text-3xl w-8 h-8 flex items-center justify-center"
 >
 ×
 </button>
 <h3 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>
 Edit Settings
 </h3>
 <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-6">Configure details for this fashion piece.</p>

 <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Product Name</label>
 <input 
 type="text"
 value={product.name}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
 className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Price (₹)</label>
 <input 
 type="number"
 value={product.price}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
 className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black"
 />
 </div>

 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Category</label>
 <input 
 type="text"
 value={product.category || ''}
 placeholder="e.g. Outerwear, Dresses"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
 className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black"
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Description</label>
 <textarea 
 value={product.description || ''}
 placeholder="Describe material composition, tailoring, cut, and fit instructions."
 onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black resize-none"
 />
 </div>

 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2 font-mono">Available Sizes</label>
 <div className="flex gap-2 flex-wrap">
 {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
 const hasSize = (product.sizes || []).includes(sz);
 return (
 <button
 key={sz}
 type="button"
 onClick={() => {
 const currentSizes = product.sizes || [];
 const newSizes = hasSize 
 ? currentSizes.filter(s => s !== sz) 
 : [...currentSizes, sz];
 onUpdateProduct(product._id || product.id, 'sizes', newSizes);
 }}
 className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border rounded-none ${
 hasSize 
 ? 'bg-black border-black text-white' 
 : 'bg-theme-surface border-neutral-300 text-black hover:border-black'
 }`}
 >
 {sz}
 </button>
 );
 })}
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Fabric & Care Details</label>
 <input 
 type="text"
 value={product.material || ''}
 placeholder="e.g. 100% Organic Silk. Dry clean only."
 onChange={(e) => onUpdateProduct(product._id || product.id, 'material', e.target.value)}
 className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black"
 />
 </div>

 <div className="grid grid-cols-2 gap-4 py-1.5">
 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-neutral-350 bg-neutral-50 rounded-none transition-all">
 <input 
 type="checkbox"
 checked={!!product.isBestseller}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
 className="w-4 h-4 accent-black cursor-pointer"
 />
 <div className="text-[10px] font-bold uppercase tracking-widest text-black select-none font-mono">
 ⭐ Bestseller
 </div>
 </label>

 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-neutral-350 bg-neutral-50 rounded-none transition-all">
 <input 
 type="checkbox"
 checked={product.inStock !== false}
 onChange={(e) => {
 const checked = e.target.checked;
 onUpdateProduct(product._id || product.id, 'inStock', checked);
 onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
 }}
 className="w-4 h-4 accent-black cursor-pointer"
 />
 <div className="text-[10px] font-bold uppercase tracking-widest text-black select-none font-mono">
 📦 In Stock
 </div>
 </label>
 </div>

 <div>
 <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-1.5 font-mono">Stock Quantity</label>
 <input 
 type="number"
 min="0"
 value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 0;
 onUpdateProduct(product._id || product.id, 'stockQuantity', val);
 onUpdateProduct(product._id || product.id, 'inStock', val > 0);
 }}
 className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-none outline-none focus:border-black text-sm text-black font-medium"
 placeholder="Quantity in Stock"
 />
 </div>

 <div className="p-4 border border-black rounded-none bg-neutral-50 space-y-3">
 <span className="block text-[10px] font-mono font-bold text-black uppercase tracking-widest">Image Assets</span>
 
 <div className="flex gap-4 items-center">
 <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 shrink-0">
 <img 
 src={getProductImageUrl(product, 0)} 
 className="w-full h-full object-cover" 
 alt="Product preview" 
 />
 </div>

 <div className="flex-1 space-y-2">
 <div>
 <label className="inline-block px-4 py-2 border border-black bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest cursor-pointer text-center">
 Upload File
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
 placeholder="Paste image URL link" 
 onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
 className="w-full px-3 py-1.5 bg-[#ffffff] border border-neutral-300 rounded-none text-xs outline-none focus:border-black" 
 />
 </div>
 </div>
 </div>

 <div className="flex gap-3 pt-6 border-t border-neutral-200 justify-between items-center">
 <button 
 onClick={() => {
 if (onDeleteProduct) {
 onDeleteProduct(product._id || product.id);
 setActiveEditProductId(null);
 } else {
 alert("Delete callback not registered.");
 }
 }}
 className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-theme-primary font-bold uppercase tracking-widest text-[9px]"
 >
 Delete Product
 </button>
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="px-6 py-2.5 bg-black hover:bg-neutral-900 text-white font-bold uppercase tracking-widest text-[9px]"
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
 <div className="bg-theme-surface rounded-none max-w-lg w-full p-6 shadow-theme relative font-sans text-black border border-black text-left animate-fade-in">
 <button 
 onClick={() => setShowBgModal(false)}
 className="absolute top-4 right-4 text-black hover:opacity-50 font-light text-3xl w-8 h-8 flex items-center justify-center"
 >
 ×
 </button>
 <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>
 Header Background Settings
 </h3>
 <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-6">Select a hand-picked fashion preset or generate an image using AI.</p>

 <div className="flex border-b border-black mb-6 font-mono text-xs uppercase tracking-widest">
 <button 
 onClick={() => setActiveTab('presets')}
 className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
 >
 Presets
 </button>
 <button 
 onClick={() => setActiveTab('ai')}
 className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
 >
 AI Generator
 </button>
 </div>

 {activeTab === 'presets' ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
 {[
 { name: 'Classic Clothing Rack', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Modern Fashion Boutique', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Apparel Studio Lighting', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Minimalist Wardrobe Hangers', url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Summer Fabric Textile', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Boutique Storefront Window', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' }
 ].map((item, idx) => (
 <div 
 key={idx}
 onClick={() => {
 onUpdateConfig('header', 'heroImage', item.url);
 setShowBgModal(false);
 }}
 className="cursor-pointer group relative aspect-video overflow-hidden border border-transparent hover:border-black transition-all bg-gray-100"
 >
 <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
 <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[10px] text-white font-bold leading-tight truncate font-mono">{item.name}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 font-mono">Describe your background image</label>
 <textarea 
 placeholder="e.g. minimalist clothes rack backdrop, fashion boutique shop interior, apparel textures"
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-none outline-none focus:ring-1 focus:ring-black text-xs resize-none"
 />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 font-mono">Aesthetic Style</label>
 <select 
 value={aiStyle} 
 onChange={(e) => setAiStyle(e.target.value)}
 className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-none outline-none focus:ring-1 focus:ring-black text-xs font-bold bg-theme-surface"
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
 className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white font-mono uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
 >
 {isGenerating ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
