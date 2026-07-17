import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
import {
 FaStore, FaArrowRight, FaTimes, FaSearch,
 FaChevronRight, FaPlus, FaCheck, FaTrash,
 FaStar, FaMobileAlt, FaDesktop, FaShoppingCart,
 FaCamera, FaUpload, FaSpinner, FaPhone, FaEnvelope,
 FaMapMarkerAlt, FaImage, FaMagic, FaWhatsapp, FaInstagram,
 FaFacebook, FaTwitter, FaGlobe, FaRedo, FaVideo, FaMicrophone
} from 'react-icons/fa';
import LivePreview from '../components/editor/LivePreview';
import AIChatModal from '../components/chatbot/AIChatModal';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

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
 logoText: '',
 showSearch: true,
 searchPosition: 'right',
 links: [{ id: '1', label: 'Home', url: '/' }, { id: '2', label: 'Products', url: '/products' }],
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
 image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
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
 image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#020617', secondary: '#F8FAFC', accent: '#10B981' }
 },
 {
 id: 't9',
 name: 'Glow',
 category: 'Beauty',
 description: 'Radiant and airy design perfect for organic and natural products.',
 image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#064E3B', secondary: '#ECFDF5', accent: '#10B981' }
 },
 {
 id: 't10',
 name: 'Bistro',
 category: 'Food & Beverage',
 description: 'Elegant charcoal theme with gold accents for fine dining and bistros.',
 image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1E1E1C', secondary: '#F5F5F0', accent: '#C5A880' },
 isNew: true
 },
 {
 id: 't11',
 name: 'Loft',
 category: 'Home Decor',
 description: 'Scandinavian minimalist grid style with cozy, earthy textures.',
 image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#2E302F', secondary: '#F4F5F4', accent: '#8E9A86' }
 },
 {
 id: 't12',
 name: 'Zenith',
 category: 'Services',
 description: 'Sleek, high-performance dark theme for modern service agencies.',
 image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0B0F19', secondary: '#1E293B', accent: '#6366F1' },
 isPopular: true
 },
 {
 id: 't13',
 name: 'Trend',
 category: 'Fashion',
 description: 'Vibrant modern aesthetic with bold styling for trendsetters.',
 image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#F43F5E', secondary: '#FFF1F2', accent: '#FDA4AF' }
 },
 {
 id: 't14',
 name: 'Spark',
 category: 'Electronics',
 description: 'High-contrast dark mode grid for gaming and computer hardware.',
 image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#090D16', secondary: '#171E30', accent: '#10B981' },
 isNew: true
 },
 {
 id: 't15',
 name: 'Flora',
 category: 'Beauty',
 description: 'Soothing botanical styling for organic skincare and aromatherapy.',
 image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1F2937', secondary: '#F5F7F6', accent: '#4B5E52' }
 },
 {
 id: 't16',
 name: 'Silk',
 category: 'Fashion',
 description: 'Luxurious fashion design featuring serif fonts and subtle gold accents.',
 image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1F1610', secondary: '#FAF8F5', accent: '#D4AF37' },
 isNew: true
 },
 {
 id: 't17',
 name: 'Active',
 category: 'Fashion',
 description: 'Bold, high-contrast athletic look with custom fits and active guidelines.',
 image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0A0A0A', secondary: '#F3F4F6', accent: '#00D2FF' }
 },
 {
 id: 't18',
 name: 'Vintage',
 category: 'Fashion',
 description: 'Raw retro thrifting card layout styled with warm sepia tones and monospace text.',
 image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#3C2F2F', secondary: '#F8F1EB', accent: '#D97706' }
 },
 {
 id: 't19',
 name: 'Quantum',
 category: 'Electronics',
 description: 'Deep violet neon glow tech grids with interactive hardware comparisons.',
 image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0F0926', secondary: '#1A123C', accent: '#C084FC' },
 isNew: true
 },
 {
 id: 't20',
 name: 'Aero',
 category: 'Electronics',
 description: 'A light, ultra-clean hardware spec setup with quick specs side panels.',
 image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0F172A', secondary: '#F1F5F9', accent: '#3B82F6' }
 },
 {
 id: 't21',
 name: 'RetroTech',
 category: 'Electronics',
 description: '8-bit themed store layout with pixel frames and classic sound triggers.',
 image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#242526', secondary: '#ECEFF1', accent: '#4CAF50' }
 },
 {
 id: 't22',
 name: 'Onyx',
 category: 'Beauty',
 description: 'Luxury high-end cosmetics showcasing product purity and elegance.',
 image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0D0D0D', secondary: '#F7F7F7', accent: '#C5A880' },
 isPopular: true
 },
 {
 id: 't23',
 name: 'Mist',
 category: 'Beauty',
 description: 'Fresh spa design with water colors and dynamic skin hydration checks.',
 image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0A2540', secondary: '#F0F8FF', accent: '#00D2FF' }
 },
 {
 id: 't24',
 name: 'Petal',
 category: 'Beauty',
 description: 'Floral botanical layout focusing on scent notes and organic freshness.',
 image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#4C1D95', secondary: '#FDF2F8', accent: '#EC4899' }
 },
 {
 id: 't25',
 name: 'Brew',
 category: 'Food & Beverage',
 description: 'A cozy espresso house styling with customizable coffee strengths.',
 image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#3E2723', secondary: '#EFEBE9', accent: '#8D6E63' },
 isPopular: true
 },
 {
 id: 't26',
 name: 'Slice',
 category: 'Food & Beverage',
 description: 'Energetic pizzeria and fast-food grids with ingredient toppings builder.',
 image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#B91C1C', secondary: '#FEF2F2', accent: '#F59E0B' },
 isNew: true
 },
 {
 id: 't27',
 name: 'Hops',
 category: 'Food & Beverage',
 description: 'Industrial rustic pub theme with interactive food and beer pairings.',
 image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1A1813', secondary: '#FBF9F6', accent: '#D97706' }
 },
 {
 id: 't28',
 name: 'Harvest',
 category: 'Food & Beverage',
 description: 'Earthy farm-to-table design highlighting local freshness and origins.',
 image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#2F4F4F', secondary: '#F5FFFA', accent: '#8FBC8F' }
 },
 {
 id: 't29',
 name: 'Manor',
 category: 'Home Decor',
 description: 'Classic luxury and rich wood furniture setups with layout guides.',
 image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#3E2723', secondary: '#FAECE6', accent: '#B78A62' }
 },
 {
 id: 't30',
 name: 'Patio',
 category: 'Home Decor',
 description: 'Sunny garden and porch layouts featuring weather proofing indices.',
 image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1B4D3E', secondary: '#F0FFF4', accent: '#2E8B57' },
 isNew: true
 },
 {
 id: 't31',
 name: 'Urban',
 category: 'Home Decor',
 description: 'Loft industrial vibes emphasizing concrete grey and clean steel details.',
 image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#374151', secondary: '#F9FAFB', accent: '#4B5563' }
 },
 {
 id: 't32',
 name: 'Zen',
 category: 'Home Decor',
 description: 'Japanese styled minimalist layouts focusing on feng shui placement guides.',
 image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#2C3539', secondary: '#FAF9F6', accent: '#C2B280' }
 },
 {
 id: 't33',
 name: 'Pulse',
 category: 'Services',
 description: 'High energy coaching and fitness trainer theme with goal selectors.',
 image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#DC2626', secondary: '#111827', accent: '#EF4444' },
 isNew: true
 },
 {
 id: 't34',
 name: 'Scale',
 category: 'Services',
 description: 'Trustworthy corporate advisory style with interactive ROI metrics.',
 image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#1E3A8A', secondary: '#F8FAFC', accent: '#3B82F6' },
 isPopular: true
 },
 {
 id: 't35',
 name: 'PixelCraft',
 category: 'Services',
 description: 'Creative visual design agency layouts showing pixel perfect elements.',
 image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0A0015', secondary: '#FBF8FF', accent: '#8B5CF6' }
 },
 {
 id: 't36',
 name: 'Care',
 category: 'Services',
 description: 'Warm, empathetic counseling and medical styling with soft appointment tabs.',
 image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
 colors: { primary: '#0F766E', secondary: '#F0FDFA', accent: '#14B8A6' }
 }
];

