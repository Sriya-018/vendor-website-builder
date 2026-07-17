import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaCheck, FaInfoCircle, FaTshirt, FaRunning, FaHistory } from 'react-icons/fa';

export default function TemplateFashionNew(props) {
 const { config } = props;
 const templateId = config.template || 't16';

 // Niche preset images for AI bg overlays
 const presets = [
 { name: 'Elegant Atelier', url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80' },
 { name: 'Fitness Gym Tracker', url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80' },
 { name: 'Retro Thrift Shop', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80' }
 ];

 // Unique layout configuration depending on the template ID
 let themeConfig = {};
 if (templateId === 't16') {
 // Silk - Luxury
 themeConfig = {
 layoutClass: 'bg-[#FAF8F5] text-[#1F1610]',
 fontClass: 'font-serif',
 logoTextClass: 'text-[#1F1610] tracking-[0.2em] font-semibold',
 navbarClass: 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#FAF8F5] shadow-theme',
 heroClass: 'min-h-[85vh] bg-[#1F1610] text-[#FAF8F5]',
 heroHeadingClass: 'font-serif text-5xl md:text-7xl leading-tight font-light italic',
 ctaButtonClass: 'border border-[#D4AF37] text-[#FAF8F5] hover:bg-[#D4AF37] transition-all rounded-none',
 catalogSectionClass: 'bg-[#FAF8F5] text-[#1F1610]',
 sectionHeadingClass: 'font-serif text-4xl leading-tight font-light text-[#1F1610]',
 productCardClass: 'bg-theme-surface rounded-none border border-[#FAF8F5] shadow-theme hover:shadow-theme hover:border-[#D4AF37]/30 duration-300',
 gallerySectionClass: 'bg-[#FAF8F5]',
 faqSectionClass: 'bg-theme-surface border-t border-b border-[#FAF8F5]',
 testimonialsSectionClass: 'bg-[#FAF8F5]',
 hoursSectionClass: 'bg-theme-surface border-t border-b border-[#FAF8F5]',
 contactSectionClass: 'bg-[#FAF8F5]',
 primaryColor: '#1F1610',
 accentColor: '#D4AF37',
 defaultHeroImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'
 };
 } else if (templateId === 't17') {
 // Active - Sportswear
 themeConfig = {
 layoutClass: 'bg-theme-surface text-black',
 fontClass: 'font-sans font-extrabold tracking-tight italic',
 logoTextClass: 'text-black tracking-normal font-black text-2xl uppercase italic',
 navbarClass: 'bg-theme-surface border-b-2 border-black py-4 shadow-none',
 heroClass: 'min-h-[80vh] bg-black text-white italic',
 heroHeadingClass: 'font-black text-6xl md:text-8xl tracking-tighter uppercase leading-none',
 ctaButtonClass: 'bg-[#00D2FF] text-black hover:bg-[#00E5FF] rounded-none uppercase py-4 px-10 border-2 border-black font-black',
 catalogSectionClass: 'bg-theme-surface text-black',
 sectionHeadingClass: 'font-black text-5xl uppercase tracking-tighter',
 productCardClass: 'bg-theme-surface rounded-none border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] duration-200',
 gallerySectionClass: 'bg-theme-bg border-t-2 border-black',
 faqSectionClass: 'bg-theme-surface border-t-2 border-black',
 testimonialsSectionClass: 'bg-theme-bg border-t-2 border-black',
 hoursSectionClass: 'bg-theme-surface border-t-2 border-black',
 contactSectionClass: 'bg-theme-bg border-t-2 border-black',
 primaryColor: '#0A0A0A',
 accentColor: '#00D2FF',
 defaultHeroImage: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80'
 };
 } else {
 // Vintage - Retro Monospace
 themeConfig = {
 layoutClass: 'bg-[#F8F1EB] text-[#3C2F2F]',
 fontClass: 'font-mono',
 logoTextClass: 'text-[#3C2F2F] tracking-tighter font-bold text-xl',
 navbarClass: 'bg-[#F8F1EB]/95 border-b border-[#3C2F2F]/20',
 heroClass: 'min-h-[75vh] bg-[#3C2F2F] text-[#F8F1EB]',
 heroHeadingClass: 'font-bold text-4xl md:text-6xl tracking-tight leading-normal',
 ctaButtonClass: 'bg-[#D97706] text-white hover:bg-[#C2410C] rounded-theme py-3 px-8 shadow-theme',
 catalogSectionClass: 'bg-[#F8F1EB] text-[#3C2F2F]',
 sectionHeadingClass: 'font-bold text-3xl tracking-tight',
 productCardClass: 'bg-theme-surface border border-[#3C2F2F]/15 rounded-theme shadow-theme hover:shadow-theme hover:border-[#D97706] duration-200',
 gallerySectionClass: 'bg-[#F8F1EB] border-t border-[#3C2F2F]/10',
 faqSectionClass: 'bg-theme-surface border-t border-[#3C2F2F]/10',
 testimonialsSectionClass: 'bg-[#F8F1EB] border-t border-[#3C2F2F]/10',
 hoursSectionClass: 'bg-theme-surface border-t border-[#3C2F2F]/10',
 contactSectionClass: 'bg-[#F8F1EB] border-t border-[#3C2F2F]/10',
 primaryColor: '#3C2F2F',
 accentColor: '#D97706',
 defaultHeroImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80'
 };
 }

 // State and Render for Custom Widgets depending on Template ID
 return (
 <TemplateLayoutBase
 {...props}
 templateId={templateId}
 theme={themeConfig}
 presets={presets}
 nicheSectionKey="fashionWidget"
 renderNicheWidget={({ primaryColor, accentColor }) => {
 if (templateId === 't16') {
 return <SilkFabricGuide accentColor={accentColor} />;
 } else if (templateId === 't17') {
 return <ActiveFitFinder accentColor={accentColor} />;
 } else {
 return <VintageEraExplorer accentColor={accentColor} />;
 }
 }}
 />
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Silk Luxury Sizing & Fabric Guide
// ----------------------------------------------------
function SilkFabricGuide({ accentColor }) {
 const [selectedFabric, setSelectedFabric] = useState('silk');
 
 const fabrics = {
 silk: {
 name: 'Mulberry Silk',
 care: 'Dry clean recommended. Hand wash cold with delicate detergent only. Dry flat in shade.',
 origin: '100% natural organic mulberry silk fibers, woven into 19mm Charmeuse weight.',
 feel: 'Smooth, fluid, cool-to-touch surface with natural pearlescent drape shine.'
 },
 linen: {
 name: 'Belgian Linen',
 care: 'Machine wash warm, tumble dry low. Steaming recommended for soft crinkle texture.',
 origin: 'Flax fibers organically grown and harvested in Belgium, washed with natural enzymes.',
 feel: 'Structured, breathable, crisp textures that soften beautifully with every wash.'
 },
 cashmere: {
 name: 'Himalayan Cashmere',
 care: 'Hand wash lukewarm, do not wring. Wrap in dry towel to absorb moisture. Store folded.',
 origin: 'Inner coat fleece of high-altitude Himalayan goats, combed gently by hand.',
 feel: 'Incredibly soft, warm insulation weight with a lofty, brushed fleece cloud feel.'
 }
 };

 const f = fabrics[selectedFabric];

 return (
 <section className="py-20 px-8 bg-theme-surface border-t border-b border-[#FAF8F5] text-theme-text text-left font-serif">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <span className="text-xs uppercase tracking-[0.25em] font-bold" style={{ color: accentColor }}>Premium Materials</span>
 <h2 className="text-3xl font-light italic mt-2">Fabric Care & Sourcing Guide</h2>
 <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
 </div>

 <div className="grid md:grid-cols-3 gap-3 mb-10">
 {Object.keys(fabrics).map(key => (
 <button
 key={key}
 onClick={() => setSelectedFabric(key)}
 className={`p-4 border transition-all text-center uppercase tracking-widest text-xs font-semibold ${
 selectedFabric === key 
 ? 'border-[#D4AF37] bg-[#FAF8F5]' 
 : 'border-theme-border hover:border-theme-border'
 }`}
 >
 <FaTshirt className="mx-auto mb-2 text-base text-theme-muted" />
 {fabrics[key].name}
 </button>
 ))}
 </div>

 <div className="p-8 border border-[#FAF8F5] bg-[#FAF8F5]/50 grid md:grid-cols-2 gap-8 items-start">
 <div className="space-y-4">
 <h4 className="font-bold text-sm tracking-wide uppercase text-theme-text border-b border-theme-border pb-2">Material Sourcing</h4>
 <p className="text-sm font-light text-theme-muted leading-relaxed">{f.origin}</p>
 <h4 className="font-bold text-sm tracking-wide uppercase text-theme-text border-b border-theme-border pb-2 pt-2">Skin Feel & Weight</h4>
 <p className="text-sm font-light text-theme-muted leading-relaxed">{f.feel}</p>
 </div>
 <div className="space-y-4 bg-theme-surface p-6 border border-theme-border shadow-theme">
 <h4 className="font-bold text-sm tracking-wide uppercase text-theme-text flex items-center gap-2">
 <FaInfoCircle className="text-[#D4AF37]" /> Care Instructions
 </h4>
 <p className="text-xs font-light text-theme-muted leading-relaxed">{f.care}</p>
 </div>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Active Athletic Fit Finder Quiz
// ----------------------------------------------------
function ActiveFitFinder({ accentColor }) {
 const [height, setHeight] = useState(170);
 const [weight, setWeight] = useState(65);
 const [recommendation, setRecommendation] = useState(null);

 const calculateFit = () => {
 let size = 'Medium';
 let fitText = 'Fitted cut for active support. Provides sleek silhouette without restricting movement.';
 
 const bmi = weight / ((height / 100) ** 2);
 if (bmi < 19) {
 size = 'Small';
 fitText = 'Compressed fit for aerodynamics. Ideal for running and lightweight training.';
 } else if (bmi > 25 && bmi < 30) {
 size = 'Large';
 fitText = 'Relaxed fit with mesh panels for temperature control during heavy lifting.';
 } else if (bmi >= 30) {
 size = 'Extra Large';
 fitText = 'Loose fit engineered for raw power, heavy recovery, and optimal mobility.';
 }
 
 setRecommendation({ size, fitText });
 };

 return (
 <section className="py-20 px-8 bg-theme-bg border-t-2 border-b-2 border-black italic text-black text-left font-sans tracking-tight">
 <div className="max-w-xl mx-auto border-2 border-black p-8 bg-theme-surface shadow-[4px_4px_0px_#000]">
 <div className="text-center mb-8 uppercase font-black">
 <FaRunning size={30} className="mx-auto mb-3 text-black" />
 <h2 className="text-3xl">Find Your Performance Fit</h2>
 <p className="text-xs tracking-wider text-theme-muted mt-1">Select dimensions for accurate athletic sizing</p>
 </div>

 <div className="space-y-6">
 <div>
 <div className="flex justify-between font-black uppercase text-xs mb-2">
 <span>Height</span>
 <span>{height} cm</span>
 </div>
 <input 
 type="range" 
 min="140" 
 max="210" 
 value={height} 
 onChange={(e) => setHeight(parseInt(e.target.value))}
 className="w-full accent-black cursor-pointer"
 />
 </div>

 <div>
 <div className="flex justify-between font-black uppercase text-xs mb-2">
 <span>Weight</span>
 <span>{weight} kg</span>
 </div>
 <input 
 type="range" 
 min="40" 
 max="120" 
 value={weight} 
 onChange={(e) => setWeight(parseInt(e.target.value))}
 className="w-full accent-black cursor-pointer"
 />
 </div>

 <button
 onClick={calculateFit}
 className="w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-black hover:bg-neutral-800 transition-colors shadow-theme"
 >
 Calculate Recommended Size
 </button>

 {recommendation && (
 <div className="mt-8 p-6 bg-[#00D2FF]/10 border-2 border-[#00D2FF] text-black">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[10px] uppercase font-black tracking-widest text-theme-muted">Fit Result</span>
 <span className="text-2xl font-black uppercase bg-black text-white px-3 py-1 italic tracking-widest">{recommendation.size}</span>
 </div>
 <p className="text-xs font-bold leading-relaxed">{recommendation.fitText}</p>
 </div>
 )}
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: Vintage Era Explorer
// ----------------------------------------------------
function VintageEraExplorer({ accentColor }) {
 const [activeEra, setActiveEra] = useState('70s');

 const eras = {
 '70s': {
 title: '70s Bohemian & Disco Rock',
 desc: 'Characterized by earthy warm colors, flared legs, suede details, and bold floral textures. The peak of free-spirit design.',
 staples: ['Suede Fringe Jackets', 'Flared Corduroy Trousers', 'Floral Maxi Shirts', 'Thick Leather Buckle Belts']
 },
 '80s': {
 title: '80s Retro Synth & Power Suit',
 desc: 'Defined by bold neon highlights, shoulder pads, oversized boxy denim jackets, and structured athletic silhouettes.',
 staples: ['Acid Wash Denim Outerwear', 'Oversized Wool Blazers', 'Neon Windbreaker Pants', 'Graphic Concert Tees']
 },
 '90s': {
 title: '90s Grunge & Minimalist Street',
 desc: 'Heavy focus on plaid flannel shirts, high-waisted mom jeans, combat boot pairings, and casual oversized sportswear.',
 staples: ['Heavy Plaid Flannels', 'High-Waist Denim Jeans', 'Distressed Graphic Sweaters', 'Corduroy Dungarees']
 }
 };

 const e = eras[activeEra];

 return (
 <section className="py-20 px-8 bg-theme-surface border-t border-b border-[#3C2F2F]/10 text-[#3C2F2F] text-left font-mono">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <FaHistory size={28} className="mx-auto mb-3 text-[#D97706]" />
 <h2 className="text-2xl font-bold">Vintage Era Explorer</h2>
 <div className="w-12 h-0.5 bg-[#D97706] mx-auto mt-4"></div>
 </div>

 <div className="flex border-b border-[#3C2F2F]/20 mb-8">
 {Object.keys(eras).map(era => (
 <button
 key={era}
 onClick={() => setActiveEra(era)}
 className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
 activeEra === era 
 ? 'border-[#D97706] text-[#D97706]' 
 : 'border-transparent text-slate-400 hover:text-theme-muted'
 }`}
 >
 {era} Catalog
 </button>
 ))}
 </div>

 <div className="bg-[#F8F1EB] p-8 border border-[#3C2F2F]/10 rounded-theme grid md:grid-cols-2 gap-8 items-start">
 <div className="space-y-4">
 <h3 className="font-bold text-md text-[#D97706]">{e.title}</h3>
 <p className="text-xs leading-relaxed text-theme-muted">{e.desc}</p>
 </div>
 <div className="bg-theme-surface p-6 border border-[#3C2F2F]/10 rounded-theme">
 <h4 className="font-bold text-xs uppercase text-[#3C2F2F] border-b border-theme-border pb-2 mb-3">Era Staples</h4>
 <ul className="space-y-2 text-xs text-theme-muted">
 {e.staples.map((s, idx) => (
 <li key={idx} className="flex items-center gap-2">
 <FaCheck className="text-[#D97706] text-[10px]" />
 <span>{s}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </section>
 );
}
