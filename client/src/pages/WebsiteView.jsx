import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import TemplateAurora from '../components/editor/templates/TemplateAurora';
import TemplateSlate from '../components/editor/templates/TemplateSlate';
import TemplateBloom from '../components/editor/templates/TemplateBloom';
import TemplateCrave from '../components/editor/templates/TemplateCrave';
import TemplateHaven from '../components/editor/templates/TemplateHaven';
import TemplateNexus from '../components/editor/templates/TemplateNexus';
import TemplateVogue from '../components/editor/templates/TemplateVogue';
import TemplatePixel from '../components/editor/templates/TemplatePixel';
import TemplateGlow from '../components/editor/templates/TemplateGlow';
import TemplateBistro from '../components/editor/templates/TemplateBistro';
import TemplateLoft from '../components/editor/templates/TemplateLoft';
import TemplateZenith from '../components/editor/templates/TemplateZenith';
import TemplateTrend from '../components/editor/templates/TemplateTrend';
import TemplateSpark from '../components/editor/templates/TemplateSpark';
import TemplateFlora from '../components/editor/templates/TemplateFlora';
import TemplateFashionNew from '../components/editor/templates/TemplateFashionNew';
import TemplateElectronicsNew from '../components/editor/templates/TemplateElectronicsNew';
import TemplateBeautyNew from '../components/editor/templates/TemplateBeautyNew';
import TemplateFoodNew from '../components/editor/templates/TemplateFoodNew';
import TemplateDecorNew from '../components/editor/templates/TemplateDecorNew';
import TemplateServicesNew from '../components/editor/templates/TemplateServicesNew';

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
    contact: true
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

