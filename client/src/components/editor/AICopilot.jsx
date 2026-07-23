import React, { useState, useEffect } from 'react';
import { FaMagic, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

const COPY_DATA = {
 heroHeading: {
 food: [
 "Savor the Art of Fine Dining",
 "Delicious Meals, Delivered Fresh",
 "Taste the Tradition of Homemade Flavor",
 "Your Daily Dose of Gourmet Delights"
 ],
 retail: [
 "Curated Goods for Better Living",
 "Elevate Your Style, Effortlessly",
 "Quality Essentials for Every Day",
 "Unique Finds You'll Love Forever"
 ],
 fashion: [
 "Define Your Personal Style",
 "Chic & Sustainable Everyday Wear",
 "Modern Elegance, Redefined",
 "Step Out in Confidence & Grace"
 ],
 general: [
 "Premium Services Tailored For You",
 "Transforming Your Daily Routine",
 "Expert Care You Can Always Trust",
 "Experience Quality Without Compromise"
 ]
 },
 heroTagline: {
 food: [
 "Handcrafted with local ingredients and a pinch of love.",
 "Indulge in a premium culinary journey from the comfort of home.",
 "Where fresh meets flavor in every single bite.",
 "Crafting unforgettable dining experiences since day one."
 ],
 retail: [
 "Explore our hand-picked collection of premium home goods and daily essentials.",
 "Durable design, sustainable materials, and timeless aesthetics for your lifestyle.",
 "Thoughtfully crafted products delivered straight to your doorstep.",
 "Simple, functional, and exceptionally made goods for modern living."
 ],
 fashion: [
 "Timeless clothing designed to make you look and feel your absolute best.",
 "Sustainable fabrics, slow-fashion ethos, and stunning fits for every season.",
 "Hand-selected styles that bridge comfort and luxury seamlessly.",
 "Exquisite tailoring and attention to detail in every single thread."
 ],
 general: [
 "Dedicated to bringing you the best solutions for your personal and professional needs.",
 "Professional expertise, friendly service, and exceptional results every time.",
 "Helping you build a better future with reliable, custom-tailored guidance.",
 "Making daily convenience simple, accessible, and completely stress-free."
 ]
 },
 announcement: {
 food: [
 "🎉 Grand Opening! Get 15% off your first online order this week.",
 "🚚 Free home delivery on all lunch orders above ₹500!",
 "⭐ New chef specials added to our signature catalog menu!",
 "🎁 Weekend Treat: Buy any 2 desserts, get a signature beverage free."
 ],
 retail: [
 "⚡ Limited Time Offer: Flat 20% off storewide. Discount applied at checkout.",
 "📦 Free shipping on all orders over ₹999 across India!",
 "✨ Fresh seasonal arrivals now in stock! Shop the new launch.",
 "🔥 Flash Sale: Extra 10% off using coupon code FRESH10."
 ],
 fashion: [
 "👗 Summer Clearance: Up to 50% off select styles. Shop now!",
 "🚚 Free express shipping on orders over ₹1500!",
 "🌟 The New Era Collection is finally here. Limited stock available.",
 "🎀 Sign up today and get ₹200 off your very first order."
 ],
 general: [
 "📅 Now booking for next week! Reserve your spot online.",
 "💡 Join our loyalty program to earn reward points on every visit.",
 "🔒 100% secure checkouts and hassle-free returns on all transactions.",
 "✨ Revamped custom layouts and new catalog updates live now."
 ]
 }
};

function AICopilot({ isOpen, onClose, onApply, fieldName, category = 'general' }) {
 const [selectedText, setSelectedText] = useState('');
 const [typedText, setTypedText] = useState('');
 const [typing, setTyping] = useState(false);

 // Normalize category to keys we support
 const activeCategory = ['food', 'retail', 'fashion'].includes(category?.toLowerCase()) 
 ? category.toLowerCase() 
 : 'general';

 const suggestions = COPY_DATA[fieldName]?.[activeCategory] || COPY_DATA[fieldName]?.['general'] || [
 "Discover our premium collection today.",
 "Expertly crafted for your unique lifestyle.",
 "Quality you can trust, service you deserve."
 ];

 useEffect(() => {
 if (isOpen) {
 setSelectedText('');
 setTypedText('');
 setTyping(false);
 }
 }, [isOpen]);

 // Simulate dynamic typing write-in animation
 const handleSelect = (text) => {
 setSelectedText(text);
 setTypedText('');
 setTyping(true);
 let index = 0;
 
 const interval = setInterval(() => {
 if (index < text.length) {
 setTypedText((prev) => prev + text.charAt(index));
 index++;
 } else {
 clearInterval(interval);
 setTyping(false);
 }
 }, 15);

 return () => clearInterval(interval);
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in">
 <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-gray-100 shadow-2xl flex flex-col justify-between">
 {/* Header */}
 <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 text-white flex justify-between items-center">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-slate-900/20 dark:bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
 <FaMagic className="text-sm" />
 </div>
 <div>
 <h3 className="font-extrabold text-sm tracking-wide">AI Copywriting Assistant</h3>
 <p className="text-[10px] opacity-80 uppercase font-black tracking-wider">Copilot for {fieldName}</p>
 </div>
 </div>
 <button 
 onClick={onClose}
 className="w-7 h-7 rounded-full bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:bg-white/20 flex items-center justify-center transition-colors text-slate-900 dark:text-white font-bold text-sm"
 >
 ×
 </button>
 </div>

 {/* Content */}
 <div className="p-6 space-y-5">
 <p className="text-xs text-gray-500 font-medium">
 Select a high-converting suggestion generated for your <span className="font-bold text-indigo-600 uppercase font-mono text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{activeCategory}</span> store:
 </p>

 {/* Suggestions List */}
 <div className="space-y-2.5">
 {suggestions.map((text, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => handleSelect(text)}
 className={`w-full text-left p-3.5 border rounded-2xl text-xs font-semibold transition-all duration-200 ${
 selectedText === text
 ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm scale-[1.01]'
 : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50 text-gray-700'
 }`}
 >
 {text}
 </button>
 ))}
 </div>

 {/* Writing Preview Box */}
 {selectedText && (
 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 relative">
 <span className="absolute -top-2 left-4 px-2 py-0.5 bg-indigo-600 text-white font-black uppercase text-[8px] tracking-wider rounded">AI Generation Preview</span>
 <p className="text-xs text-gray-800 leading-relaxed min-h-[40px] pt-1">
 {typedText}
 {typing && <span className="inline-block w-1.5 h-3.5 bg-indigo-600 ml-0.5 animate-pulse"></span>}
 </p>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={() => {
 if (selectedText) {
 onApply(selectedText);
 onClose();
 }
 }}
 disabled={!selectedText || typing}
 className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
 >
 <FaCheck className="text-[10px]" />
 Apply Suggestion
 </button>
 </div>
 </div>
 </div>
 );
}

export default AICopilot;
