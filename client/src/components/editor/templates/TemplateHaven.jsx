import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
 FaShoppingCart, FaStar, FaArrowRight, FaPhoneAlt, FaEnvelope, 
 FaMapMarkerAlt, FaStore, FaWhatsapp, FaShieldAlt, FaClock, FaPaperPlane,
 FaSearch, FaFilter, FaSortAmountDown
} from 'react-icons/fa';
import EditableText from '../EditableText';
import SectionWrapper from '../SectionWrapper';

export default function TemplateHaven({ 
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
 const [activeDimensionsProduct, setActiveDimensionsProduct] = useState(null);

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
 const description = config.header.heroHeading || 'Warm, inviting spaces for the modern home.';
 const phoneNumber = website?.storeInfo?.contact?.phone ?? business?.contact?.phone ?? business?.phone ?? '';
 const email = website?.storeInfo?.contact?.email ?? business?.contact?.email ?? business?.email ?? '';
 const address = website?.storeInfo?.location?.address ?? business?.location?.address ?? business?.address ?? '';
 
 const primaryColor = config.theme?.primary || '#451A03'; // Amber 900
 const accentColor = config.theme?.accent || '#D97706'; // Amber 600
 const heroImage = config.header.heroImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';

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
 if (!imgUrl) return `https://picsum.photos/seed/haven${i}/600/600`;
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
 <header className="relative min-h-[80vh] flex items-center overflow-hidden animate-fade-in">
 <div className="absolute inset-0 z-0">
 <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
 <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(69,26,3,0.85) 40%, rgba(69,26,3,0.3))' }}></div>
 </div>
 
 {isEditable && (
 <button 
 onClick={() => setShowBgModal(true)}
 className="absolute bottom-6 right-6 z-20 px-4 py-2 bg-theme-surface/95 border border-amber-200 text-amber-900 rounded-full font-bold text-xs shadow-theme hover:scale-105 transition-transform flex items-center gap-1.5 font-sans"
 >
 🎨 Edit Hero Background
 </button>
 )}
 <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
 <div className="max-w-lg" style={{ textAlign: config.header.heroAlign }}>
 <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-4" style={{ color: accentColor }}>Home & Living</p>
 <EditableText
 isEditable={isEditable}
 value={config.header.heroHeading || storeName}
 onChange={(val) => onUpdateConfig('header', 'heroHeading', val)}
 tagName="h1"
 className="text-5xl md:text-7xl font-bold leading-[1.15] mb-5 text-[#fef3c7]"
 style={{ fontFamily: 'var(--heading-font)' }}
 />
 <EditableText
 isEditable={isEditable}
 value={config.header.heroSubheading || description}
 onChange={(val) => onUpdateConfig('header', 'heroSubheading', val)}
 tagName="p"
 className="text-lg text-[#fef3c7]/85 mb-10 leading-relaxed"
 />
 <div className={`flex flex-wrap gap-4 ${config.header.heroAlign === 'center' ? 'justify-center' : config.header.heroAlign === 'right' ? 'justify-end' : ''}`}>
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-3.5 text-slate-900 dark:text-white rounded font-semibold hover:opacity-85 transition-opacity flex items-center gap-2"
 style={{ backgroundColor: accentColor }}
 >
 <EditableText isEditable={isEditable} value={config.header.ctaLabel || 'Browse Collection'} onChange={(val) => onUpdateConfig('header', 'ctaLabel', val)} />
 <FaArrowRight />
 </button>
 {phoneNumber && (
 <a 
 href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="px-8 py-3.5 rounded font-semibold border hover:bg-[#fef3c7]/25 transition-colors flex items-center"
 style={{ backgroundColor: 'rgba(254,243,199,0.15)', color: '#fef3c7', borderColor: 'rgba(254,243,199,0.4)' }}
 >
 <FaWhatsapp className="mr-2" /> WhatsApp Us
 </a>
 )}
 </div>
 </div>
 </div>
 </header>
 </SectionWrapper>
 );

 case 'products':
 return (
 <SectionWrapper key="products" isEditable={isEditable} sectionKey="products" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section id="products" className="max-w-7xl mx-auto px-8 py-24">
 <h2 className="text-[2.5rem] font-bold mb-2 text-center" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>
 <EditableText
 isEditable={isEditable}
 value={config.products.sectionTitle || 'Our Collection'}
 onChange={(val) => onUpdateConfig('products', 'sectionTitle', val)}
 tagName="span"
 />
 </h2>
 <div className="w-16 h-0.5 mx-auto mb-12" style={{ backgroundColor: accentColor }}></div>
 
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
 className="bg-[#fefce8] rounded-theme overflow-hidden border border-[#fef08a] hover:shadow-[0_16px_40px_rgba(217,119,6,0.2)] transition-shadow flex flex-col justify-between"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-60 overflow-hidden">
 <img 
 src={product.img || `https://picsum.photos/seed/home${i}/600/600`}
 alt={product.name}
 className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
 />
 </div>
 <div className="p-5">
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-bold mb-1 truncate"
 style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 </div>
 </div>
 <div className="p-5 pt-0">
 <div className="flex items-center justify-between mt-4">
 {config.products?.showPrices !== false && (
 <div className="font-bold text-[1.1rem] flex items-center gap-0.5" style={{ color: accentColor }}>
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
 data-product-image={product.img || `https://picsum.photos/seed/home${i}/600/600`}
 className="text-[#fef3c7] px-4 py-2 rounded font-bold text-sm hover:opacity-80 transition-opacity"
 style={{ backgroundColor: primaryColor }}
 >
 Shop Now
 </button>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="text-center mt-12">
 <button 
 onClick={() => changePage('shop')}
 className="px-8 py-3 bg-[#fef3c7] hover:bg-[#fde68a] text-amber-900 border border-amber-300 rounded font-bold transition-colors"
 >
 Explore Entire Shop
 </button>
 </div>
 </section>
 </SectionWrapper>
 );

 case 'gallery':
 const galleryTitle = config.gallery?.title || 'Our Photo Gallery';
 const galleryImages = config.gallery?.images || [];
 return (
 <SectionWrapper key="gallery" isEditable={isEditable} sectionKey="gallery" sectionOrder={order} onUpdateConfig={onUpdateConfig} config={config}>
 <section className="max-w-7xl mx-auto px-8 py-20 bg-amber-100/30 border-t border-b border-amber-200">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={galleryTitle}
 onChange={(val) => onUpdateConfig('gallery', 'title', val)}
 tagName="h2"
 className="text-[2rem] font-bold mb-2"
 style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="w-12 h-[3px] rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {galleryImages.map((img, idx) => (
 <div key={idx} className="relative aspect-square rounded-theme overflow-hidden group shadow-theme border border-amber-250 bg-theme-surface">
 <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 {isEditable && (
 <div className="absolute inset-0 bg-[#451A03]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
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
 className="w-full px-3 py-1.5 bg-theme-surface text-theme-text rounded text-xs outline-none focus:ring-2 focus:ring-amber-500"
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
 className="text-3xl font-bold mb-2"
 style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {faqList.map((item, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <div key={item.id || idx} className="bg-[#fffbf0] border border-amber-200 rounded-theme overflow-hidden shadow-theme transition-all">
 <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-4 text-left font-bold text-amber-900 flex items-center justify-between hover:bg-amber-50/20 transition-colors">
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
 <span className="text-xl" style={{ color: accentColor }}>{isOpen ? '−' : '+'}</span>
 </button>
 {isOpen && (
 <div className="px-6 py-4 bg-amber-50/10 border-t border-amber-100 text-amber-950 leading-relaxed text-sm">
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
 <section className="bg-amber-100/20 border-t border-b border-amber-100 py-20 px-8">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-12">
 <EditableText
 isEditable={isEditable}
 value={testimonialTitle}
 onChange={(val) => onUpdateConfig('testimonials', 'title', val)}
 tagName="h2"
 className="text-3xl font-bold mb-2"
 style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {testimonialList.map((item, idx) => (
 <div key={item.id || idx} className="bg-theme-surface rounded-theme p-6 shadow-theme flex flex-col justify-between border border-amber-100">
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
 className={`text-lg transition-colors ${starIdx < item.rating ? 'text-theme-primary' : 'text-amber-100'}`}
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
 className="text-amber-900/80 text-sm italic leading-relaxed mb-6"
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
 className="font-bold text-amber-950 text-sm"
 />
 <EditableText
 isEditable={isEditable}
 value={item.role}
 onChange={(val) => {
 const updated = testimonialList.map(t => t.id === item.id ? { ...t, role: val } : t);
 onUpdateConfig('testimonials', 'list', updated);
 }}
 tagName="span"
 className="text-amber-400 text-xs font-semibold block mt-0.5"
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
 <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-100 rounded-theme p-8 md:p-12 shadow-theme">
 <div className="text-center mb-8">
 <EditableText
 isEditable={isEditable}
 value={hoursTitle}
 onChange={(val) => onUpdateConfig('hours', 'title', val)}
 tagName="h3"
 className="text-2xl font-bold mb-2"
 style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: accentColor }}></div>
 </div>
 <div className="space-y-4">
 {hoursDays.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-amber-100 pb-3 last:border-b-0 last:pb-0">
 <span className="font-bold text-amber-800">{item.day}</span>
 <EditableText
 isEditable={isEditable}
 value={item.hours}
 onChange={(val) => {
 const updated = hoursDays.map(d => d.day === item.day ? { ...d, hours: val } : d);
 onUpdateConfig('hours', 'days', updated);
 }}
 tagName="span"
 className="font-bold text-amber-950 text-sm"
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
 <section className="w-full py-12 px-8 text-slate-900 dark:text-white text-center relative overflow-hidden" style={{ backgroundColor: config.countdown?.bgColor || primaryColor }}>
 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="text-left md:max-w-md">
 <EditableText
 isEditable={isEditable}
 value={countdownTitle}
 onChange={(val) => onUpdateConfig('countdown', 'title', val)}
 tagName="h3"
 className="text-2xl md:text-3xl font-extrabold mb-2"
 />
 <p className="text-amber-100 text-sm">Hurry up! Take advantage of our exclusive offers before the timer hits zero.</p>
 </div>
 
 <div className="flex gap-4">
 {[
 { label: 'Days', val: timeLeft.days },
 { label: 'Hours', val: timeLeft.hours },
 { label: 'Min', val: timeLeft.minutes },
 { label: 'Sec', val: timeLeft.seconds }
 ].map((col, idx) => (
 <div key={idx} className="flex flex-col items-center bg-black/25 px-4 py-3 rounded-theme min-w-[70px] border border-slate-900/10 dark:border-white/10 shadow-theme">
 <span className="text-2xl font-black text-slate-900 dark:text-white">{String(col.val).padStart(2, '0')}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 mt-1">{col.label}</span>
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
 <section id="contact" className="bg-[#fef3c7] py-16 px-8 text-center">
 <h3 className="text-[2rem] font-bold mb-6" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>Get in Touch</h3>
 <div className="inline-block bg-[#fffbf0] rounded-theme p-8 text-left shadow-theme min-w-[300px] border border-[#fde68a]">
 <div className="space-y-4">
 {phoneNumber && (
 <p className="flex items-center gap-3">
 <FaPhoneAlt style={{ color: accentColor }} />
 <span className="font-bold text-amber-900">{phoneNumber}</span>
 </p>
 )}
 {email && (
 <p className="flex items-center gap-3">
 <FaEnvelope style={{ color: accentColor }} />
 <span className="font-bold text-amber-900">{email}</span>
 </p>
 )}
 {address && (
 <p className="flex items-center gap-3">
 <FaMapMarkerAlt style={{ color: accentColor }} />
 <span className="font-bold text-amber-900">{address}</span>
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
 backgroundColor: '#fefce8',
 color: '#451a03',
 fontFamily: 'var(--body-font)',
 fontSize: 'var(--base-size)',
 lineHeight: 'var(--line-height)',
 letterSpacing: 'var(--letter-spacing)'
 }}
 >
 {/* NAV */}
 <nav 
 className="sticky top-0 z-50 transition-all px-8 border-b-2" 
 style={{ 
 backgroundColor: config.navbar?.backgroundColor || '#fef3c7',
 borderColor: '#fde68a',
 boxShadow: scrolled ? '0 4px 12px rgba(69,26,3,0.05)' : 'none'
 }}
 >
 <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.5rem]">
 {isEditable ? (
 <EditableText
 isEditable={true}
 value={businessName}
 onChange={(val) => onUpdateConfig('navbar', 'logoText', val)}
 tagName="span"
 className="font-bold text-[1.6rem] cursor-text"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 ) : (
 <button 
 onClick={() => changePage('home')}
 className="font-bold text-[1.6rem] text-left focus:outline-none hover:opacity-85"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 >
 {businessName}
 </button>
 )}
 {devicePreview === 'desktop' && (
 <div className="flex gap-8 text-[0.9rem] font-medium" style={{ color: config.navbar?.textColor || '#92400e' }}>
 {['Home', 'Shop', 'Contact'].map(page => (
 <button 
 key={page} 
 onClick={() => changePage(page.toLowerCase())}
 className={`font-semibold hover:text-amber-900 transition-colors ${currentPage === page.toLowerCase() ? 'text-amber-900 underline underline-offset-4 font-bold' : 'text-theme-primary/80'}`}
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
 <div className="bg-theme-surface rounded-theme p-8 border border-amber-200 shadow-theme mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
 <div>
 <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>Product Catalog</h2>
 <p className="text-theme-primary text-sm mt-1">Explore and filter our dynamic products inventory</p>
 </div>
 
 <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-xl md:justify-end">
 {/* Search */}
 <div className="relative flex-1">
 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-primary" />
 <input 
 type="text" 
 placeholder="Search item..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-amber-50/30 border border-amber-200 rounded-full outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all text-amber-950"
 />
 </div>

 {/* Sorting */}
 <div className="relative">
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="pl-4 pr-10 py-3 bg-amber-50/30 border border-amber-200 rounded-full outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer appearance-none font-semibold text-amber-900"
 >
 <option value="default">Default Sort</option>
 <option value="price-low">Price: Low to High</option>
 <option value="price-high">Price: High to Low</option>
 </select>
 <FaSortAmountDown className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-primary pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Categories Filter Row */}
 <div className="flex flex-wrap gap-2.5 mb-10">
 {categoriesList.map(cat => (
 <button 
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-5 py-2 rounded-full font-bold text-xs capitalize transition-all ${selectedCategory === cat ? 'text-white shadow-theme' : 'bg-theme-surface border border-amber-200 text-amber-800 hover:bg-amber-50'}`}
 style={{ backgroundColor: selectedCategory === cat ? accentColor : '' }}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Catalog Grid */}
 {sortedFilteredProducts.length === 0 ? (
 <div className="text-center py-20 bg-[#fffbf0] rounded-theme border border-amber-200 shadow-theme">
 <div className="text-4xl mb-3">🔍</div>
 <h3 className="font-extrabold text-amber-900 text-lg">No items match filters</h3>
 <p className="text-theme-primary text-sm mt-1">Try another keyword or change your category selection</p>
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
 className="bg-[#fefce8] rounded-theme overflow-hidden border border-[#fef08a] hover:shadow-[0_16px_40px_rgba(217,119,6,0.2)] transition-shadow flex flex-col justify-between animate-fade-in relative"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div>
 <div className="h-60 overflow-hidden relative">
 <img 
 src={getProductImageUrl(product, i)}
 alt={product.name}
 className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
 />
 {product.inStock === false ? (
 <span className="absolute top-3 left-3 bg-amber-950/80 text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20">
 Out of Stock
 </span>
 ) : product.isBestseller ? (
 <span className="absolute top-3 left-3 bg-theme-primary text-slate-900 dark:text-white text-slate-900 dark:text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-theme z-20" style={{ backgroundColor: accentColor }}>
 ⭐ Bestseller
 </span>
 ) : null}
 {isEditable && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 setActiveEditProductId(product._id || product.id);
 }}
 className="absolute top-3 right-3 bg-theme-surface/95 border border-amber-200 hover:bg-amber-900 hover:text-white p-2 rounded-full shadow-theme transition-all duration-300 z-20 hover:scale-110 flex items-center justify-center text-sm"
 title="Edit Product Settings"
 >
 ⚙️
 </button>
 )}
 </div>
 <div className="p-5">
 <div className="text-[0.65rem] font-bold tracking-[0.12em] uppercase mb-1.5 text-theme-primary">
 {product.category || 'Home Decor'}
 </div>
 <EditableText
 isEditable={isEditable}
 value={product.name}
 onChange={(val) => onUpdateProduct(product._id || product.id, 'name', val)}
 tagName="h4"
 className="text-lg font-bold mb-1 truncate"
 style={{ color: config.navbar?.textColor || primaryColor, fontFamily: 'var(--heading-font)' }}
 />
 <div className="text-[11px] font-medium text-theme-muted mt-1 opacity-80">Stock: <span className="font-bold">{product.stockQuantity ?? 10}</span></div>
 {product.material && (
 <div className="text-xs italic text-theme-primary mt-1">
 Material: {product.material}
 </div>
 )}
 </div>
 </div>
 <div className="p-5 pt-0">
 <div className="flex items-center justify-between mt-4">
 {config.products?.showPrices !== false && (
 <div className="font-bold text-[1.1rem] flex items-center gap-0.5" style={{ color: accentColor }}>
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
 className={`text-[#fef3c7] px-4 py-2 rounded font-bold text-sm transition-all ${
 product.inStock === false 
 ? 'bg-amber-100 text-amber-400 cursor-not-allowed' 
 : 'hover:opacity-80'
 }`}
 style={{ backgroundColor: product.inStock !== false ? primaryColor : undefined }}
 >
 {product.inStock === false ? 'Sold Out' : 'Shop Now'}
 </button>
 )}
 {product.specs && product.specs.length > 0 && (
 <button 
 onClick={() => setActiveDimensionsProduct(product)}
 className="text-[10px] font-semibold text-theme-primary hover:text-amber-800 transition-colors underline"
 >
 Dimensions Info
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
 className="bg-theme-surface border-2 border-dashed border-amber-300 rounded-theme p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/10 transition-all duration-300 min-h-[300px]"
 style={{ borderRadius: 'var(--radius)' }}
 >
 <div className="w-12 h-12 rounded-full bg-amber-50 text-theme-primary flex items-center justify-center text-xl font-bold mb-3">+</div>
 <h4 className="font-extrabold text-theme-primary">Add New Product</h4>
 <p className="text-xs text-amber-400 mt-1 max-w-[180px]">Quickly create a new product card in your catalog</p>
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
 <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>Get in Touch</h2>
 <p className="text-theme-primary text-sm mt-1">Have any questions? Drop us a message.</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {phoneNumber && (
 <div className="bg-theme-surface border border-[#fde68a] rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-amber-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaPhoneAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Call Us</div>
 <div className="font-bold text-amber-900 text-sm break-all">{phoneNumber}</div>
 </div>
 </div>
 )}
 {email && (
 <div className="bg-theme-surface border border-[#fde68a] rounded-theme p-6 shadow-theme flex items-center gap-4">
 <div className="w-12 h-12 bg-amber-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaEnvelope /></div>
 <div>
 <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Email Us</div>
 <div className="font-bold text-amber-900 text-sm break-all">{email}</div>
 </div>
 </div>
 )}
 {address && (
 <div className="bg-theme-surface border border-[#fde68a] rounded-theme p-6 shadow-theme flex items-center gap-4 sm:col-span-2">
 <div className="w-12 h-12 bg-amber-50 rounded-theme flex items-center justify-center text-xl shrink-0" style={{ color: accentColor }}><FaMapMarkerAlt /></div>
 <div>
 <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Address</div>
 <div className="font-bold text-amber-900 text-sm">{address}</div>
 </div>
 </div>
 )}
 </div>

 {/* Hours panel */}
 <div className="bg-theme-surface border border-[#fde68a] rounded-theme p-8 shadow-theme">
 <h3 className="font-bold text-amber-950 text-xl mb-4" style={{ fontFamily: 'var(--heading-font)' }}>{config.hours?.title || 'Business Hours'}</h3>
 <div className="space-y-3">
 {(config.hours?.days || []).map((item, idx) => (
 <div key={idx} className="flex justify-between items-center border-b border-amber-100 pb-2.5 last:border-b-0 last:pb-0">
 <span className="font-bold text-amber-800 text-sm">{item.day}</span>
 <span className="font-extrabold text-amber-950 text-sm">{item.hours}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Contact Inquiry Form */}
 <div className="bg-theme-surface border border-[#fde68a] rounded-theme p-8 md:p-10 shadow-theme relative overflow-hidden">
 <h3 className="text-2xl font-bold mb-6" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>Send Inquiry</h3>
 
 {formSubmitted ? (
 <div className="absolute inset-0 bg-theme-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
 <div className="w-16 h-16 bg-amber-50 text-theme-primary rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce"><FaPaperPlane /></div>
 <h4 className="font-extrabold text-amber-950 text-xl">Inquiry Submitted!</h4>
 <p className="text-theme-primary text-sm mt-1 max-w-[280px]">Thank you. We will get back to you shortly.</p>
 </div>
 ) : null}

 <form onSubmit={handleContactSubmit} className="space-y-5">
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2">Name</label>
 <input 
 type="text" 
 placeholder="Enter your name" 
 value={contactForm.name}
 onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
 className="w-full px-4 py-3 bg-amber-50/30 border border-amber-200 rounded outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-950 transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2">Email</label>
 <input 
 type="email" 
 placeholder="Enter your email" 
 value={contactForm.email}
 onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
 className="w-full px-4 py-3 bg-amber-50/30 border border-amber-250 rounded outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-950 transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-theme-primary uppercase tracking-widest mb-2">Message</label>
 <textarea 
 placeholder="Describe your request..." 
 value={contactForm.message}
 onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
 rows={4}
 className="w-full px-4 py-3 bg-amber-50/30 border border-amber-250 rounded outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-950 transition-all resize-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full py-4 rounded text-slate-900 dark:text-white font-semibold shadow-theme hover:opacity-95 transition-opacity"
 style={{ backgroundColor: accentColor }}
 >
 Submit Form
 </button>
 </form>
 </div>
 </div>
 </div>
 )}

 <footer className="py-8 text-center text-[0.85rem]" style={{ backgroundColor: primaryColor, color: 'rgba(254,243,199,0.65)' }}>
 <p>© 2026 {storeName}. Powered by <span style={{ color: accentColor, fontWeight: 'bold' }}>VendorBuild</span></p>
 </footer>

 {/* Dimensions Modal */}
 {activeDimensionsProduct && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
 <div className="bg-[#fffdf5] rounded-theme max-w-md w-full p-8 border border-amber-100 shadow-theme relative font-sans text-amber-950 text-left animate-fade-in">
 <button 
 onClick={() => setActiveDimensionsProduct(null)}
 className="absolute top-4 right-4 text-theme-primary hover:text-theme-primary font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100"
 >
 ×
 </button>
 <h3 className="text-2xl font-bold mb-1" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>
 📐 Dimensions & Sizing
 </h3>
 <p className="text-xs text-theme-primary mb-6">{activeDimensionsProduct.name}</p>
 
 <div className="border border-amber-100 rounded-theme overflow-hidden mb-6">
 <table className="w-full text-xs text-left border-collapse">
 <thead>
 <tr className="bg-amber-50/50 text-amber-800 font-bold uppercase border-b border-amber-100">
 <th className="p-3">Measure</th>
 <th className="p-3">Specification</th>
 </tr>
 </thead>
 <tbody className="text-amber-900 divide-y divide-amber-100">
 {(activeDimensionsProduct.specs || []).map((sp, idx) => {
 const parts = sp.split(':');
 const key = parts[0] || '';
 const val = parts.slice(1).join(':') || '';
 return (
 <tr key={idx} className="hover:bg-amber-50/20">
 <td className="p-3 font-semibold text-amber-800">{key.trim()}</td>
 <td className="p-3 font-mono text-amber-955">{val.trim() || 'N/A'}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 <div className="p-4 bg-amber-50/30 rounded-theme border border-amber-100 text-xs leading-relaxed text-amber-800">
 <strong className="text-amber-900 block mb-1">🌲 Crafting & Material:</strong>
 {activeDimensionsProduct.material || "Crafted using premium natural materials."}
 </div>
 
 <button 
 onClick={() => setActiveDimensionsProduct(null)}
 className="w-full mt-6 py-3 bg-amber-900 hover:bg-amber-850 text-white font-bold rounded-theme shadow-theme transition-colors text-sm text-center"
 style={{ backgroundColor: primaryColor }}
 >
 Close Dimensions
 </button>
 </div>
 </div>
 )}

 {/* Edit settings modal */}
 {isEditable && activeEditProductId && (() => {
 const product = products.find(p => (p._id || p.id) === activeEditProductId);
 if (!product) return null;
 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
 <div className="bg-[#fffdf5] rounded-theme max-w-lg w-full p-8 shadow-theme relative border border-amber-100 font-sans text-amber-955 text-left animate-fade-in">
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="absolute top-4 right-4 text-theme-primary hover:text-theme-primary font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100"
 >
 ×
 </button>
 <h3 className="text-2xl font-bold mb-1" style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}>
 Edit Decor Settings
 </h3>
 <p className="text-xs text-theme-primary mb-6">Modify price, descriptions, crafting material details, or sizing parameters.</p>

 <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Decor Item Name</label>
 <input 
 type="text"
 value={product.name}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'name', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-950"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Price (₹)</label>
 <input 
 type="number"
 value={product.price}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'price', parseFloat(e.target.value) || 0)}
 className="w-full px-4 py-2.5 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-950"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Decor Category</label>
 <input 
 type="text"
 value={product.category || ''}
 placeholder="e.g. Living Room, Lighting"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'category', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-955"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Overview Description</label>
 <textarea 
 value={product.description || ''}
 placeholder="Describe aesthetics, style notes, room fits, and special features."
 onChange={(e) => onUpdateProduct(product._id || product.id, 'description', e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-955 resize-none"
 />
 </div>

 {/* Material (Home Decor Specific) */}
 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Material Composition</label>
 <input 
 type="text"
 value={product.material || ''}
 placeholder="e.g. 100% Solid Teakwood, Natural Rattan"
 onChange={(e) => onUpdateProduct(product._id || product.id, 'material', e.target.value)}
 className="w-full px-4 py-2.5 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm text-amber-955"
 />
 </div>

 {/* Sizing & Dimensions (Home Decor Specific) */}
 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Dimensions (Format: Parameter: Value)</label>
 <div className="space-y-2">
 {(product.specs || []).map((sp, idx) => (
 <div key={idx} className="flex gap-2 items-center">
 <input 
 type="text"
 value={sp}
 onChange={(e) => {
 const updated = [...(product.specs || [])];
 updated[idx] = e.target.value;
 onUpdateProduct(product._id || product.id, 'specs', updated);
 }}
 className="flex-1 px-3 py-1.5 bg-theme-surface border border-amber-200 rounded text-xs text-amber-955 outline-none focus:border-amber-450"
 />
 <button 
 type="button"
 onClick={() => {
 const updated = (product.specs || []).filter((_, sIdx) => sIdx !== idx);
 onUpdateProduct(product._id || product.id, 'specs', updated);
 }}
 className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 rounded text-xs font-bold"
 >
 Delete
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={() => {
 const updated = [...(product.specs || []), 'Height: 100cm'];
 onUpdateProduct(product._id || product.id, 'specs', updated);
 }}
 className="w-full py-2 bg-theme-surface border border-dashed border-amber-200 hover:border-amber-400 text-xs font-bold text-theme-primary rounded transition-colors"
 >
 + Add Dimension Attribute
 </button>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 py-1.5">
 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-amber-200 bg-theme-surface rounded-theme transition-all">
 <input 
 type="checkbox"
 checked={!!product.isBestseller}
 onChange={(e) => onUpdateProduct(product._id || product.id, 'isBestseller', e.target.checked)}
 className="w-4 h-4 accent-amber-650 cursor-pointer"
 />
 <div className="text-xs font-bold text-amber-900 select-none">
 ⭐ Mark as Bestseller
 </div>
 </label>

 <label className="flex items-center gap-2.5 cursor-pointer p-3 border border-amber-200 bg-theme-surface rounded-theme transition-all">
 <input 
 type="checkbox"
 checked={product.inStock !== false}
 onChange={(e) => {
 const checked = e.target.checked;
 onUpdateProduct(product._id || product.id, 'inStock', checked);
 onUpdateProduct(product._id || product.id, 'stockQuantity', checked ? (product.stockQuantity > 0 ? product.stockQuantity : 10) : 0);
 }}
 className="w-4 h-4 accent-amber-650 cursor-pointer"
 />
 <div className="text-xs font-bold text-amber-900 select-none">
 📦 Product In Stock
 </div>
 </label>
 </div>

 {/* Stock Quantity */}
 <div>
 <label className="block text-xs font-bold text-amber-800 uppercase mb-1.5">Stock Quantity (Items Left)</label>
 <input 
 type="number"
 min="0"
 value={product.stockQuantity !== undefined ? product.stockQuantity : 10}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 0;
 onUpdateProduct(product._id || product.id, 'stockQuantity', val);
 onUpdateProduct(product._id || product.id, 'inStock', val > 0);
 }}
 className="w-full px-4 py-2.5 bg-theme-surface border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-amber-955"
 placeholder="Quantity in Stock"
 />
 </div>

 {/* Product Image Section */}
 <div className="p-4 border border-amber-200 rounded-theme bg-amber-50/30 space-y-3">
 <span className="block text-xs font-bold text-amber-900 uppercase">Decor Image</span>
 
 <div className="flex gap-4 items-center">
 <div className="w-20 h-20 rounded-theme overflow-hidden bg-theme-surface border border-amber-200 shrink-0">
 <img 
 src={getProductImageUrl(product, 0)} 
 className="w-full h-full object-cover" 
 alt="Product preview" 
 />
 </div>

 <div className="flex-1 space-y-2">
 <div>
 <label className="inline-block px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-955 font-bold rounded-theme text-xs cursor-pointer shadow-theme transition-all text-center">
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
 placeholder="Paste decor image link" 
 onChange={(e) => onUpdateProduct(product._id || product.id, 'img', e.target.value)} 
 className="w-full px-3 py-1.5 bg-[#ffffff] border border-amber-200 rounded-theme text-xs outline-none focus:ring-1 focus:ring-amber-500 text-amber-955" 
 />
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-3 pt-4 border-t border-amber-200 justify-between items-center">
 <button 
 onClick={() => {
 if (onDeleteProduct) {
 onDeleteProduct(product._id || product.id);
 setActiveEditProductId(null);
 } else {
 alert("Delete callback not registered.");
 }
 }}
 className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-655 rounded-full font-bold text-xs shadow-theme transition-all"
 >
 Delete Decor Item
 </button>
 <button 
 onClick={() => setActiveEditProductId(null)}
 className="px-6 py-2.5 text-slate-900 dark:text-white rounded-full font-bold text-xs shadow transition-all animate-pulse"
 style={{ backgroundColor: primaryColor }}
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
 <div className="bg-theme-surface rounded-theme max-w-lg w-full p-6 shadow-theme relative font-sans text-theme-text text-left animate-fade-in border border-amber-100">
 <button 
 onClick={() => setShowBgModal(false)}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
 >
 ×
 </button>
 <h3 className="text-xl font-bold mb-1 text-amber-955" style={{ fontFamily: 'var(--heading-font)' }}>
 Header Background Settings
 </h3>
 <p className="text-xs text-theme-muted mb-6">Select a home decor preset or generate using AI.</p>

 <div className="flex border-b border-amber-200 mb-6 font-semibold">
 <button 
 onClick={() => setActiveTab('presets')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'presets' ? 'border-amber-600 text-theme-primary' : 'border-transparent text-gray-450 hover:text-theme-muted'}`}
 >
 Presets
 </button>
 <button 
 onClick={() => setActiveTab('ai')}
 className={`flex-1 py-2 font-bold text-sm text-center border-b-2 transition-colors ${activeTab === 'ai' ? 'border-amber-600 text-theme-primary' : 'border-transparent text-gray-450 hover:text-theme-muted'}`}
 >
 AI Generator
 </button>
 </div>

 {activeTab === 'presets' ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
 {[
 { name: 'Cozy Scandinavian Living Room', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Modern Minimalist Interior', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Earthy Decor Accessories', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Sunny Window Lounge Chair', url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Warm Wooden Cabinet', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80' },
 { name: 'Nordic Ceramic Pots', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80' }
 ].map((item, idx) => (
 <div 
 key={idx}
 onClick={() => {
 onUpdateConfig('header', 'heroImage', item.url);
 setShowBgModal(false);
 }}
 className="cursor-pointer group relative aspect-video rounded-theme overflow-hidden border-2 border-transparent hover:border-amber-600 transition-all bg-amber-50/20"
 >
 <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
 <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[10px] text-slate-900 dark:text-white font-bold leading-tight truncate">{item.name}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-4 font-sans">
 <div>
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Describe your decor backdrop</label>
 <textarea 
 placeholder="e.g. bright boho style apartment, mid century modern furniture cozy living room"
 value={aiPrompt}
 onChange={(e) => setAiPrompt(e.target.value)}
 rows={3}
 className="w-full px-4 py-3 bg-amber-50/10 border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-650 text-sm text-amber-955 resize-none"
 />
 </div>

 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-xs font-bold text-theme-muted uppercase mb-2">Aesthetic Style</label>
 <select 
 value={aiStyle} 
 onChange={(e) => setAiStyle(e.target.value)}
 className="w-full p-3 bg-amber-50/10 border border-amber-200 rounded-theme outline-none focus:ring-2 focus:ring-amber-650 text-sm font-bold bg-theme-surface text-amber-950"
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
 className="w-full py-3.5 hover:opacity-90 text-slate-900 dark:text-white font-bold rounded-full shadow transition-colors flex items-center justify-center gap-2"
 style={{ backgroundColor: accentColor }}
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
