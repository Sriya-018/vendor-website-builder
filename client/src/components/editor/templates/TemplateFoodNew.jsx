import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaCoffee, FaCheck, FaUtensils, FaBeer, FaMapMarkerAlt } from 'react-icons/fa';

export default function TemplateFoodNew(props) {
 const { config } = props;
 const templateId = config.template || 't25';

 // Niche preset images for AI bg overlays
 const presets = [
 { name: 'Cozy Espresso Cup', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80' },
 { name: 'Gourmet Woodfired Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
 { name: 'Amber Craft Beer', url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80' },
 { name: 'Farm Harvest Veggies', url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=80' }
 ];

 // Unique layout configuration depending on the template ID
 let themeConfig = {};
 if (templateId === 't25') {
 // Brew - Coffee House
 themeConfig = {
 layoutClass: 'bg-[#FAF6F2] text-[#3E2723]',
 fontClass: 'font-serif',
 logoTextClass: 'text-[#3E2723] font-bold text-xl uppercase tracking-widest',
 navbarClass: 'bg-[#FAF6F2]/95 border-b border-[#3E2723]/10 shadow-theme py-4',
 heroClass: 'min-h-[80vh] bg-[#3E2723] text-white',
 heroHeadingClass: 'font-serif text-5xl md:text-7xl font-light italic text-white',
 ctaButtonClass: 'bg-[#8D6E63] text-white hover:bg-[#6D4C41] rounded-none py-3 px-8 uppercase font-bold text-xs tracking-wider',
 catalogSectionClass: 'bg-[#FAF6F2] text-[#3E2723]',
 sectionHeadingClass: 'font-serif text-3xl font-bold text-[#3E2723]',
 productCardClass: 'bg-theme-surface rounded-none border border-[#3E2723]/10 hover:border-[#8D6E63] shadow-theme duration-200',
 gallerySectionClass: 'bg-[#FAF6F2] border-t border-[#3E2723]/10',
 faqSectionClass: 'bg-theme-surface border-t border-[#3E2723]/10',
 testimonialsSectionClass: 'bg-[#FAF6F2] border-t border-[#3E2723]/10',
 hoursSectionClass: 'bg-theme-surface border-t border-[#3E2723]/10',
 contactSectionClass: 'bg-[#FAF6F2] border-t border-[#3E2723]/10',
 primaryColor: '#3E2723',
 accentColor: '#8D6E63',
 defaultHeroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
 };
 } else if (templateId === 't26') {
 // Slice - Pizzeria
 themeConfig = {
 layoutClass: 'bg-theme-surface text-theme-text',
 fontClass: 'font-sans font-bold',
 logoTextClass: 'text-[#B91C1C] font-black text-2xl uppercase tracking-tighter italic',
 navbarClass: 'bg-theme-surface border-b-4 border-[#B91C1C] py-4',
 heroClass: 'min-h-[80vh] bg-[#B91C1C] text-white italic',
 heroHeadingClass: 'font-black text-6xl md:text-8xl tracking-tight uppercase text-white',
 ctaButtonClass: 'bg-[#F59E0B] text-black hover:bg-[#D97706] rounded-none py-4 px-10 font-black border-2 border-black uppercase text-xs',
 catalogSectionClass: 'bg-theme-surface text-theme-text',
 sectionHeadingClass: 'font-black text-4xl uppercase tracking-tight text-theme-text',
 productCardClass: 'bg-theme-surface border-4 border-black rounded-none shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 duration-200',
 gallerySectionClass: 'bg-red-50/30 border-t-4 border-black',
 faqSectionClass: 'bg-theme-surface border-t-4 border-black',
 testimonialsSectionClass: 'bg-red-50/30 border-t-4 border-black',
 hoursSectionClass: 'bg-theme-surface border-t-4 border-black',
 contactSectionClass: 'bg-red-50/30 border-t-4 border-black',
 primaryColor: '#B91C1C',
 accentColor: '#F59E0B',
 defaultHeroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
 };
 } else if (templateId === 't27') {
 // Hops - Brewery
 themeConfig = {
 layoutClass: 'bg-[#FAF9F6] text-[#1A1813]',
 fontClass: 'font-sans',
 logoTextClass: 'text-[#D97706] font-extrabold text-xl tracking-wide',
 navbarClass: 'bg-[#1A1813] text-white border-b border-amber-900/10 py-5',
 heroClass: 'min-h-[85vh] bg-[#1A1813] text-white',
 heroHeadingClass: 'font-extrabold text-5xl md:text-7xl leading-tight text-white uppercase tracking-tight',
 ctaButtonClass: 'bg-[#D97706] text-black hover:bg-[#C2410C] rounded-theme py-3 px-8 font-bold uppercase text-xs tracking-wider',
 catalogSectionClass: 'bg-[#FAF9F6] text-[#1A1813]',
 sectionHeadingClass: 'font-extrabold text-3xl text-[#1A1813] uppercase tracking-wide',
 productCardClass: 'bg-theme-surface rounded-theme border border-theme-border/60 shadow-theme hover:shadow-theme hover:border-amber-500/25 duration-250',
 gallerySectionClass: 'bg-[#FAF9F6] border-t border-theme-border/40',
 faqSectionClass: 'bg-theme-surface border-t border-theme-border/40',
 testimonialsSectionClass: 'bg-[#FAF9F6] border-t border-theme-border/40',
 hoursSectionClass: 'bg-theme-surface border-t border-theme-border/40',
 contactSectionClass: 'bg-[#FAF9F6] border-t border-theme-border/40',
 primaryColor: '#1A1813',
 accentColor: '#D97706',
 defaultHeroImage: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80'
 };
 } else {
 // Harvest - Farm to Table
 themeConfig = {
 layoutClass: 'bg-[#F5FFFA] text-[#2F4F4F]',
 fontClass: 'font-sans font-light',
 logoTextClass: 'text-[#2F4F4F] font-bold text-lg uppercase tracking-wider',
 navbarClass: 'bg-theme-surface border-b border-[#2F4F4F]/10 py-4 shadow-theme',
 heroClass: 'min-h-[80vh] bg-[#2F4F4F] text-white',
 heroHeadingClass: 'font-light text-5xl md:text-7xl leading-tight text-white',
 ctaButtonClass: 'bg-[#8FBC8F] text-white hover:bg-[#778899] rounded-full py-3 px-8 font-bold uppercase text-xs',
 catalogSectionClass: 'bg-[#F5FFFA] text-[#2F4F4F]',
 sectionHeadingClass: 'font-bold text-3xl tracking-tight text-[#2F4F4F]',
 productCardClass: 'bg-theme-surface border border-[#2F4F4F]/10 rounded-theme shadow-theme hover:shadow-theme duration-200',
 gallerySectionClass: 'bg-[#F5FFFA] border-t border-[#2F4F4F]/10',
 faqSectionClass: 'bg-theme-surface border-t border-[#2F4F4F]/10',
 testimonialsSectionClass: 'bg-[#F5FFFA] border-t border-[#2F4F4F]/10',
 hoursSectionClass: 'bg-theme-surface border-t border-[#2F4F4F]/10',
 contactSectionClass: 'bg-[#F5FFFA] border-t border-[#2F4F4F]/10',
 primaryColor: '#2F4F4F',
 accentColor: '#8FBC8F',
 defaultHeroImage: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1200&q=80'
 };
 }

 // State and Render for Custom Widgets depending on Template ID
 return (
 <TemplateLayoutBase
 {...props}
 templateId={templateId}
 theme={themeConfig}
 presets={presets}
 nicheSectionKey="foodWidget"
 renderNicheWidget={({ primaryColor, accentColor }) => {
 if (templateId === 't25') {
 return <BrewRoastEstimator accentColor={accentColor} />;
 } else if (templateId === 't26') {
 return <SliceToppingsBuilder accentColor={accentColor} />;
 } else if (templateId === 't27') {
 return <HopsBeerPairing accentColor={accentColor} />;
 } else {
 return <HarvestFarmOrigin accentColor={accentColor} />;
 }
 }}
 />
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Brew Roast strength estimator
// ----------------------------------------------------
function BrewRoastEstimator({ accentColor }) {
 const [roast, setRoast] = useState(2);

 const roasts = {
 1: {
 name: 'Light Roast (Cinnamon)',
 notes: 'Floral, citric acidity, tea-like body. Highlights organic seed bean characteristics.',
 temp: '196°C - 205°C First Crack'
 },
 2: {
 name: 'Medium Roast (City Roast)',
 notes: 'Balanced acidity and body. Sweet caramelization with milk chocolate undertones.',
 temp: '210°C - 219°C Caramelization'
 },
 3: {
 name: 'Dark Roast (French Espresso)',
 notes: 'Heavy body, low acidity. Bold smoky flavors, dark cocoa, and oil-rich textures.',
 temp: '225°C - 240°C Second Crack'
 }
 };

 const r = roasts[roast];

 return (
 <section className="py-20 px-8 bg-[#FAF6F2] border-t border-b border-[#3E2723]/10 text-[#3E2723] text-left font-serif">
 <div className="max-w-xl mx-auto border border-[#3E2723]/15 p-8 bg-theme-surface rounded-none shadow-theme">
 <div className="text-center mb-8 uppercase">
 <FaCoffee size={30} className="mx-auto mb-3 text-[#8D6E63]" />
 <h2 className="text-2xl font-bold">Roast Strength Estimator</h2>
 <p className="text-xs text-theme-muted lowercase mt-1.5">Adjust roast dial to check flavor parameters</p>
 </div>

 <div className="space-y-6">
 <div>
 <div className="flex justify-between font-bold text-xs mb-2">
 <span>Roasting Profile</span>
 <span>Level {roast} / 3</span>
 </div>
 <input 
 type="range" 
 min="1" 
 max="3" 
 step="1"
 value={roast} 
 onChange={(e) => setRoast(parseInt(e.target.value))}
 className="w-full accent-[#3E2723] cursor-pointer"
 />
 </div>

 <div className="mt-8 p-6 bg-[#FAF6F2] border border-[#3E2723]/10">
 <span className="text-[10px] uppercase tracking-widest font-bold text-[#8D6E63]">{r.temp}</span>
 <h4 className="text-base font-bold text-[#3E2723] mt-1">{r.name}</h4>
 <p className="text-xs font-light leading-relaxed mt-2 text-theme-muted">{r.notes}</p>
 </div>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Slice Pizzeria Toppings checklist
// ----------------------------------------------------
function SliceToppingsBuilder({ accentColor }) {
 const [toppings, setToppings] = useState({
 cheese: false,
 jalapenos: false,
 onions: false,
 oil: false
 });

 const toggleTopping = (key) => {
 setToppings(prev => ({ ...prev, [key]: !prev[key] }));
 };

 const getPriceOffset = () => {
 let offset = 0;
 if (toppings.cheese) offset += 59;
 if (toppings.jalapenos) offset += 29;
 if (toppings.onions) offset += 39;
 if (toppings.oil) offset += 49;
 return offset;
 };

 return (
 <section className="py-20 px-8 bg-theme-surface border-t-4 border-b-4 border-black text-black text-left font-sans tracking-tight">
 <div className="max-w-xl mx-auto border-4 border-black p-8 bg-theme-surface shadow-[4px_4px_0px_#000]">
 <div className="text-center mb-8 font-black uppercase italic">
 <FaUtensils size={30} className="mx-auto mb-3 text-[#B91C1C]" />
 <h2 className="text-3xl leading-none">Craft Your Slice</h2>
 <p className="text-[10px] tracking-wider text-theme-muted mt-2 italic font-bold">Select ingredients additions to check cost upgrade</p>
 </div>

 <div className="space-y-3 mb-8">
 {[
 { id: 'cheese', name: 'Extra Mozzarella Cheese', price: '₹59' },
 { id: 'jalapenos', name: 'Hot Sliced Jalapenos', price: '₹29' },
 { id: 'onions', name: 'Caramelized Sweet Onions', price: '₹39' },
 { id: 'oil', name: 'Premium Infused Truffle Oil', price: '₹49' }
 ].map(top => (
 <label
 key={top.id}
 onClick={() => toggleTopping(top.id)}
 className={`flex items-center justify-between p-4 border-2 border-black cursor-pointer font-bold text-xs select-none transition-colors ${
 toppings[top.id] ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-theme-surface hover:bg-theme-bg'
 }`}
 >
 <span>{top.name}</span>
 <span className="text-[#B91C1C] flex items-center gap-2">
 {top.price} {toppings[top.id] && <FaCheck className="text-[10px]" />}
 </span>
 </label>
 ))}
 </div>

 <div className="p-4 border-2 border-black bg-neutral-900 text-white flex justify-between items-center font-black uppercase text-xs">
 <span>Additions Price Offset</span>
 <span className="text-[#F59E0B] text-sm">+₹{getPriceOffset()}</span>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: Hops Craft Beer Pairing Selector
// ----------------------------------------------------
function HopsBeerPairing({ accentColor }) {
 const [meal, setMeal] = useState('burger');

 const pairings = {
 burger: {
 beer: 'Citra Hops Double IPA (Alc. 6.8%)',
 notes: 'The sharp bitterness cuts through the rich beef fat and aged cheddar cheese, highlighting the citra fruit hops.'
 },
 wings: {
 beer: 'Cascade Crisp Lager (Alc. 4.5%)',
 notes: 'Light, refreshing bubbles cool down the hot cayenne pepper spices and cleanse the palate between wings.'
 },
 salmon: {
 beer: 'Citrus Weissbier / Wheat Beer (Alc. 5.0%)',
 notes: 'Spicy coriander notes and zesty orange peel complement the delicate fish oils without overpowering the dish.'
 }
 };

 const p = pairings[meal];

 return (
 <section className="py-20 px-8 bg-[#FAF9F6] border-t border-b border-theme-border/40 text-[#1A1813] text-left font-sans">
 <div className="max-w-xl mx-auto border border-theme-border rounded-theme p-8 bg-theme-surface shadow-theme">
 <div className="text-center mb-8 uppercase font-extrabold">
 <FaBeer size={30} className="mx-auto mb-3 text-[#D97706]" />
 <h2 className="text-2xl">Craft Beer Pairing Guide</h2>
 <p className="text-xs font-light text-theme-muted mt-1.5 lowercase">Select your dish to find the perfect draft pour</p>
 </div>

 <div className="grid grid-cols-3 gap-2 mb-8">
 {[
 { id: 'burger', name: 'Gourmet Burger' },
 { id: 'wings', name: 'Spicy Wings' },
 { id: 'salmon', name: 'Grilled Salmon' }
 ].map(m => (
 <button
 key={m.id}
 onClick={() => setMeal(m.id)}
 className={`py-3 text-[10px] uppercase font-bold rounded-theme border transition-all ${
 meal === m.id 
 ? 'border-[#D97706] bg-[#D97706]/10 text-[#D97706]' 
 : 'border-theme-border text-theme-muted bg-theme-surface hover:border-theme-border'
 }`}
 >
 {m.name}
 </button>
 ))}
 </div>

 <div className="p-6 bg-[#1A1813] text-white rounded-theme">
 <span className="text-[10px] uppercase tracking-widest font-bold text-[#D97706]">Recommended Draft Pair</span>
 <h4 className="text-base font-bold mt-1">{p.beer}</h4>
 <p className="text-xs text-slate-350 leading-relaxed mt-2.5 font-light">{p.notes}</p>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 4: Harvest Farm Origin map
// ----------------------------------------------------
function HarvestFarmOrigin({ accentColor }) {
 const [activeTab, setActiveTab] = useState('farm');

 const reports = {
 farm: {
 title: 'Sourcing Greenhouse Farms',
 desc: 'Our vegetables are gathered from certified bio-dynamic local growers: Whispering Oaks Greenhouses in Maharashtra. Standard organic practice with zero chemical soils.'
 },
 harvest: {
 title: 'Harvesting Timestamps',
 desc: 'Crops are gathered at dawn when glucose parameters are high, packaged in biodegradable cold bags, and shipped same-day to ensure pristine leaf freshness.'
 },
 pesticide: {
 title: 'Chemical Sieve Testing',
 desc: 'Our soil and water inputs are tested monthly for heavy metal residues. Multi-spectrum testing filters out 250+ standard industrial pesticide compounds.'
 }
 };

 const r = reports[activeTab];

 return (
 <section className="py-20 px-8 bg-[#F5FFFA] border-t border-b border-[#2F4F4F]/10 text-[#2F4F4F] text-left font-sans font-light">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <FaMapMarkerAlt size={28} className="mx-auto mb-3 text-[#2F4F4F]" />
 <h2 className="text-3xl font-bold tracking-tight text-[#2F4F4F]">Freshness Verification Hub</h2>
 <div className="w-12 h-0.5 bg-[#8FBC8F] mx-auto mt-4"></div>
 </div>

 <div className="grid md:grid-cols-3 gap-3 mb-8">
 {Object.keys(reports).map(key => (
 <button
 key={key}
 onClick={() => setActiveTab(key)}
 className={`p-4 border rounded-theme transition-all text-center text-xs font-bold uppercase tracking-wider ${
 activeTab === key 
 ? 'border-[#2F4F4F] bg-theme-surface text-[#2F4F4F] shadow-theme' 
 : 'border-[#2F4F4F]/10 hover:border-[#2F4F4F]/25 text-theme-muted bg-theme-surface'
 }`}
 >
 {reports[key].title}
 </button>
 ))}
 </div>

 <div className="bg-theme-surface p-8 rounded-theme border border-[#2F4F4F]/10 shadow-theme">
 <h4 className="font-bold text-sm tracking-wide text-[#2F4F4F] border-b border-slate-50 pb-3 mb-5 uppercase">
 {r.title} Statement
 </h4>
 <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-light">{r.desc}</p>
 </div>
 </div>
 </section>
 );
}