const ShoppingCart = ({ items, isOpen, setIsOpen, updateQuantity, removeItem, checkout, onShowHistory, pastOrdersCount, hasUpi }) => {
  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Floating Cart Button */}
      {items.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 flex items-center justify-center group"
          style={{ width: '64px', height: '64px' }}
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Your Cart
          </h2>
          <div className="flex items-center gap-2">
            {pastOrdersCount > 0 && (
              <button onClick={onShowHistory} className="text-sm text-blue-600 font-medium hover:text-blue-800 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors mr-2">
                My Orders ({pastOrdersCount})
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1" title={item.name}>{item.name}</h3>
                    <p className="text-blue-600 font-bold mt-1">₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-md shadow-sm transition-colors"
                      >-</button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-md shadow-sm transition-colors"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium">Total Amount</span>
              <span className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Select Payment Method</h3>
              <div className="space-y-2">
                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'pay_on_delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment_method" value="pay_on_delivery" checked={paymentMethod === 'pay_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-3 font-medium text-gray-700">Pay on Delivery</span>
                </label>
                {hasUpi && (
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment_method" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-3 font-medium text-gray-700">Pay via UPI</span>
                  </label>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsProcessing(true);
                checkout(paymentMethod).finally(() => setIsProcessing(false));
              }}
              disabled={isProcessing}
              className={`w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-lg hover:shadow-green-500/30`}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Checkout on WhatsApp
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const OrderSuccessModal = ({ order, paymentInfo, onClose }) => {
  if (!order) return null;

  const showUpi = order.paymentMethod === 'upi' && paymentInfo?.upiId;
  const upiString = showUpi ? `upi://pay?pa=${paymentInfo.upiId}&pn=${encodeURIComponent('Store Order')}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent('Order_' + order._id)}` : '';
  const qrUrl = upiString ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}` : '';

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
          <p className="text-gray-500 mt-2">Your order details have been populated on WhatsApp. Please send the message to complete the order.</p>
        </div>

        {paymentInfo && (order.paymentMethod === 'upi' || paymentInfo.bankDetails) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">Payment Instructions</h3>
            {paymentInfo.instructions && <p className="text-sm text-blue-600 mb-4">{paymentInfo.instructions}</p>}
            
            {showUpi && qrUrl && (
              <div className="mb-4 flex flex-col items-center bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 mb-3 rounded-lg" />
                <div className="text-sm text-gray-500 mb-1">Scan to pay exactly ₹{order.totalAmount.toFixed(2)}</div>
                <div className="font-bold text-gray-800 mb-3">{paymentInfo.upiId}</div>
                <a 
                  href={upiString} 
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  Tap to Pay (Mobile)
                </a>
              </div>
            )}

            {!qrUrl && showUpi && (
              <div className="mb-3 bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-xs text-gray-500">UPI ID</div>
                <div className="font-bold text-gray-800 break-all">{paymentInfo.upiId}</div>
              </div>
            )}

            {paymentInfo.bankDetails && (
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">Bank Details</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">{paymentInfo.bankDetails}</div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
          {order?.paymentMethod && (
            <div className="mb-4 bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-bold text-gray-900">{order.paymentMethod === 'upi' ? 'Manual UPI' : 'Pay on Delivery'}</span>
            </div>
          )}
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

const OrdersHistoryModal = ({ orders, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">You have no past orders.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <div key={order._id || i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                  <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-xs">
                  <span className={`px-2 py-1 rounded font-medium ${order.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                    {order.paymentMethod === 'upi' ? 'UPI' : 'COD'}
                  </span>
                  <span className={`px-2 py-1 rounded font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function WebsiteView({ forceSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = forceSlug || paramSlug;
  const [website, setWebsite] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [devicePreview, setDevicePreview] = useState('desktop');

  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // Load cart and orders from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) { }
    }
    const savedOrders = localStorage.getItem(`orders_${slug}`);
    if (savedOrders) {
      try {
        setPastOrders(JSON.parse(savedOrders));
      } catch (e) { }
    }
  }, [slug]);

  // Save cart to local storage on change
  useEffect(() => {
    if (website) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cartItems));
    }
  }, [cartItems, slug, website]);

  // Handle window resize for dynamic device preview matching
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setDevicePreview('mobile');
      else if (window.innerWidth < 1024) setDevicePreview('tablet');
      else setDevicePreview('desktop');
    };
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchWebsite();
  }, [slug]);

  const fetchWebsite = async () => {
    try {
      let visitorRegion = '';
      try {
        // Try freeipapi first as it is highly accurate for regional ISP routes (e.g. Vizag vs Hyderabad)
        const geoRes = await axios.get('https://freeipapi.com/api/json', { timeout: 1500 });
        if (geoRes.data && (geoRes.data.cityName || geoRes.data.city)) {
          visitorRegion = geoRes.data.cityName || geoRes.data.city;
        } else {
          // Fallback to ipapi.co
          const geoResBackup = await axios.get('https://ipapi.co/json/', { timeout: 1500 });
          if (geoResBackup.data && geoResBackup.data.city) {
            visitorRegion = geoResBackup.data.city;
          }
        }
        
        if (visitorRegion) {
          const host = window.location.hostname;
          const isDevHost = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.16.');
          if (isDevHost) {
            visitorRegion = `${visitorRegion} (Local Workspace / Dev)`;
          }
        }
      } catch (err) {
        // Fallback silently if offline or API blocked
      }

      const response = await axios.get(`${API_URL}/website/${slug}`, {
        params: visitorRegion ? { region: visitorRegion } : {}
      });
      const websiteData = response.data;
      setWebsite(websiteData);
      
      // Fetch products
      if (websiteData && websiteData.businessId) {
        const businessIdStr = websiteData.businessId._id || websiteData.businessId;
        const prodRes = await axios.get(`${API_URL}/business/${businessIdStr}/products`, {
          params: { websiteId: websiteData._id }
        });
        setProducts(prodRes.data);
      }
    } catch (error) {
      console.error('Failed to load website:', error);
    }
    setLoading(false);
  };

  // Dynamic SEO Injection
  useEffect(() => {
    if (website) {
      // Set Document Title
      const titleText = website.seo?.title || website.storeName || website.storeInfo?.businessName || 'Store';
      document.title = titleText;

      // Set Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      const descText = website.seo?.description || website.storeInfo?.description || '';
      if (descText) {
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', descText);
      }

      // Set Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      const keywordsText = website.seo?.keywords || website.storeInfo?.category || '';
      if (keywordsText) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywordsText);
      }
    }
  }, [website]);

  const handleTemplateClick = (e) => {
    // Find the closest button or anchor
    const btn = e.target.closest('button, a');
    if (!btn) return;

    // Check if it's explicitly marked or looks like a cart button
    const text = (btn.innerText || '').toLowerCase();
    const isCartBtn = text.includes('add to cart') ||
      text.includes('add to bag') ||
      text.includes('buy now') ||
      text.includes('order now') ||
      text.includes('shop now') ||
      text.includes('add to basket');

    const hasDataAttr = btn.hasAttribute('data-cart-add');

    // If it's not a cart button, let it behave normally (e.g., links)
    if (!hasDataAttr && !isCartBtn) return;

    // Prevent default navigation/submit
    if (e.target.closest('a') || e.target.closest('button')) {
      e.preventDefault();
    }

    let name = btn.getAttribute('data-product-name');
    let priceText = btn.getAttribute('data-product-price');
    let image = btn.getAttribute('data-product-image');
    let productId = btn.getAttribute('data-product-id');

    // Fallback: If data attributes are missing (legacy websites), traverse the DOM
    if (!name || !priceText) {
      let container = btn.parentElement;
      // Go up until we find a container that has an image (usually the product card wrapper)
      while (container && container !== document.body) {
        if (container.querySelector('img')) break;
        container = container.parentElement;
      }

      if (container && container !== document.body) {
        // Extract Image
        const imgEl = container.querySelector('img');
        if (imgEl && !image) image = imgEl.src;

        // Extract Price (find the first ₹ followed by numbers)
        if (!priceText) {
          const priceMatch = container.innerText.match(/₹(\d+(?:,\d{3})*(?:\.\d+)?)/);
          if (priceMatch) {
            priceText = priceMatch[1].replace(/,/g, '');
          }
        }

        // Extract Name (look for headers)
        if (!name) {
          const headings = container.querySelectorAll('h3, h4, h5, h2');
          if (headings.length > 0) {
            name = headings[0].innerText.trim();
          } else {
            // Ultimate fallback, find the first significant text line that isn't 'Product' or the price
            const lines = container.innerText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const candidate = lines.find(l => l.toLowerCase() !== 'product' && !l.includes('₹') && !l.toLowerCase().includes('buy now'));
            if (candidate) name = candidate;
          }
        }
      }
    }

    const price = parseFloat(priceText) || 0;
    name = name || 'Unknown Product';
    image = image || 'https://via.placeholder.com/150';

    setCartItems(prev => {
      const existing = prev.findIndex(i => i.name === name);
      if (existing > -1) {
        const next = [...prev];
        const nextItem = { ...next[existing] };
        nextItem.quantity += 1;
        if (!nextItem.productId && productId) {
          nextItem.productId = productId;
        }
        next[existing] = nextItem;
        return next;
      }
      return [...prev, { productId, name, price, image, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      const next = [...prev];
      const nextItem = { ...next[index] };
      nextItem.quantity += delta;
      
      if (nextItem.quantity <= 0) {
        next.splice(index, 1);
      } else {
        next[index] = nextItem;
      }
      return next;
    });
  };

  const removeItem = (index) => {
    setCartItems(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleCheckout = async (paymentMethod = 'pay_on_delivery') => {
    const bId = website?.businessId;
    const targetNumber = bId?.contact?.whatsapp || bId?.contact?.phone || bId?.vendorPhone;

    if (!targetNumber) {
      alert("This business doesn't have a WhatsApp or Phone number configured. Please ask the store owner to add their contact details.");
      return;
    }

    const businessName = bId?.businessName || 'Store';
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save local order counts for instant bestseller sorting
    try {
      const localCounts = JSON.parse(localStorage.getItem(`order_counts_${slug}`) || '{}');
      cartItems.forEach(item => {
        const identifier = item.productId || item.name;
        localCounts[identifier] = (localCounts[identifier] || 0) + item.quantity;
      });
      localStorage.setItem(`order_counts_${slug}`, JSON.stringify(localCounts));
    } catch (e) {
      console.error('Failed to save local order counts:', e);
    }

    let localOrder = { _id: Date.now().toString(), paymentStatus: 'unpaid', paymentMethod };
    try {
      const orderRes = await axios.post(`${API_URL}/business/${bId._id}/orders`, {
        websiteId: website._id,
        storeName: website.slug || businessName,
        items: cartItems.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        customerName: 'WhatsApp Customer',
        customerPhone: 'N/A', // WhatsApp checkout handles real identity
        paymentMethod,
        paymentStatus: 'unpaid'
      });
      if (orderRes.data && orderRes.data._id) {
        localOrder = orderRes.data;
      }
    } catch (error) {
      console.error('Failed to register order in database:', error);
    }

    finalizeCheckout(localOrder, targetNumber, businessName, paymentMethod === 'upi' ? 'UPI' : 'Pay on Delivery');
  };

  const finalizeCheckout = (localOrder, targetNumber, businessName, paymentText) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let message = `*New Order from ${businessName}*\n\n`;
    cartItems.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: ₹${total.toFixed(2)}*\n*Payment Method:* ${paymentText}\n\nPlease process my order.`;

    const newOrder = {
      _id: localOrder._id,
      items: cartItems,
      totalAmount: total,
      date: new Date().toISOString(),
      paymentMethod: localOrder.paymentMethod,
      paymentStatus: localOrder.paymentStatus
    };
    
    const updatedOrders = [newOrder, ...pastOrders];
    setPastOrders(updatedOrders);
    localStorage.setItem(`orders_${slug}`, JSON.stringify(updatedOrders));
    setPlacedOrder(newOrder);

    // Format phone number (remove +, spaces, etc.)
    const phone = targetNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    // Clear cart and close sidebar, open success modal
    setCartItems([]);
    setIsCartOpen(false);
    setShowOrderSuccess(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  if (!website || (!website.html && !website.designConfig)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Website not found</h1>
          <p className="text-gray-600 mt-2">This business doesn't have a website yet</p>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    if (!website) return null;
    
    let baseConfig = { ...DEFAULT_CONFIG };
    if (website.template) baseConfig.template = website.template;
    if (website.theme) baseConfig.themeColor = typeof website.theme === 'object' ? website.theme.primaryColor : website.theme;

    const siteConfig = website.designConfig || {};
    const config = { ...baseConfig, ...siteConfig };
    
    if (typeof config.themeColor === 'object' && config.themeColor !== null) {
      config.themeColor = config.themeColor.primaryColor || '#2563eb';
    }
    
    // Deep merge to guarantee all nested properties exist
    config.sectionOrder = siteConfig.sectionOrder || DEFAULT_CONFIG.sectionOrder;
    config.sections = { ...DEFAULT_CONFIG.sections, ...(siteConfig.sections || {}) };
    config.faq = { ...DEFAULT_CONFIG.faq, ...(siteConfig.faq || {}) };
    config.testimonials = { ...DEFAULT_CONFIG.testimonials, ...(siteConfig.testimonials || {}) };
    config.gallery = { ...DEFAULT_CONFIG.gallery, ...(siteConfig.gallery || {}) };
    config.countdown = { ...DEFAULT_CONFIG.countdown, ...(siteConfig.countdown || {}) };
    config.hours = { ...DEFAULT_CONFIG.hours, ...(siteConfig.hours || {}) };
    config.navbar = { ...DEFAULT_CONFIG.navbar, ...(siteConfig.navbar || {}) };
    
    // Fallback to businessName if logoText is not set or is generic
    const isGenericLogo = config.navbar.logoText === 'My Store' || config.navbar.logoText === 'My Awesome Store';
    if (!config.navbar.logoText || isGenericLogo) {
      config.navbar.logoText = website.businessId?.businessName || website.storeName;
    }
    config.header = { ...DEFAULT_CONFIG.header, ...(siteConfig.header || {}) };
    if (siteConfig.header && siteConfig.header.announcement) {
      config.header.announcement = { ...DEFAULT_CONFIG.header.announcement, ...siteConfig.header.announcement };
    }
    config.products = { ...DEFAULT_CONFIG.products, ...(siteConfig.products || {}) };
    config.typography = { ...DEFAULT_CONFIG.typography, ...(siteConfig.typography || {}) };
    config.footer = { ...DEFAULT_CONFIG.footer, ...(siteConfig.footer || {}) };
    config.trust = { ...DEFAULT_CONFIG.trust, ...(siteConfig.trust || {}) };
    if (siteConfig.trust && siteConfig.trust.badges) {
      config.trust.badges = { ...DEFAULT_CONFIG.trust.badges, ...siteConfig.trust.badges };
    }
    config.media = { ...DEFAULT_CONFIG.media, ...(siteConfig.media || {}) };
    config.beauty = { 
      ...DEFAULT_CONFIG.beauty, 
      ...(siteConfig.beauty || {}),
      routine: {
        ...DEFAULT_CONFIG.beauty.routine,
        ...((siteConfig.beauty && siteConfig.beauty.routine) || {})
      }
    };
    config.customPages = siteConfig.customPages || DEFAULT_CONFIG.customPages || [];
    
    const localCounts = (() => {
      try {
        return JSON.parse(localStorage.getItem(`order_counts_${slug}`) || '{}');
      } catch (e) {
        return {};
      }
    })();

    const displayProducts = products && products.length > 0 ? products.map((p, i) => {
      const dbCount = p.orderCount || 0;
      const localCount = localCounts[p._id] || localCounts[p.name] || 0;
      return {
        id: p._id || i,
        _id: p._id || i,
        name: p.name,
        price: p.price,
        description: p.description || '',
        category: p.category || 'general',
        img: p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`) : `https://picsum.photos/seed/${encodeURIComponent(p.name || 'product')}${i}/600/600`,
        badge: p.category ? 'new' : null,
        orderCount: dbCount + localCount,
        isBestseller: p.isBestseller || false,
        inStock: p.inStock !== false,
        stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 10,
        sizes: p.sizes || [],
        specs: p.specs || '',
        dietary: p.dietary || [],
        material: p.material || ''
      };
    }) : (config.template === 't3' || config.template === 't9' || config.template === 't15' || website?.storeInfo?.category === 'beauty' ? [
      { id: 1, _id: 1, name: 'Rosewater Glow Toner', price: 299.00, img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80', badge: 'sale', orderCount: localCounts[1] || localCounts['Rosewater Glow Toner'] || 0, isBestseller: false },
      { id: 2, _id: 2, name: 'Vitamin C Brightening Serum', price: 499.00, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', badge: 'new', orderCount: localCounts[2] || localCounts['Vitamin C Brightening Serum'] || 0, isBestseller: false },
      { id: 3, _id: 3, name: 'Hydrating Clay Cleanser', price: 349.50, img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', orderCount: localCounts[3] || localCounts['Hydrating Clay Cleanser'] || 0, isBestseller: false },
    ] : [
      { id: 1, _id: 1, name: 'Premium Wireless Headphones', price: 199.99, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', badge: 'sale', orderCount: localCounts[1] || localCounts['Premium Wireless Headphones'] || 0, isBestseller: false },
      { id: 2, _id: 2, name: 'Minimalist Wrist Watch', price: 129.50, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', badge: 'new', orderCount: localCounts[2] || localCounts['Minimalist Wrist Watch'] || 0, isBestseller: false },
      { id: 3, _id: 3, name: 'Smart Home Speaker', price: 89.99, img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66ea?w=500&q=80', orderCount: localCounts[3] || localCounts['Smart Home Speaker'] || 0, isBestseller: false },
    ]);

    const props = {
      config,
      business: website.businessId,
      products: displayProducts,
      devicePreview,
      website
    };

    switch (config.template) {
      case 't9': return <TemplateGlow {...props} />;
      case 't8': return <TemplatePixel {...props} />;
      case 't7': return <TemplateVogue {...props} />;
      case 't6': return <TemplateNexus {...props} />;
      case 't12': return <TemplateZenith {...props} />;
      case 't5': return <TemplateHaven {...props} />;
      case 't11': return <TemplateLoft {...props} />;
      case 't4': return <TemplateCrave {...props} />;
      case 't10': return <TemplateBistro {...props} />;
      case 't3': return <TemplateBloom {...props} />;
      case 't15': return <TemplateFlora {...props} />;
      case 't2': return <TemplateSlate {...props} />;
      case 't14': return <TemplateSpark {...props} />;
      case 't13': return <TemplateTrend {...props} />;
      case 't16':
      case 't17':
      case 't18':
        return <TemplateFashionNew {...props} />;
      case 't19':
      case 't20':
      case 't21':
        return <TemplateElectronicsNew {...props} />;
      case 't22':
      case 't23':
      case 't24':
        return <TemplateBeautyNew {...props} />;
      case 't25':
      case 't26':
      case 't27':
      case 't28':
        return <TemplateFoodNew {...props} />;
      case 't29':
      case 't30':
      case 't31':
      case 't32':
        return <TemplateDecorNew {...props} />;
      case 't33':
      case 't34':
      case 't35':
      case 't36':
        return <TemplateServicesNew {...props} />;
      case 't1':
      default: return <TemplateAurora {...props} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div onClick={handleTemplateClick}>
        {renderTemplate()}
      </div>
      <ShoppingCart
        items={cartItems}
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        checkout={handleCheckout}
        onShowHistory={() => { setIsCartOpen(false); setShowOrderHistory(true); }}
        pastOrdersCount={pastOrders.length}
        hasUpi={!!website?.businessId?.paymentInfo?.upiId}
      />
      {showOrderSuccess && (
        <OrderSuccessModal 
          order={placedOrder} 
          paymentInfo={website?.businessId?.paymentInfo} 
          onClose={() => setShowOrderSuccess(false)} 
        />
      )}
      {showOrderHistory && (
        <OrdersHistoryModal 
          orders={pastOrders} 
          onClose={() => setShowOrderHistory(false)} 
        />
      )}
    </div>
  );
}

export default WebsiteView;