function Templates({ token, businessId }) {
 const { theme } = useTheme();
 const navigate = useNavigate();
 const [activeCategory, setActiveCategory] = useState('All');
 const [previewTemplate, setPreviewTemplate] = useState(null);
 const [previewDevice, setPreviewDevice] = useState('desktop');
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const [drawerStep, setDrawerStep] = useState(1);
 const [isPublishing, setIsPublishing] = useState(false);
 const [showSuccessToast, setShowSuccessToast] = useState(false);
 const [isVoiceRecording, setIsVoiceRecording] = useState(false);
 const [isChatOpen, setIsChatOpen] = useState(false);
 const [businessData, setBusinessData] = useState(null);

 useEffect(() => {
 if (token && businessId) {
 axios.get(`${API_URL}/business/${businessId}`, { headers: { Authorization: token } })
 .then(res => setBusinessData(res.data))
 .catch(err => console.error("Failed to fetch business data", err));
 }
 }, [token, businessId]);

 const startVoice = () => {
 if (!('webkitSpeechRecognition' in window)) {
 alert('Voice recognition not supported in this browser');
 return;
 }
 
 const recognition = new window.webkitSpeechRecognition();
 recognition.lang = 'en-US';
 recognition.continuous = false;
 recognition.interimResults = false;
 
 recognition.onstart = () => setIsVoiceRecording(true);
 recognition.onend = () => setIsVoiceRecording(false);
 
 recognition.onresult = async (event) => {
 const text = event.results[0][0].transcript;
 alert('Recognized speech: "' + text + '"\nProcessing with AI...');
 try {
 const response = await axios.post(`${API_URL}/ai/extract-product`, { text });
 
 // Show the raw response data for debugging
 console.log("Raw AI Response STR:", JSON.stringify(response.data));
 
 const data = response.data;
 if (!data || typeof data !== 'object') {
 throw new Error('Invalid data format received from AI');
 }

 setNewProduct(prev => {
 const updated = {
 ...prev,
 name: data.name || prev.name,
 price: data.price || prev.price,
 category: data.category || prev.category,
 description: data.description || prev.description
 };
 console.log("Updated Product State STR:", JSON.stringify(updated));
 return updated;
 });
 
 alert(`Success! Extracted: \nName: ${data.name}\nPrice: ${data.price}`);
 } catch (error) {
 console.error('Failed to process voice input', error);
 const errorMsg = error.response?.data?.error || error.message;
 alert('Failed to process voice input: ' + errorMsg);
 }
 };
 
 recognition.start();
 };

 // Camera states
 const [showCameraModal, setShowCameraModal] = useState(false);
 const [currentProductIndex, setCurrentProductIndex] = useState(null);
 const [stream, setStream] = useState(null);
 const videoRef = useRef(null);
 const canvasRef = useRef(null);

 // Flow State
 const [scrapeUrl, setScrapeUrl] = useState('');
 const [isScraping, setIsScraping] = useState(false);

 const handleUrlScrape = async () => {
 if (!scrapeUrl.trim()) return;
 setIsScraping(true);
 try {
 const response = await axios.post(`${API_URL}/ai/scrape-and-recommend`, { url: scrapeUrl });
 setStoreDetails({
 name: response.data.business?.businessName || storeDetails.name || '',
 tagline: response.data.business?.description || storeDetails.tagline || '',
 phone: response.data.business?.phone || storeDetails.phone || '',
 email: response.data.business?.email || storeDetails.email || '',
 address: response.data.business?.address || storeDetails.address || '',
 socialMedia: {
 whatsapp: response.data.business?.phone || '',
 instagram: '',
 facebook: '',
 twitter: ''
 }
 });
 if (response.data.extractedProducts && response.data.extractedProducts.length > 0) {
 setProducts(response.data.extractedProducts.map(p => ({
 name: p.name,
 price: p.price,
 category: 'general',
 description: p.description,
 image: null,
 imagePreview: null
 })));
 }
 alert('Store details and products imported successfully!');
 } catch (error) {
 console.error('Scraping error:', error);
 alert(error.response?.data?.error || error.message || 'Failed to import business details from the URL.');
 }
 setIsScraping(false);
 };

 const [storeDetails, setStoreDetails] = useState({
 name: '',
 tagline: '',
 logo: null,
 logoFile: null,
 phone: '',
 email: '',
 address: '',
 socialMedia: {
 whatsapp: '',
 instagram: '',
 facebook: '',
 twitter: ''
 }
 });
 const [products, setProducts] = useState([]);
 const [newProduct, setNewProduct] = useState({
 name: '',
 price: '',
 category: '',
 description: '',
 image: null,
 imagePreview: null,
 isRemovingBg: false
 });

 const filteredTemplates = activeCategory === 'All'
 ? MOCK_TEMPLATES
 : MOCK_TEMPLATES.filter(t => t.category === activeCategory);

 const openDrawer = (template) => {
 setPreviewTemplate(template);
 setStoreDetails(prev => ({
 ...prev,
 name: `${template.name} Hub - ${Math.random().toString(36).substring(2, 6).toUpperCase()}`
 }));
 setIsDrawerOpen(true);
 setDrawerStep(1);
 };

 const handleAIBuild = (buildData) => {
 // buildData = { template: 't1', businessName: '...', description: '...' }
 const chosenTemplate = MOCK_TEMPLATES.find(t => t.id === buildData.template);
 if (chosenTemplate) {
 setPreviewTemplate(chosenTemplate);
 }
 
 setStoreDetails(prev => ({
 ...prev,
 name: buildData.businessName || (chosenTemplate ? `${chosenTemplate.name} Hub - ${Math.random().toString(36).substring(2, 6).toUpperCase()}` : prev.name),
 tagline: buildData.description || prev.tagline
 }));
 
 setIsDrawerOpen(true);
 setDrawerStep(1); // Open to step 1 so they can review their details
 setIsChatOpen(false); // Close the chat
 };

 const closeDrawer = () => {
 setIsDrawerOpen(false);
 if (stream) {
 stream.getTracks().forEach(track => track.stop());
 setStream(null);
 }
 setShowCameraModal(false);
 setProducts([]);
 setStoreDetails({
 name: '',
 tagline: '',
 phone: '',
 email: '',
 address: '',
 socialMedia: {
 whatsapp: '',
 instagram: '',
 facebook: '',
 twitter: ''
 }
 });
 };

 const startCamera = async (productIndex = null) => {
 setCurrentProductIndex(productIndex);
 setShowCameraModal(true);

 try {
 const mediaStream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: 'environment' }
 });
 setStream(mediaStream);
 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream;
 }
 } catch (error) {
 console.error('Error accessing camera:', error);
 alert('Unable to access camera. Please check permissions or use file upload instead.');
 setShowCameraModal(false);
 }
 };

 const capturePhoto = () => {
 if (videoRef.current && canvasRef.current) {
 const video = videoRef.current;
 const canvas = canvasRef.current;
 const context = canvas.getContext('2d');

 canvas.width = video.videoWidth;
 canvas.height = video.videoHeight;
 context.drawImage(video, 0, 0, canvas.width, canvas.height);

 canvas.toBlob(async (blob) => {
 const file = new File([blob], `product-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

 if (currentProductIndex === null) {
 const previewUrl = URL.createObjectURL(file);
 setNewProduct(prev => ({
 ...prev,
 image: file,
 imagePreview: previewUrl,
 originalImage: file
 }));
 await removeBackground(file);
 } else {
 const updatedProducts = [...products];
 const previewUrl = URL.createObjectURL(file);
 updatedProducts[currentProductIndex] = {
 ...updatedProducts[currentProductIndex],
 image: file,
 imagePreview: previewUrl,
 originalImage: file,
 isRemovingBg: true
 };
 setProducts(updatedProducts);
 await removeBackground(file, currentProductIndex);
 }

 if (stream) {
 stream.getTracks().forEach(track => track.stop());
 setStream(null);
 }
 setShowCameraModal(false);
 setCurrentProductIndex(null);
 }, 'image/jpeg', 0.9);
 }
 };

 const retakePhoto = () => { };

 const removeBackground = async (imageFile, productIndex = null) => {
 console.log('removeBackground called with:', { productIndex, fileName: imageFile.name, fileSize: imageFile.size });

 if (productIndex === null) {
 setNewProduct(prev => ({ ...prev, isRemovingBg: true }));

 try {
 const formData = new FormData();
 formData.append('image', imageFile);

 console.log('Sending request to backend:', `${API_URL}/upload/product-image`);

 const response = await axios.post(`${API_URL}/upload/product-image`, formData, {
 headers: {
 'Content-Type': 'multipart/form-data'
 }
 });

 console.log('Backend response:', response.data);

 const imageUrl = response.data.url;
 console.log('Processed image URL:', imageUrl);

 const imageResponse = await axios.get(`http://localhost:5000${imageUrl}`, {
 responseType: 'blob'
 });

 const processedImageUrl = URL.createObjectURL(imageResponse.data);
 console.log('Created preview URL:', processedImageUrl);

 setNewProduct(prev => ({
 ...prev,
 image: imageResponse.data,
 imagePreview: processedImageUrl,
 isRemovingBg: false
 }));

 return processedImageUrl;
 } catch (error) {
 console.error('Background removal failed - Full error:', error);
 if (error.response) {
 console.error('Error response data:', error.response.data);
 console.error('Error response status:', error.response.status);
 alert(`Background removal failed: ${error.response.data?.error || error.message}`);
 } else {
 alert('Background removal failed. Check console for details.');
 }

 const fallbackUrl = URL.createObjectURL(imageFile);
 setNewProduct(prev => ({
 ...prev,
 image: imageFile,
 imagePreview: fallbackUrl,
 isRemovingBg: false
 }));
 return null;
 }
 } else {
 const updatedProducts = [...products];
 updatedProducts[productIndex].isRemovingBg = true;
 setProducts(updatedProducts);

 try {
 const formData = new FormData();
 formData.append('image', imageFile);

 console.log('Sending request to backend for existing product:', productIndex);

 const response = await axios.post(`${API_URL}/upload/product-image`, formData, {
 headers: {
 'Content-Type': 'multipart/form-data'
 }
 });

 console.log('Backend response for existing product:', response.data);

 const imageUrl = response.data.url;

 const imageResponse = await axios.get(`http://localhost:5000${imageUrl}`, {
 responseType: 'blob'
 });

 const processedImageUrl = URL.createObjectURL(imageResponse.data);

 updatedProducts[productIndex] = {
 ...updatedProducts[productIndex],
 image: imageResponse.data,
 imagePreview: processedImageUrl,
 isRemovingBg: false
 };
 setProducts([...updatedProducts]);

 return processedImageUrl;
 } catch (error) {
 console.error('Background removal failed for existing product:', error);
 const fallbackUrl = URL.createObjectURL(imageFile);
 updatedProducts[productIndex] = {
 ...updatedProducts[productIndex],
 image: imageFile,
 imagePreview: fallbackUrl,
 isRemovingBg: false
 };
 setProducts([...updatedProducts]);
 alert('Background removal failed. Using original image.');
 return null;
 }
 }
 };

 const handleLogoUpload = (e) => {
 const file = e.target.files[0];
 if (file) {
 if (file.size > 2 * 1024 * 1024) {
 alert("Logo size must be less than 2MB");
 return;
 }
 const previewUrl = URL.createObjectURL(file);
 setStoreDetails(prev => ({
 ...prev,
 logo: previewUrl,
 logoFile: file
 }));
 }
 };

 const handleImageUpload = async (e, productIndex = null) => {
 const file = e.target.files[0];
 if (file) {
 console.log('Image selected:', { name: file.name, size: file.size, type: file.type });

 if (productIndex === null) {
 const previewUrl = URL.createObjectURL(file);
 setNewProduct(prev => ({
 ...prev,
 image: file,
 imagePreview: previewUrl,
 originalImage: file
 }));
 await removeBackground(file);
 } else {
 const updatedProducts = [...products];
 const previewUrl = URL.createObjectURL(file);
 updatedProducts[productIndex] = {
 ...updatedProducts[productIndex],
 image: file,
 imagePreview: previewUrl,
 originalImage: file,
 isRemovingBg: true
 };
 setProducts(updatedProducts);
 await removeBackground(file, productIndex);
 }
 }
 };

 const addProduct = () => {
 if (!newProduct.name || !newProduct.price) {
 alert('Please fill in product name and price');
 return;
 }
 setProducts([...products, {
 ...newProduct,
 id: Date.now(),
 imagePreview: newProduct.imagePreview || null,
 image: newProduct.image || null
 }]);
 setNewProduct({
 name: '',
 price: '',
 category: '',
 description: '',
 image: null,
 imagePreview: null,
 isRemovingBg: false
 });
 };

 const removeProduct = (id) => {
 setProducts(products.filter(p => p.id !== id));
 };

 const handleWhatsAppClick = (phoneNumber) => {
 const formattedNumber = phoneNumber.replace(/\D/g, '');
 const whatsappUrl = `https://wa.me/${formattedNumber}`;
 window.open(whatsappUrl, '_blank');
 };

 const handleLaunch = async () => {
 setIsPublishing(true);

 if (token && businessId) {
 try {
 const validCategories = ['restaurant', 'tailor', 'grocery', 'salon', 'mechanic', 'home_service', 'tea_shop', 'stationery', 'clinic', 'other'];
 const aiCategory = previewTemplate?.category || 'General';
 const dbCategory = validCategories.includes(aiCategory.toLowerCase()) ? aiCategory.toLowerCase() : 'other';

 // We no longer update the global business here to keep it isolated
 // We will pass these specific details as storeInfo when creating the new website
 
 const productImages = [];
 const createdProducts = [];
 const uploadedImageUrls = [];

 for (const product of products) {
 let imageUrl = null;
 if (product.image) {
 const imageFormData = new FormData();
 imageFormData.append('image', product.image, 'product.png');
 const uploadResponse = await axios.post(`${API_URL}/upload/product-image`, imageFormData);
 imageUrl = uploadResponse.data.url;
 productImages.push(imageUrl);
 } else {
 productImages.push(null);
 }

 uploadedImageUrls.push(imageUrl);

 createdProducts.push({
 name: product.name,
 price: product.price,
 category: product.category,
 description: product.description,
 hasImage: !!product.imagePreview
 });
 }

 let uploadedLogoUrl = null;
 if (storeDetails.logoFile) {
 const logoFormData = new FormData();
 logoFormData.append('image', storeDetails.logoFile, 'logo.png');
 const uploadResponse = await axios.post(`${API_URL}/upload/product-image`, logoFormData);
 uploadedLogoUrl = uploadResponse.data.url;
 }

 const businessDataForAI = {
 businessName: businessData?.businessName || 'My Business',
 storeName: storeDetails.name || `${previewTemplate?.name || 'Acme'} Hub - ${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
 logo: storeDetails.logoPreview || storeDetails.logo || businessData?.logo || '',
 logo: uploadedLogoUrl,
 description: storeDetails.tagline || '',
 phone: storeDetails.phone || '',
 email: storeDetails.email || '',
 address: storeDetails.address || '',
 socialMedia: storeDetails.socialMedia,
 category: aiCategory,
 services: createdProducts
 };

 // AFTER
 const response = await axios.post(`${API_URL}/ai/generate-website`, {
 businessData: businessDataForAI,
 productImages,
 template: previewTemplate?.id || 't1', // ← id, not category
 templateName: previewTemplate?.name || 'Aurora',
 theme: {
 primaryColor: previewTemplate?.colors?.primary || '#2563eb',
 secondaryColor: previewTemplate?.colors?.secondary || '#4f46e5',
 accentColor: previewTemplate?.colors?.accent || '#3B82F6'
 }
 });

 const saveRes = await axios.post(`${API_URL}/website/${businessId}/new`, {
 html: response.data.html,
 css: response.data.css,
 template: previewTemplate?.id || 't1',
 published: true,
 storeName: storeDetails.name || `${previewTemplate?.name || 'Acme'} Hub - ${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
 storeInfo: {
 description: storeDetails.tagline || '',
 category: dbCategory,
 logo: uploadedLogoUrl,
 contact: {
 phone: storeDetails.phone || '',
 email: storeDetails.email || ''
 },
 location: {
 address: storeDetails.address || ''
 },
 socialMedia: storeDetails.socialMedia || {}
 }
 });

 const newWebsiteId = saveRes.data._id;

 // Now save products to DB with the new websiteId
 for (let i = 0; i < products.length; i++) {
 const product = products[i];
 const imageUrl = uploadedImageUrls[i];

 await axios.post(`${API_URL}/business/${businessId}/products`, {
 websiteId: newWebsiteId,
 name: product.name,
 price: Number(product.price) || 0,
 category: product.category || 'general',
 description: product.description || '',
 imageUrl: imageUrl || ''
 });
 }

 setIsPublishing(false);
 setShowSuccessToast(true);
 closeDrawer();
 setTimeout(() => {
 navigate(`/website/${saveRes.data.slug}`);
 }, 1500);
 } catch (error) {
 console.error('Failed to launch website', error);
 alert('Failed to launch website. Please try again.');
 setIsPublishing(false);
 }
 } else {
 setTimeout(() => {
 setIsPublishing(false);
 alert('Website generated! Please log in to save and manage your new store.');
 closeDrawer();
 navigate('/');
 }, 2000);
 }
 };

 const [chatOpen, setChatOpen] = useState(false);
 const [chatMsg, setChatMsg] = useState('');
 const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: 'Hi! I can help you design your store. Say "change theme to blue" or "add a T-shirt for ₹20".' }]);
 const [isChatLoading, setIsChatLoading] = useState(false);

 const handleSendChat = async () => {
 if (!chatMsg.trim()) return;
 const newHistory = [...chatHistory, { role: 'user', text: chatMsg }];
 setChatHistory(newHistory);
 setChatMsg('');
 setIsChatLoading(true);

 // Package current store details and catalog context
 const storeContext = {
 template: previewTemplate ? `${previewTemplate.name} (${previewTemplate.id})` : 'None',
 businessName: storeDetails.name || 'Not set',
 description: storeDetails.tagline || 'Not set',
 phone: storeDetails.phone || 'Not set',
 email: storeDetails.email || 'Not set',
 address: storeDetails.address || 'Not set',
 products: products.map(p => ({
 name: p.name,
 price: p.price,
 description: p.description || ''
 }))
 };

 try {
 const res = await axios.post(`${API_URL}/ai/chat`, {
 messages: newHistory.map(h => ({ role: h.role === 'ai' ? 'ai' : 'user', text: h.text })),
 storeContext,
 businessId
 });
 let replyText = res.data.reply;

 // Check for hidden build command trigger
 const buildMatch = replyText.match(/___BUILD___([\s\S]*?)___BUILD___/);
 if (buildMatch) {
 try {
 const buildData = JSON.parse(buildMatch[1].trim());
 handleAIBuild(buildData);
 setChatOpen(false); // Close inline chat panel
 } catch (e) {
 console.error("Failed to parse inline build command:", e);
 }
 // Strip out the build command from the visible chat message
 replyText = replyText.replace(/___BUILD___[\s\S]*?___BUILD___/, '').trim();
 }

 setChatHistory([...newHistory, { role: 'ai', text: replyText }]);
 } catch (e) {
 console.error('AI Assistant Error:', e);
 setChatHistory([...newHistory, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI.' }]);
 } finally {
 setIsChatLoading(false);
 }
 };

 return (
 <div className={`min-h-screen font-sans pb-20 relative transition-colors duration-300 theme-${theme} ${theme === 'dark' ? 'bg-slate-50 dark:bg-[#09080E] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
 {/* Camera Modal */}
 {showCameraModal && (
 <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
 <div className="relative w-full h-full max-w-lg mx-auto bg-black">
 <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
 <button
 onClick={() => {
 if (stream) {
 stream.getTracks().forEach(track => track.stop());
 setStream(null);
 }
 setShowCameraModal(false);
 }}
 className="bg-black/50 text-white p-3 rounded-full"
 >
 <FaTimes className="text-xl" />
 </button>
 <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
 Take Product Photo
 </div>
 <button
 onClick={retakePhoto}
 className="bg-black/50 text-white p-3 rounded-full"
 >
 <FaRedo className="text-xl" />
 </button>
 </div>

 <video
 ref={videoRef}
 autoPlay
 playsInline
 className="w-full h-full object-cover"
 />

 <canvas ref={canvasRef} className="hidden" />

 <div className="absolute bottom-8 left-0 right-0 flex justify-center">
 <button
 onClick={capturePhoto}
 className="bg-white rounded-full p-6 shadow-2xl hover:scale-105 transition-transform"
 >
 <div className="w-16 h-16 rounded-full border-4 border-gray-300 bg-white"></div>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* FULL SCREEN PUBLISHING LOADER */}
 {isPublishing && (
 <div className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
 <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
 <h2 className="text-3xl font-bold font-jakarta mb-4 animate-pulse">Generating your store...</h2>
 <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
 <div className="h-full bg-indigo-600 animate-[progress_1.5s_ease-in-out_infinite]"></div>
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
 <nav className={`${theme === 'dark' ? 'bg-white dark:bg-[#0D0C14] border-slate-200 dark:border-slate-800/60' : 'bg-white border-slate-200'} border-b sticky top-0 z-30 transition-colors duration-300`}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
 <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
 <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/15">
 <FaStore className="text-xl" />
 </div>
 <span className={`font-extrabold font-jakarta text-2xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>VendorBuild</span>
 </div>
 <div className="flex items-center gap-4">
 <ThemeToggle />
 <button onClick={() => navigate('/')} className={`${theme === 'dark' ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white' : 'text-slate-600 hover:text-slate-900'} font-medium transition-colors`}>Home</button>
 {token && <button onClick={() => navigate('/dashboard')} className={`${theme === 'dark' ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white' : 'text-slate-600 hover:text-slate-900'} font-medium transition-colors`}>Dashboard</button>}
 </div>
 </div>
 </nav>

 {/* HERO & FILTERS */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-12">
 <div className="text-center max-w-3xl mx-auto mb-12">
 <h1 className={`font-jakarta text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
 Choose Your Store Template
 </h1>
 <p className="text-lg md:text-xl text-slate-600 dark:text-slate-500">
 Pick a design, add your products, and go live in minutes. No coding required.
 </p>
 </div>

 {/* Category Pills */}
 <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
 {CATEGORIES.map(category => (
 <button
 key={category}
 onClick={() => setActiveCategory(category)}
 className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === category
 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 transform scale-105'
 : `${theme === 'dark' ? 'bg-white dark:bg-[#13121A] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/60 hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'} border hover:border-indigo-500/40`
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
 className="bg-white dark:bg-[#13121A] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col transform hover:-translate-y-1"
 >
 <div className="relative h-64 overflow-hidden bg-slate-900/50">
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
 <div className="absolute top-4 left-4 flex gap-2">
 <span className="bg-slate-50 dark:bg-[#09080E]/80 backdrop-blur-sm text-slate-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-300 dark:border-slate-700/50">
 {template.category}
 </span>
 </div>
 <div className="absolute top-4 right-4 flex gap-2">
 {template.isNew && <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"><FaStar className="text-[10px]" /> New</span>}
 {template.isPopular && <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Popular</span>}
 </div>
 </div>

 <div className="p-6 flex-1 flex flex-col">
 <h3 className="font-jakarta text-2xl font-bold text-slate-900 dark:text-white mb-2">{template.name}</h3>
 <p className="text-slate-600 dark:text-slate-500 text-sm flex-1 mb-6 leading-relaxed">{template.description}</p>
 <div className="flex gap-3">
 <button
 onClick={() => openDrawer(template)}
 className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.01]"
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
 <p className="text-slate-600 dark:text-slate-500 text-lg">No templates found for this category.</p>
 </div>
 )}
 </div>

 <div className="bg-white dark:bg-[#0D0C14] border-t border-slate-200 dark:border-slate-800/60 mt-12 py-16">
 <div className="max-w-4xl mx-auto px-4 text-center">
 <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
 <FaStar className="text-2xl" />
 </div>
 <h2 className="font-jakarta text-3xl font-bold text-slate-900 dark:text-white mb-4">Not sure which template to pick?</h2>
 <p className="text-slate-600 dark:text-slate-500 text-lg mb-8">Let our AI analyze your business and automatically generate the perfect store for you.</p>
 <button 
 onClick={() => setIsChatOpen(true)}
 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/20"
 >
 Ask AI for a Recommendation
 </button>
 </div>
 </div>

 {/* FULL-SCREEN PREVIEW MODAL */}
 {previewTemplate && !isDrawerOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 md:p-8 animate-fade-in">
 <div className="bg-white w-full h-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
 <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 relative z-20">
 <div className="flex items-center gap-4">
 <span className="font-bold text-lg text-slate-900">{previewTemplate.name} Preview</span>
 <div className="hidden md:flex gap-2 bg-slate-100 p-1 rounded-lg">
 <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 shadow-sm rounded-md ${previewDevice === 'desktop' ? 'bg-white text-indigo-600' : 'text-slate-600 dark:text-slate-500 hover:text-slate-700'}`}><FaDesktop /></button>
 <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 shadow-sm rounded-md ${previewDevice === 'mobile' ? 'bg-white text-indigo-600' : 'text-slate-600 dark:text-slate-500 hover:text-slate-700'}`}><FaMobileAlt /></button>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <button
 onClick={() => openDrawer(previewTemplate)}
 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md shadow-indigo-500/10 hover:scale-[1.01] transition-all"
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

 <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
 <div className="w-full h-full max-h-[800px] flex items-center justify-center">
 <LivePreview 
 config={{
 ...DEFAULT_CONFIG,
 template: previewTemplate.id,
 themeColor: previewTemplate.colors.primary,
 header: {
 ...DEFAULT_CONFIG.header,
 heroImage: previewTemplate.image
 }
 }}
 devicePreview={previewDevice}
 business={businessData || { businessName: 'MockStore', description: previewTemplate.description }}
 website={{ storeName: storeDetails?.name || 'MockStore' }}
 products={[]} 
 />
 </div>
 </div>

 </div>
 </div>
 )}

 {/* RIGHT DRAWER: PRODUCT ADDITION FLOW */}
 {isDrawerOpen && (
 <>
 <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 animate-fade-in" onClick={closeDrawer}></div>
 <div className={`fixed top-0 right-0 h-full w-full bg-white dark:bg-[#0D0C14] shadow-2xl shadow-black/50 z-50 flex flex-col transform transition-all duration-300 translate-x-0 ${drawerStep === 2 ? 'max-w-4xl' : 'max-w-md'}`}>

 {/* Drawer Header */}
 <div className="h-20 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-6 shrink-0">
 <h2 className="font-jakarta text-xl font-bold text-slate-900 dark:text-white">Setup Your Store</h2>
 <button onClick={closeDrawer} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-200 transition-colors">
 <FaTimes />
 </button>
 </div>

 {/* Progress Stepper */}
 <div className="px-6 py-6 bg-slate-50 dark:bg-[#09080E] border-b border-slate-200 dark:border-slate-800/60 shrink-0">
 <div className="flex items-center justify-between relative">
 <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0 rounded-full"></div>
 <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-purple-600 z-0 rounded-full transition-all duration-300`} style={{ width: drawerStep === 1 ? '0%' : drawerStep === 2 ? '50%' : '100%' }}></div>

 {[1, 2, 3].map(step => (
 <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${drawerStep >= step ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-white dark:bg-[#0D0C14] border-slate-300 dark:border-slate-700 text-slate-600'
 }`}>
 {drawerStep > step ? <FaCheck className="text-xs" /> : step}
 </div>
 ))}
 </div>
 <div className="flex justify-between mt-2 text-xs font-semibold text-slate-600 dark:text-slate-500">
 <span className={drawerStep >= 1 ? 'text-purple-650 font-bold' : ''}>Details</span>
 <span className={drawerStep >= 2 ? 'text-purple-650 font-bold' : ''}>Products</span>
 <span className={drawerStep >= 3 ? 'text-purple-650 font-bold' : ''}>Publish</span>
 </div>
 </div>

 {/* Drawer Content */}
 <div className="flex-1 overflow-y-auto p-6">

 {/* STEP 1: Details */}
 {drawerStep === 1 && (
 <div className="space-y-6 animate-fade-in-up">
 <div className="text-center mb-6">
 <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
 <FaStore className="text-purple-650 text-2xl" />
 </div>
 <h3 className="font-jakarta text-2xl font-bold text-slate-900 dark:text-white">Store Details</h3>
 <p className="text-slate-600 dark:text-slate-500 mt-2">Let's give your new store an identity.</p>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Store Name *</label>
 <input
 type="text"
 value={storeDetails.name}
 onChange={(e) => setStoreDetails({ ...storeDetails, name: e.target.value })}
 placeholder="e.g. Acme SuperMart"
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] placeholder-slate-400 dark:placeholder-slate-500 font-medium"
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tagline</label>
 <input
 type="text"
 value={storeDetails.tagline}
 onChange={(e) => setStoreDetails({ ...storeDetails, tagline: e.target.value })}
 placeholder="e.g. Best quality goods for you"
 className="w-full border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
 <FaPhone className="inline mr-2 text-slate-600 dark:text-slate-400" /> Phone Number *
 </label>
 <input
 type="tel"
 value={storeDetails.phone}
 onChange={(e) => setStoreDetails({ ...storeDetails, phone: e.target.value })}
 placeholder="+1 234 567 8900"
 className="w-full border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium placeholder-slate-400 dark:placeholder-slate-500"
 />
 <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Will be displayed on your website with WhatsApp button</p>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
 <FaEnvelope className="inline mr-2 text-slate-600 dark:text-slate-400" /> Email Address <span className="text-slate-600 dark:text-slate-400 font-normal">(Optional)</span>
 </label>
 <input
 type="email"
 value={storeDetails.email}
 onChange={(e) => setStoreDetails({ ...storeDetails, email: e.target.value })}
 placeholder="contact@yourstore.com"
 className="w-full border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
 <FaMapMarkerAlt className="inline mr-2 text-slate-600 dark:text-slate-400" /> Store Address
 </label>
 <textarea
 value={storeDetails.address}
 onChange={(e) => setStoreDetails({ ...storeDetails, address: e.target.value })}
 placeholder="123 Business St., Suite 100, City, Country"
 rows="3"
 className="w-full border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white bg-white dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 font-medium resize-none placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 {/* Social Media Section */}
 <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 mt-4">
 <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Social Media Links (Optional)</h4>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
 <FaWhatsapp className="text-green-600" /> WhatsApp Number
 </label>
 <input
 type="tel"
 value={storeDetails.socialMedia.whatsapp}
 onChange={(e) => setStoreDetails({
 ...storeDetails,
 socialMedia: { ...storeDetails.socialMedia, whatsapp: e.target.value }
 })}
 placeholder="+1 234 567 8900"
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Customers can chat with you directly via WhatsApp</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
 <FaInstagram className="text-pink-600" /> Instagram URL
 </label>
 <input
 type="url"
 value={storeDetails.socialMedia.instagram}
 onChange={(e) => setStoreDetails({
 ...storeDetails,
 socialMedia: { ...storeDetails.socialMedia, instagram: e.target.value }
 })}
 placeholder="https://instagram.com/yourstore"
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
 <FaFacebook className="text-blue-700" /> Facebook URL
 </label>
 <input
 type="url"
 value={storeDetails.socialMedia.facebook}
 onChange={(e) => setStoreDetails({
 ...storeDetails,
 socialMedia: { ...storeDetails.socialMedia, facebook: e.target.value }
 })}
 placeholder="https://facebook.com/yourstore"
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
 <FaTwitter className="text-blue-400" /> Twitter URL
 </label>
 <input
 type="url"
 value={storeDetails.socialMedia.twitter}
 onChange={(e) => setStoreDetails({
 ...storeDetails,
 socialMedia: { ...storeDetails.socialMedia, twitter: e.target.value }
 })}
 placeholder="https://twitter.com/yourstore"
 className="w-full border border-slate-300 dark:border-slate-700/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-[#09080E] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Store Logo</label>
 <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-purple-400 transition-colors cursor-pointer relative overflow-hidden">
 <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="logo-upload" onChange={handleLogoUpload} />
 {storeDetails.logo ? (
 <div className="flex flex-col items-center">
 <img src={storeDetails.logo} alt="Store Logo Preview" className="h-20 object-contain mb-2" />
 <p className="text-purple-650 font-bold text-sm">Change logo</p>
 </div>
 ) : (
 <div>
 <FaImage className="text-3xl text-slate-600 dark:text-slate-400 mx-auto mb-2" />
 <p className="text-purple-650 font-bold text-sm">Click to upload logo</p>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">PNG, JPG up to 2MB</p>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Products - Professional Grid Layout */}
 {drawerStep === 2 && (
 <div className="space-y-6 animate-fade-in-up">
 <div className="mb-6">
 <h3 className="font-jakarta text-2xl font-bold text-slate-900 dark:text-white">Add Products</h3>
 <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Add products to your catalog. Professional layout for better management.</p>
 </div>

 {/* Two Column Layout for Add Product Form and Product List */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

 {/* LEFT COLUMN - Add Product Form */}
 <div className="bg-gradient-to-br from-slate-50 to-white dark:from-[#09080E] dark:to-[#13121A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm sticky top-0">
 <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
 <FaPlus className="text-indigo-650" /> Add New Product
 </h4>

 <div className="space-y-4">
 {/* Product Image Upload with Camera Options */}
 <div>
 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Product Image & Details</label>
 <div className="flex gap-3">
 <button
 onClick={startVoice}
 className={`flex-1 ${isVoiceRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-purple-650 hover:from-purple-650 hover:to-purple-700'} text-white rounded-xl p-3 text-center transition-all shadow-md`}
 >
 <FaMicrophone className={`text-xl mx-auto mb-1 ${isVoiceRecording ? 'animate-pulse' : ''}`} />
 <span className="text-xs font-bold">{isVoiceRecording ? 'Listening...' : 'Voice Input'}</span>
 </button>
 <button
 onClick={() => startCamera(null)}
 className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl p-3 text-center transition-all shadow-md"
 >
 <FaCamera className="text-xl mx-auto mb-1" />
 <span className="text-xs font-bold">Take Photo</span>
 </button>
 <button
 onClick={() => document.getElementById('product-image-input').click()}
 className="flex-1 bg-white dark:bg-[#13121A] border-2 border-dashed border-slate-250 dark:border-slate-700/60 rounded-xl p-3 text-center hover:border-purple-400 transition-colors"
 >
 <FaUpload className="text-xl text-slate-400 dark:text-slate-500 mx-auto mb-1" />
 <span className="text-xs text-slate-600 dark:text-slate-500">Upload File</span>
 </button>
 </div>
 <input
 id="product-image-input"
 type="file"
 accept="image/*"
 onChange={(e) => handleImageUpload(e, null)}
 className="hidden"
 />
 {newProduct.imagePreview && (
 <div className="mt-3 relative">
 <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-purple-500 bg-gray-100">
 <img src={newProduct.imagePreview} alt="Preview" className="w-full h-full object-contain" />
 {newProduct.isRemovingBg && (
 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
 <div className="text-center text-white">
 <FaSpinner className="animate-spin text-2xl mx-auto mb-2" />
 <p className="text-xs">Removing background...</p>
 </div>
 </div>
 )}
 <button
 onClick={() => setNewProduct(prev => ({ ...prev, imagePreview: null, image: null }))}
 className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
 >
 ×
 </button>
 </div>
 {newProduct.imagePreview && !newProduct.isRemovingBg && (
 <div className="mt-1 text-xs text-green-600 flex items-center justify-center gap-1">
 <FaMagic /> Background removed!
 </div>
 )}
 </div>
 )}
 </div>

 <div>
 <input
 type="text"
 placeholder="Product Name *"
 value={newProduct.name}
 onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
 className="w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="relative">
 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-500 font-bold">₹</span>
 <input
 type="number"
 placeholder="Price *"
 value={newProduct.price}
 onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
 className="w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl pl-7 pr-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>
 <input
 type="text"
 placeholder="Category"
 value={newProduct.category}
 onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
 className="w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <div>
 <textarea
 placeholder="Product Description"
 value={newProduct.description}
 onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
 rows="2"
 className="w-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#13121A] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
 />
 </div>

 <button
 onClick={addProduct}
 disabled={!newProduct.name || !newProduct.price}
 className="w-full bg-slate-900 dark:bg-purple-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-50 transition-colors"
 >
 <FaPlus className="text-xs" /> Add Product
 </button>
 </div>
 </div>

 {/* RIGHT COLUMN - Products Grid */}
 <div className="bg-slate-50 dark:bg-[#09080E] rounded-2xl p-5 border border-slate-200 dark:border-slate-800/60">
 <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800/60">
 <h4 className="font-bold text-slate-900 dark:text-white">Your Products</h4>
 <span className="text-sm bg-purple-50 dark:bg-purple-500/10 text-purple-750 dark:text-purple-400 px-3 py-1 rounded-full font-bold">
 {products.length} {products.length === 1 ? 'item' : 'items'}
 </span>
 </div>

 {products.length === 0 ? (
 <div className="text-center py-12 text-slate-600 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-[#13121A]">
 <FaImage className="text-4xl mx-auto mb-3 opacity-55" />
 <p className="text-sm font-semibold">No products added yet</p>
 <p className="text-xs mt-1">Fill the form and click "Add Product"</p>
 </div>
 ) : (
 <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
 {products.map((p, idx) => (
 <div
 key={p.id}
 className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all duration-200 group"
 >
 <div className="flex gap-3">
 {/* Product Image */}
 <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
 {p.isRemovingBg ? (
 <div className="w-full h-full flex items-center justify-center bg-gray-200">
 <FaSpinner className="text-gray-400 animate-spin text-xl" />
 </div>
 ) : p.imagePreview ? (
 <img src={p.imagePreview} alt={p.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
 <FaImage className="text-gray-400 text-2xl" />
 </div>
 )}
 </div>

 {/* Product Details */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <h5 className="font-semibold text-gray-900 text-sm truncate" title={p.name}>
 {p.name}
 </h5>
 <div className="flex items-center gap-2 mt-1 flex-wrap">
 <span className="text-purple-650 font-bold text-sm">₹{p.price}</span>
 {p.category && (
 <span className="text-xs bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full font-semibold">
 {p.category}
 </span>
 )}
 </div>
 {p.description && (
 <p className="text-xs text-slate-600 dark:text-slate-500 mt-1 line-clamp-1">{p.description}</p>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex gap-1 flex-shrink-0">
 <button
 onClick={() => startCamera(idx)}
 className="text-purple-600 hover:text-purple-800 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
 title="Take new photo"
 >
 <FaCamera className="text-sm" />
 </button>
 <button
 onClick={() => document.getElementById(`product-image-edit-${p.id}`).click()}
 className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
 title="Upload image"
 >
 <FaUpload className="text-sm" />
 </button>
 <input
 id={`product-image-edit-${p.id}`}
 type="file"
 accept="image/*"
 capture="environment"
 onChange={(e) => handleImageUpload(e, idx)}
 className="hidden"
 />
 <button
 onClick={() => removeProduct(p.id)}
 className="text-slate-600 dark:text-slate-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
 title="Remove product"
 >
 <FaTrash className="text-sm" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Product Count Summary */}
 {products.length > 0 && (
 <div className="mt-4 pt-3 border-t border-gray-200">
 <div className="flex justify-between text-xs text-slate-600 dark:text-slate-500">
 <span>Total Products</span>
 <span className="font-semibold text-gray-900">{products.length}</span>
 </div>
 <div className="flex justify-between text-xs text-slate-600 dark:text-slate-500 mt-1">
 <span>With Images</span>
 <span className="font-semibold text-green-600">{products.filter(p => p.imagePreview).length}</span>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Publish */}
 {drawerStep === 3 && (
 <div className="space-y-6 animate-fade-in-up text-center pt-8">
 <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
 <FaCheck className="text-green-500 text-3xl" />
 </div>
 <h3 className="font-jakarta text-2xl font-bold text-slate-900 dark:text-white">Ready to Launch!</h3>
 <p className="text-slate-600 dark:text-slate-400">
 Your store is fully configured and ready to accept customers.
 </p>

 <div className="bg-white dark:bg-[#13121A] rounded-2xl p-6 text-left border border-slate-200 dark:border-slate-800/60 shadow-sm mt-8">
 <h4 className="font-bold text-slate-900 dark:text-white mb-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">Store Summary</h4>
 <div className="space-y-3 text-sm">
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Store Name:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{storeDetails.name || 'Not provided'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Phone:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{storeDetails.phone || 'Not provided'}</span>
 </div>
 {storeDetails.email && (
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Email:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{storeDetails.email}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">WhatsApp:</span>
 <span className="font-semibold text-slate-900 dark:text-white">
 {storeDetails.socialMedia?.whatsapp ? '✓ Enabled' : 'Not configured'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Template:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{previewTemplate?.name}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Products Added:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{products.length} items</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 dark:text-slate-400">Products with Images:</span>
 <span className="font-semibold text-slate-900 dark:text-white">{products.filter(p => p.imagePreview).length} items</span>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Drawer Footer / Navigation */}
 <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#09080E] shrink-0">
 <div className="flex gap-4">
 {drawerStep > 1 && (
 <button
 onClick={() => setDrawerStep(drawerStep - 1)}
 disabled={isPublishing}
 className="flex-1 py-3.5 bg-white dark:bg-[#09080E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-[#13121A] transition-colors"
 >
 Back
 </button>
 )}

 {drawerStep < 3 ? (
 <button
 onClick={() => setDrawerStep(drawerStep + 1)}
 className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
 >
 Continue <FaChevronRight className="text-sm" />
 </button>
 ) : (
 <button
 onClick={handleLaunch}
 disabled={isPublishing}
 className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
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
 <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl mb-4 border border-slate-205 flex flex-col overflow-hidden animate-fade-in-up">
 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 font-bold flex justify-between items-center shadow-sm">
 <span>Vendor AI Assistant ✨</span>
 <button onClick={() => setChatOpen(false)} className="hover:text-slate-200"><FaTimes /></button>
 </div>
 <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
 {chatHistory.map((msg, i) => (
 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[80%] rounded-xl p-3 text-sm font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
 {msg.text}
 </div>
 </div>
 ))}
 {isChatLoading && (
 <div className="flex justify-start">
 <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-1 rounded-bl-none">
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
 </div>
 </div>
 )}
 </div>
 <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
 <input
 type="text"
 value={chatMsg}
 onChange={e => setChatMsg(e.target.value)}
 onKeyPress={e => e.key === 'Enter' && handleSendChat()}
 placeholder="Ask me anything..."
 className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
 />
 <button
 onClick={handleSendChat}
 disabled={!chatMsg.trim() || isChatLoading}
 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 font-bold"
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
 <AIChatModal
 isOpen={isChatOpen}
 onClose={() => setIsChatOpen(false)}
 onBuildTriggered={handleAIBuild}
 businessId={businessId}
 storeContext={{
 template: previewTemplate ? `${previewTemplate.name} (${previewTemplate.id})` : 'None',
 businessName: storeDetails.name || 'Not set',
 description: storeDetails.tagline || 'Not set',
 phone: storeDetails.phone || 'Not set',
 email: storeDetails.email || 'Not set',
 address: storeDetails.address || 'Not set',
 products: products.map(p => ({
 name: p.name,
 price: p.price,
 description: p.description || ''
 }))
 }}
 />
 </div>

 {/* Global styles for hide scrollbar but keep functionality */}
 <style>{`
 .hide-scrollbar::-webkit-scrollbar {
 display: none;
 }
 .hide-scrollbar {
 -ms-overflow-style: none;
 scrollbar-width: none;
 }
 .custom-scrollbar::-webkit-scrollbar {
 width: 6px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: #c1c1c1;
 border-radius: 10px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: #a8a8a8;
 }
 .line-clamp-1 {
 display: -webkit-box;
 -webkit-line-clamp: 1;
 -webkit-box-orient: vertical;
 overflow: hidden;
 }
 `}</style>
 </div>
 );
}

export default Templates;