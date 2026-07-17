import React, { useState } from 'react';
import axios from 'axios';
import { FaPaintBrush, FaMagic, FaDownload, FaGlobe, FaChevronRight, FaCheck } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const PRESETS = [
 { id: 'minimal', name: 'Minimalist Sans', font: 'Outfit', tracking: 'tracking-widest', textTransform: 'uppercase', icon: '✦' },
 { id: 'cozy', name: 'Cozy Espresso', font: 'Playfair Display', tracking: 'tracking-normal', textTransform: 'normal-case', icon: '☕' },
 { id: 'tech', name: 'Cyber Neon', font: 'Space Mono', tracking: 'tracking-wider', textTransform: 'uppercase', icon: '⚡' },
 { id: 'luxury', name: 'Luxury Editorial', font: 'Cormorant Garamond', tracking: 'tracking-widest', textTransform: 'uppercase', icon: '⚜' },
 { id: 'organic', name: 'Botanical Warm', font: 'Syne', tracking: 'tracking-wide', textTransform: 'lowercase', icon: '🌿' }
];

function BrandAssetsTab({ businessId, websites }) {
 const [brandName, setBrandName] = useState(websites?.[0]?.storeName || 'My Brand');
 const [slogan, setSlogan] = useState('Premium Quality Essentials');
 const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
 const [accentColor, setAccentColor] = useState('#6366f1');
 const [darkBackground, setDarkBackground] = useState(true);
 const [iconEmoji, setIconEmoji] = useState('✦');
 const [selectedWebsiteId, setSelectedWebsiteId] = useState(websites?.[0]?._id || '');
 const [saving, setSaving] = useState(false);
 const [successMsg, setSuccessMsg] = useState('');

 // Handle preset switch
 const handlePresetSelect = (preset) => {
 setSelectedPreset(preset);
 setIconEmoji(preset.icon);
 };

 // Convert SVG preview elements to dynamic style helpers
 const getFontFamily = (font) => {
 switch(font) {
 case 'Outfit': return "'Outfit', sans-serif";
 case 'Playfair Display': return "'Playfair Display', serif";
 case 'Space Mono': return "'Space Mono', monospace";
 case 'Cormorant Garamond': return "'Cormorant Garamond', serif";
 case 'Syne': return "'Syne', sans-serif";
 default: return 'sans-serif';
 }
 };

 // Apply to Store logic
 const handleApplyToStore = async () => {
 if (!selectedWebsiteId) {
 alert('Please select a store to update.');
 return;
 }
 setSaving(true);
 setSuccessMsg('');
 try {
 // 1. Fetch current configuration
 const webRes = await axios.get(`${API_URL}/website/${selectedWebsiteId}`);
 const site = webRes.data;
 const config = site.designConfig || {};

 // 2. Map brand assets into designConfig
 const updatedConfig = {
 ...config,
 themeColor: accentColor,
 navbar: {
 ...(config.navbar || {}),
 logoText: brandName,
 announcement: {
 ...(config.navbar?.announcement || {}),
 color: accentColor
 }
 },
 typography: {
 ...(config.typography || {}),
 heading: selectedPreset.font,
 body: selectedPreset.font === 'Playfair Display' || selectedPreset.font === 'Cormorant Garamond' ? 'Lora' : 'Outfit'
 }
 };

 // 3. Save website back to server
 await axios.put(`${API_URL}/website/update/${selectedWebsiteId}`, {
 designConfig: updatedConfig,
 theme: {
 primaryColor: site.theme?.primaryColor || accentColor,
 secondaryColor: site.theme?.secondaryColor || '#FFFFFF',
 backgroundColor: site.theme?.backgroundColor || '#FFFFFF'
 }
 });

 setSuccessMsg('Successfully applied logo styling and accent theme to your website!');
 setTimeout(() => setSuccessMsg(''), 4000);
 } catch (error) {
 console.error(error);
 alert('Failed to apply brand assets: ' + (error.response?.data?.message || error.message));
 }
 setSaving(false);
 };

 // SVG Export Utility
 const handleDownload = (elementId, filename) => {
 const svgElement = document.getElementById(elementId);
 if (!svgElement) return;

 // Create a copy of the SVG code and wrap it for download
 const svgString = new XMLSerializer().serializeToString(svgElement);
 const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
 const svgUrl = URL.createObjectURL(svgBlob);
 
 const downloadLink = document.createElement('a');
 downloadLink.href = svgUrl;
 downloadLink.download = filename;
 document.body.appendChild(downloadLink);
 downloadLink.click();
 document.body.removeChild(downloadLink);
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-slate-800 dark:text-slate-200">
 
 {/* Settings Panel - Left Column */}
 <div className="col-span-1 bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 h-fit">
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white tracking-wide">Brand Settings</h3>
 <p className="text-slate-600 dark:text-slate-500 text-xs mt-1">Design customizable corporate vectors for your storefront</p>
 </div>

 {/* Form Inputs */}
 <div className="space-y-4 text-xs">
 <div>
 <label className="block text-slate-600 dark:text-slate-450 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Brand Name</label>
 <input 
 type="text" 
 value={brandName}
 onChange={(e) => setBrandName(e.target.value)}
 className="w-full p-2.5 bg-slate-100 dark:bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-semibold"
 maxLength={24}
 />
 </div>

 <div>
 <label className="block text-slate-600 dark:text-slate-450 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Brand Slogan</label>
 <input 
 type="text" 
 value={slogan}
 onChange={(e) => setSlogan(e.target.value)}
 className="w-full p-2.5 bg-slate-100 dark:bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-semibold"
 maxLength={40}
 />
 </div>

 <div>
 <label className="block text-slate-600 dark:text-slate-450 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Icon / Symbol</label>
 <input 
 type="text" 
 value={iconEmoji}
 onChange={(e) => setIconEmoji(e.target.value)}
 className="w-full p-2.5 bg-slate-100 dark:bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center text-white outline-none focus:border-indigo-500 font-bold"
 placeholder="e.g. ✦"
 />
 </div>

 <div>
 <label className="block text-slate-600 dark:text-slate-450 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Brand Color Accent</label>
 <div className="flex items-center gap-3">
 <input 
 type="color" 
 value={accentColor}
 onChange={(e) => setAccentColor(e.target.value)}
 className="w-9 h-9 bg-transparent border-0 cursor-pointer outline-none rounded-xl"
 />
 <span className="font-mono text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">{accentColor}</span>
 </div>
 </div>

 <div className="flex items-center justify-between py-2 border-t border-b border-slate-200 dark:border-slate-800/40">
 <span className="font-bold text-slate-600 dark:text-slate-400">Dark Mode Previews</span>
 <input 
 type="checkbox" 
 checked={darkBackground} 
 onChange={(e) => setDarkBackground(e.target.checked)} 
 className="w-4 h-4 accent-indigo-600 cursor-pointer"
 />
 </div>

 {/* Presets Selection */}
 <div className="space-y-2">
 <label className="block text-slate-600 dark:text-slate-450 font-bold uppercase text-[9px] tracking-wider">Typography Style Presets</label>
 <div className="grid grid-cols-1 gap-2">
 {PRESETS.map((p) => (
 <button
 key={p.id}
 type="button"
 onClick={() => handlePresetSelect(p)}
 className={`w-full text-left p-3 border rounded-xl text-xs transition-all ${
 selectedPreset.id === p.id 
 ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white font-bold' 
 : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 hover:border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-200'
 }`}
 >
 <span className="block font-medium">{p.name}</span>
 <span className="text-[9px] text-slate-600 dark:text-slate-500 mt-0.5 block">{p.font} font • {p.tracking}</span>
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Preview Panel - Right Columns */}
 <div className="col-span-2 space-y-6">
 
 {/* Sync Store Selection */}
 <div className="bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="text-xs">
 <h4 className="font-black text-slate-900 dark:text-white text-sm">Synchronize with Storefront</h4>
 <p className="text-slate-600 dark:text-slate-500 mt-1">Apply your generated logo typography and color presets to one of your active live templates.</p>
 </div>
 <div className="flex gap-3 w-full md:w-auto shrink-0">
 <select 
 value={selectedWebsiteId} 
 onChange={(e) => setSelectedWebsiteId(e.target.value)}
 className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200"
 >
 {websites?.map((w) => (
 <option key={w._id} value={w._id}>{w.storeName}</option>
 ))}
 {(!websites || websites.length === 0) && (
 <option value="">No Store Available</option>
 )}
 </select>
 <button
 onClick={handleApplyToStore}
 disabled={saving || !selectedWebsiteId}
 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
 >
 {saving ? 'Syncing...' : 'Sync to Store'} <FaChevronRight className="text-[9px]" />
 </button>
 </div>
 </div>

 {/* Success message popup notification inside tab */}
 {successMsg && (
 <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
 <FaCheck className="text-xs shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* Previews List */}
 <div className="space-y-6">
 
 {/* 1. Header Logo */}
 <div className="bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative group">
 <div className="flex justify-between items-center mb-4">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Asset 1: Store Header Logo Vector</span>
 <button 
 onClick={() => handleDownload('svg-header-logo', `${brandName.toLowerCase()}-header-logo.svg`)}
 className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
 title="Download Vector SVG"
 >
 <FaDownload className="text-xs" />
 </button>
 </div>
 
 <div className={`h-40 rounded-2xl border border-slate-200 dark:border-slate-800/40 flex items-center justify-center p-8 transition-colors ${darkBackground ? 'bg-[#0F172A]' : 'bg-white'}`}>
 <svg id="svg-header-logo" width="100%" height="80" viewBox="0 0 350 80" className="w-full max-w-[280px]">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&display=swap');
 `}</style>
 <g>
 {/* Icon */}
 <text 
 x="25" 
 y="48" 
 fill={accentColor} 
 fontSize="32" 
 textAnchor="middle" 
 dominantBaseline="middle"
 >
 {iconEmoji}
 </text>
 {/* Logo Text */}
 <text
 x="55"
 y="45"
 fill={darkBackground ? '#FFFFFF' : '#0F172A'}
 fontSize="22"
 fontWeight="800"
 textAnchor="start"
 dominantBaseline="middle"
 style={{ 
 fontFamily: getFontFamily(selectedPreset.font),
 textTransform: selectedPreset.textTransform,
 letterSpacing: selectedPreset.id === 'minimal' ? '0.15em' : 'normal'
 }}
 >
 {brandName}
 </text>
 </g>
 </svg>
 </div>
 </div>

 {/* Row for Favicon and Banner */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 
 {/* 2. Square Favicon Avatar */}
 <div className="col-span-1 bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative group flex flex-col justify-between">
 <div className="flex justify-between items-center mb-4">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Favicon Icon</span>
 <button 
 onClick={() => handleDownload('svg-favicon', `${brandName.toLowerCase()}-favicon.svg`)}
 className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
 title="Download Vector SVG"
 >
 <FaDownload className="text-xs" />
 </button>
 </div>

 <div className={`h-36 rounded-2xl border border-slate-200 dark:border-slate-800/40 flex items-center justify-center p-4 transition-colors ${darkBackground ? 'bg-[#0F172A]' : 'bg-white'}`}>
 <svg id="svg-favicon" width="80" height="80" viewBox="0 0 80 80">
 <rect width="80" height="80" rx="18" fill={accentColor} />
 <text 
 x="40" 
 y="42" 
 fill="#FFFFFF" 
 fontSize="38" 
 fontWeight="bold"
 textAnchor="middle" 
 dominantBaseline="middle"
 >
 {brandName.charAt(0).toUpperCase()}
 </text>
 </svg>
 </div>
 </div>

 {/* 3. Promo Banner */}
 <div className="col-span-2 bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative group flex flex-col justify-between">
 <div className="flex justify-between items-center mb-4">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Asset 3: Promo / Social OpenGraph Banner</span>
 <button 
 onClick={() => handleDownload('svg-banner', `${brandName.toLowerCase()}-social-banner.svg`)}
 className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
 title="Download Vector SVG"
 >
 <FaDownload className="text-xs" />
 </button>
 </div>

 <div className={`h-36 rounded-2xl border border-slate-200 dark:border-slate-800/40 flex items-center justify-center p-6 transition-colors overflow-hidden ${darkBackground ? 'bg-[#0F172A]' : 'bg-white'}`}>
 <svg id="svg-banner" width="300" height="120" viewBox="0 0 300 120" className="w-full">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&display=swap');
 `}</style>
 {/* Background graphic */}
 <rect width="300" height="120" fill={darkBackground ? '#0F172A' : '#F8FAFC'} />
 <circle cx="280" cy="100" r="40" fill={accentColor} opacity="0.15" />
 <circle cx="20" cy="20" r="30" fill={accentColor} opacity="0.1" />

 {/* Brand Title */}
 <text 
 x="150" 
 y="50" 
 fill={darkBackground ? '#FFFFFF' : '#0F172A'}
 fontSize="22" 
 fontWeight="800"
 textAnchor="middle" 
 dominantBaseline="middle"
 style={{ 
 fontFamily: getFontFamily(selectedPreset.font),
 textTransform: selectedPreset.textTransform,
 letterSpacing: selectedPreset.id === 'minimal' ? '0.1em' : 'normal'
 }}
 >
 {brandName}
 </text>

 {/* Slogan */}
 <text 
 x="150" 
 y="80" 
 fill={darkBackground ? '#94A3B8' : '#64748B'}
 fontSize="10" 
 fontWeight="bold"
 textAnchor="middle" 
 dominantBaseline="middle"
 style={{ 
 fontFamily: getFontFamily(selectedPreset.font === 'Space Mono' ? 'Space Mono' : 'Outfit'),
 letterSpacing: '0.12em',
 textTransform: 'uppercase'
 }}
 >
 {slogan}
 </text>

 {/* Top Bar Accent */}
 <rect width="300" height="4" fill={accentColor} />
 </svg>
 </div>
 </div>

 </div>

 </div>

 </div>

 </div>
 );
}

export default BrandAssetsTab;
