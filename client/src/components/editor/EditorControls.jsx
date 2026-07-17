import React, { useState } from 'react';
import { 
 FaChevronDown, FaChevronUp, FaPalette, FaFont, FaBars, FaImage, FaGripHorizontal, 
 FaMousePointer, FaMobileAlt, FaListAlt, FaShieldAlt, FaBullhorn, FaSearch, FaUniversalAccess, FaHistory
, FaClock, FaDesktop} from 'react-icons/fa';
import AICopilot from './AICopilot';

const AccordionContext = React.createContext();

const Section = ({ id, title, icon: Icon, children }) => {
 const { openSection, setOpenSection } = React.useContext(AccordionContext);
 const isOpen = openSection === id;
 return (
 <div className="border-b border-gray-100 dark:border-slate-800/60 last:border-b-0">
 <button 
 type="button"
 onClick={() => setOpenSection(isOpen ? null : id)}
 className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#13121A] dark:bg-[#13121A] transition-colors"
 >
 <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-slate-200">
 {Icon && <Icon className="text-gray-400 dark:text-slate-500 text-lg" />}
 {title}
 </div>
 {isOpen ? <FaChevronUp className="text-gray-400 dark:text-slate-500 text-sm" /> : <FaChevronDown className="text-gray-400 dark:text-slate-500 text-sm" />}
 </button>
 {isOpen && (
 <div className="p-5 pt-0 bg-white dark:bg-[#09080E] animate-fade-in space-y-5">
 {children}
 </div>
 )}
 </div>
 );
};

const THEMES = [
 { name: 'Blue', color: '#2563eb' },
 { name: 'Red', color: '#dc2626' },
 { name: 'Green', color: '#16a34a' },
 { name: 'Purple', color: '#9333ea' },
 { name: 'Orange', color: '#ea580c' },
 { name: 'Dark', color: '#1f2937' },
];

const TEMPLATES = [
 { id: 't1', name: 'Aurora', category: 'Fashion', desc: 'Clean fashion, light, minimal' },
 { id: 't2', name: 'Slate', category: 'Electronics', desc: 'Dark, tech, electronics' },
 { id: 't3', name: 'Bloom', category: 'Beauty', desc: 'Soft pink, beauty, cosmetics' },
 { id: 't4', name: 'Crave', category: 'Food & Beverage', desc: 'Warm, food, restaurant' },
 { id: 't5', name: 'Haven', category: 'Home Decor', desc: 'Home, cozy, interior' },
 { id: 't6', name: 'Nexus', category: 'Services', desc: 'Modern, corporate, bold' },
 { id: 't7', name: 'Vogue', category: 'Fashion', desc: 'High-end fashion, luxury' },
 { id: 't8', name: 'Pixel', category: 'Electronics', desc: 'Tech, retro, gaming' },
 { id: 't9', name: 'Glow', category: 'Beauty', desc: 'Neon, nightlife, fitness' },
 { id: 't10', name: 'Bistro', category: 'Food & Beverage', desc: 'Elegant dark, food, cafe' },
 { id: 't11', name: 'Loft', category: 'Home Decor', desc: 'Scandinavian, cozy, design' },
 { id: 't12', name: 'Zenith', category: 'Services', desc: 'Corporate tech, services' },
 { id: 't13', name: 'Trend', category: 'Fashion', desc: 'Chic fashion, rose, minimal' },
 { id: 't14', name: 'Spark', category: 'Electronics', desc: 'Sleek dark, tech, hardware' },
 { id: 't15', name: 'Flora', category: 'Beauty', desc: 'Botanical beauty, organic' },
 { id: 't16', name: 'Silk', category: 'Fashion', desc: 'Luxurious fashion design, serif typography' },
 { id: 't17', name: 'Active', category: 'Fashion', desc: 'Bold high-contrast athletic activewear' },
 { id: 't18', name: 'Vintage', category: 'Fashion', desc: 'Retro thrift style, sepia, monospace' },
 { id: 't19', name: 'Quantum', category: 'Electronics', desc: 'Deep violet neon glow gaming hardware' },
 { id: 't20', name: 'Aero', category: 'Electronics', desc: 'Light, clean modern specs sheets layout' },
 { id: 't21', name: 'RetroTech', category: 'Electronics', desc: '8-bit themed layout with classic console beep sound' },
 { id: 't22', name: 'Onyx', category: 'Beauty', desc: 'Luxury matte black beauty & cosmetics' },
 { id: 't23', name: 'Mist', category: 'Beauty', desc: 'Fresh water themed spa & skincare' },
 { id: 't24', name: 'Petal', category: 'Beauty', desc: 'Royal floral botanical perfumery layout' },
 { id: 't25', name: 'Brew', category: 'Food & Beverage', desc: 'Cozy espresso styling & roast estimator' },
 { id: 't26', name: 'Slice', category: 'Food & Beverage', desc: 'Energetic red pizzeria topping builder' },
 { id: 't27', name: 'Hops', category: 'Food & Beverage', desc: 'Rustic dark industrial craft pub styling' },
 { id: 't28', name: 'Harvest', category: 'Food & Beverage', desc: 'Earthy farm-to-table veggies and local sourcing' },
 { id: 't29', name: 'Manor', category: 'Home Decor', desc: 'Classic mahogany luxury furniture setups' },
 { id: 't30', name: 'Patio', category: 'Home Decor', desc: 'Sunny garden porch weather rating grids' },
 { id: 't31', name: 'Urban', category: 'Home Decor', desc: 'Concrete industrial steel swatches' },
 { id: 't32', name: 'Zen', category: 'Home Decor', desc: 'Bamboo sand layout feng shui placements' },
 { id: 't33', name: 'Pulse', category: 'Services', desc: 'Gym red high energy fitness training calculator' },
 { id: 't34', name: 'Scale', category: 'Services', desc: 'Navy trustworthy consulting ROI calculator' },
 { id: 't35', name: 'PixelCraft', category: 'Services', desc: 'Creative modern design agency portfolio toggle' },
 { id: 't36', name: 'Care', category: 'Services', desc: 'Calm medical appointment planner layout' }
];

function EditorControls({ config, setConfig, website }) {
 const [openSection, setOpenSection] = useState('template'); // default open
 const [draggedIdx, setDraggedIdx] = useState(null);
 const [dragOverIdx, setDragOverIdx] = useState(null);
 const [editingPageId, setEditingPageId] = useState(null);
 const [copilotOpen, setCopilotOpen] = useState(false);
 const [copilotField, setCopilotField] = useState('');
 const [copilotCallback, setCopilotCallback] = useState(null);

 const openCopilot = (fieldName, callback) => {
 setCopilotField(fieldName);
 setCopilotCallback(() => callback);
 setCopilotOpen(true);
 };

 const updateConfig = (category, field, value) => {
 setConfig(prev => {
 // If it's a top-level flat value
 if (typeof prev[category] !== 'object') {
 return { ...prev, [category]: value };
 }
 // If it's nested
 return {
 ...prev,
 [category]: {
 ...prev[category],
 [field]: value
 }
 };
 });
 };

 return (
 <AccordionContext.Provider value={{ openSection, setOpenSection }}>
 <div className="flex flex-col h-full bg-white dark:bg-[#09080E] text-sm">
 <div className="p-5 border-b border-gray-200 dark:border-slate-700/60 bg-gray-50 dark:bg-[#13121A] sticky top-0 z-10 shadow-sm">
 <h2 className="font-black text-gray-900 dark:text-white text-lg">Design Controls</h2>
 <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">Configure your store appearance</p>
 </div>

 <div className="flex-1 overflow-y-auto">
 
 {/* 1. Layout Template */}
 <Section id="template" title="1. Layout Template" icon={FaGripHorizontal}>
 <div className="space-y-3">
 {(website 
 ? TEMPLATES.filter(t => t.category === (TEMPLATES.find(ct => ct.id === config.template)?.category || 'General'))
 : TEMPLATES
 ).map(t => (
 <div 
 key={t.id}
 onClick={() => setConfig(prev => ({ ...prev, template: t.id }))}
 className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${config.template === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700/60 hover:border-gray-300 dark:hover:border-slate-500 dark:border-slate-600/60'}`}
 >
 <div className="font-bold text-gray-900 dark:text-white">{t.name} <span className="ml-2 text-[10px] font-normal px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400">{t.category}</span></div>
 <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t.desc}</div>
 </div>
 ))}
 </div>
 </Section>

 {/* Layout & Section Designer */}
 <Section id="sectionsDesigner" title="Layout & Section Order" icon={FaGripHorizontal}>
 <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 font-medium">Drag sections by the grid handle or use arrows to arrange your landing page layout.</p>
 <div className="space-y-2.5">
 {(config.sectionOrder || ['hero', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact', 'countdown']).map((key, idx) => {
 const sections = config.sections || {
 hero: true,
 products: true,
 gallery: true,
 faq: true,
 testimonials: true,
 hours: true,
 contact: true,
 countdown: true
 };
 const isVisible = sections[key] !== false;
 const orderList = config.sectionOrder || ['hero', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact', 'countdown'];
 
 const toggleVisibility = () => {
 updateConfig('sections', key, !isVisible);
 };

 const move = (direction) => {
 const newOrder = [...orderList];
 if (direction === 'up' && idx > 0) {
 newOrder[idx] = newOrder[idx - 1];
 newOrder[idx - 1] = key;
 } else if (direction === 'down' && idx < newOrder.length - 1) {
 newOrder[idx] = newOrder[idx + 1];
 newOrder[idx + 1] = key;
 }
 setConfig(prev => ({ ...prev, sectionOrder: newOrder }));
 };

 const isDragged = draggedIdx === idx;
 const isDragOver = dragOverIdx === idx;

 return (
 <div 
 key={key} 
 draggable
 onDragStart={(e) => {
 setDraggedIdx(idx);
 e.dataTransfer.effectAllowed = 'move';
 }}
 onDragOver={(e) => {
 e.preventDefault();
 if (draggedIdx !== idx) setDragOverIdx(idx);
 }}
 onDragEnd={() => {
 setDraggedIdx(null);
 setDragOverIdx(null);
 }}
 onDrop={(e) => {
 e.preventDefault();
 if (draggedIdx === null || draggedIdx === idx) return;
 const newOrder = [...orderList];
 const draggedItem = newOrder[draggedIdx];
 newOrder.splice(draggedIdx, 1);
 newOrder.splice(idx, 0, draggedItem);
 setConfig(prev => ({ ...prev, sectionOrder: newOrder }));
 setDraggedIdx(null);
 setDragOverIdx(null);
 }}
 className={`flex items-center justify-between p-3 border rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
 isDragged 
 ? 'opacity-45 border-dashed border-indigo-400 bg-indigo-50/30' 
 : isDragOver
 ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-sm'
 : 'bg-gray-50 dark:bg-[#13121A] border-gray-200 dark:border-slate-700/60 hover:border-gray-300 dark:hover:border-slate-500 dark:border-slate-600/60 hover:bg-gray-100 dark:hover:bg-[#1A1924] dark:bg-[#1A1924]/50'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className="text-gray-400 dark:text-slate-500 cursor-grab active:cursor-grabbing">
 <FaGripHorizontal className="text-xs" />
 </span>
 <input 
 type="checkbox" 
 checked={isVisible} 
 onChange={toggleVisibility} 
 className="w-4 h-4 accent-indigo-600 cursor-pointer" 
 />
 <span className="font-bold text-gray-700 dark:text-slate-300 capitalize text-xs tracking-wide">{key} Section</span>
 </div>
 <div className="flex items-center gap-1">
 <button 
 type="button"
 onClick={() => move('up')} 
 disabled={idx <= 0}
 className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 rounded disabled:opacity-20 transition-colors"
 title="Move Up"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"/></svg>
 </button>
 <button 
 type="button"
 onClick={() => move('down')} 
 disabled={idx >= orderList.length - 1}
 className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 rounded disabled:opacity-20 transition-colors"
 title="Move Down"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </Section>

 {/* Conditional Beauty & Skincare Settings (Only for Bloom template) */}
 {config.template === 't3' && (
 <Section id="beautySettings" title="Skincare & Beauty Settings" icon={FaPalette}>
 <div className="space-y-6">
 
 {/* Ingredients Customizer */}
 <div className="space-y-3">
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-2">
 <span className="font-bold text-gray-800 dark:text-slate-200 text-xs uppercase tracking-wider">1. Key Ingredients Highlight</span>
 <button 
 onClick={() => {
 const currentIng = config.beauty?.ingredients || [];
 const updated = [...currentIng, { id: Date.now().toString(), name: 'New Ingredient', desc: 'Soothes and hydrates.', icon: '🌿' }];
 updateConfig('beauty', 'ingredients', updated);
 }}
 className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#EC4899] font-bold rounded-lg text-[10px] transition-colors"
 >
 + Add Ingredient
 </button>
 </div>
 
 <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
 {(config.beauty?.ingredients || []).map((item, idx) => (
 <div key={item.id || idx} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-150 dark:border-slate-700/60 rounded-xl space-y-2 relative">
 <button 
 onClick={() => {
 const currentIng = config.beauty?.ingredients || [];
 const updated = currentIng.filter(ing => ing.id !== item.id);
 updateConfig('beauty', 'ingredients', updated);
 }}
 className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500 font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-slate-800"
 title="Delete Ingredient"
 >
 ×
 </button>
 <div className="flex gap-2">
 <div className="w-12">
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Icon</label>
 <input 
 type="text"
 value={item.icon}
 onChange={(e) => {
 const currentIng = config.beauty?.ingredients || [];
 const updated = currentIng.map(ing => ing.id === item.id ? { ...ing, icon: e.target.value } : ing);
 updateConfig('beauty', 'ingredients', updated);
 }}
 className="w-full p-1 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-center text-sm outline-none focus:border-pink-500 dark:focus:border-pink-400"
 />
 </div>
 <div className="flex-1">
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Ingredient Name</label>
 <input 
 type="text"
 value={item.name}
 onChange={(e) => {
 const currentIng = config.beauty?.ingredients || [];
 const updated = currentIng.map(ing => ing.id === item.id ? { ...ing, name: e.target.value } : ing);
 updateConfig('beauty', 'ingredients', updated);
 }}
 className="w-full p-1 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-pink-400"
 />
 </div>
 </div>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Description</label>
 <textarea 
 value={item.desc}
 onChange={(e) => {
 const currentIng = config.beauty?.ingredients || [];
 const updated = currentIng.map(ing => ing.id === item.id ? { ...ing, desc: e.target.value } : ing);
 updateConfig('beauty', 'ingredients', updated);
 }}
 rows={2}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-[11px] text-gray-600 dark:text-slate-400 resize-none outline-none focus:border-pink-500 dark:focus:border-pink-400"
 />
 </div>
 </div>
 ))}
 {(config.beauty?.ingredients || []).length === 0 && (
 <p className="text-gray-400 dark:text-slate-500 text-xs italic text-center py-2">No ingredients configured. Add one above.</p>
 )}
 </div>
 </div>

 {/* Routine Customizer */}
 <div className="space-y-3 pt-2 border-t border-gray-150 dark:border-slate-700/60">
 <span className="font-bold text-gray-800 dark:text-slate-200 text-xs uppercase tracking-wider block">2. Daily Skincare Routine Steps</span>
 
 <div className="space-y-2">
 <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Routine Title</label>
 <input 
 type="text"
 value={config.beauty?.routine?.title || 'Your Daily Glow Routine'}
 onChange={(e) => {
 const currentRoutine = config.beauty?.routine || {};
 updateConfig('beauty', 'routine', { ...currentRoutine, title: e.target.value });
 }}
 className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-lg text-xs font-bold text-gray-800 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-pink-400"
 />
 </div>

 <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
 {(config.beauty?.routine?.steps || []).map((step, idx) => (
 <div key={step.id || idx} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-150 dark:border-slate-700/60 rounded-xl space-y-2">
 <div className="flex items-center gap-2">
 <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
 {step.num || `0${idx + 1}`}
 </span>
 <input 
 type="text"
 value={step.title}
 onChange={(e) => {
 const currentRoutine = config.beauty?.routine || {};
 const updatedSteps = currentRoutine.steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
 updateConfig('beauty', 'routine', { ...currentRoutine, steps: updatedSteps });
 }}
 className="flex-1 p-1 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-pink-400"
 placeholder="Step Title"
 />
 </div>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Instruction Text</label>
 <textarea 
 value={step.text}
 onChange={(e) => {
 const currentRoutine = config.beauty?.routine || {};
 const updatedSteps = currentRoutine.steps.map(s => s.id === step.id ? { ...s, text: e.target.value } : s);
 updateConfig('beauty', 'routine', { ...currentRoutine, steps: updatedSteps });
 }}
 rows={2}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-[11px] text-gray-600 dark:text-slate-400 resize-none outline-none focus:border-pink-500 dark:focus:border-pink-400"
 placeholder="Step Instruction"
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </Section>
 )}

 {/* 2. Theme Color */}
 <Section id="themeColor" title="2. Theme Color" icon={FaPalette}>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Primary Color</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.primary || '#000000'} onChange={(e) => updateConfig('theme', 'primary', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.primary || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Secondary</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.secondary || '#000000'} onChange={(e) => updateConfig('theme', 'secondary', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.secondary || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Accent</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.accent || '#000000'} onChange={(e) => updateConfig('theme', 'accent', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.accent || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Background</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.background || '#ffffff'} onChange={(e) => updateConfig('theme', 'background', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.background || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Surface</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.surface || '#ffffff'} onChange={(e) => updateConfig('theme', 'surface', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.surface || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Text</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.text || '#000000'} onChange={(e) => updateConfig('theme', 'text', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.text || 'Default'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Muted Text</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.muted || '#6b7280'} onChange={(e) => updateConfig('theme', 'muted', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.muted || '#6b7280'}</span>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Border</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.theme?.border || '#e5e7eb'} onChange={(e) => updateConfig('theme', 'border', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase font-mono">{config.theme?.border || '#e5e7eb'}</span>
 </div>
 </div>
 </div>
 </div>
 </Section>

 {/* 3. Typography */}
 <Section id="typography" title="3. Typography" icon={FaFont}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Heading Font</label>
 <select 
 value={config.typography.headingFont} 
 onChange={(e) => updateConfig('typography', 'headingFont', e.target.value)}
 className="w-full border-gray-300 dark:border-slate-600/60 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-[#13121A] border font-semibold text-gray-800 dark:text-slate-200"
 >
 <optgroup label="System Standard">
 <option value="sans">Sans-serif (Inter, Roboto)</option>
 <option value="serif">Serif (Playfair, Georgia)</option>
 <option value="mono">Monospace (Fira Code)</option>
 <option value="display">Display (Righteous)</option>
 </optgroup>
 <optgroup label="Premium Google Fonts">
 <option value="Outfit">Outfit (Modern Geometrical)</option>
 <option value="Montserrat">Montserrat (Minimalist Bold)</option>
 <option value="Plus Jakarta Sans">Plus Jakarta Sans (Tech Clean)</option>
 <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
 <option value="Cormorant Garamond">Cormorant Garamond (Classic Luxe)</option>
 <option value="Lora">Lora (Readability Serif)</option>
 <option value="Cabinet Grotesk">Cabinet Grotesk (Neo-Brutalist)</option>
 <option value="Bricolage Grotesque">Bricolage Grotesque (Quirky Display)</option>
 <option value="Syne">Syne (Artistic Display)</option>
 <option value="Oswald">Oswald (Industrial Display)</option>
 <option value="Space Mono">Space Mono (Retro Code)</option>
 </optgroup>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Body Font</label>
 <select 
 value={config.typography.bodyFont} 
 onChange={(e) => updateConfig('typography', 'bodyFont', e.target.value)}
 className="w-full border-gray-300 dark:border-slate-600/60 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-[#13121A] border font-semibold text-gray-800 dark:text-slate-200"
 >
 <optgroup label="System Standard">
 <option value="sans">Sans-serif</option>
 <option value="serif">Serif</option>
 <option value="mono">Monospace</option>
 </optgroup>
 <optgroup label="Premium Google Fonts">
 <option value="Outfit">Outfit</option>
 <option value="Montserrat">Montserrat</option>
 <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
 <option value="Lora">Lora</option>
 <option value="Cormorant Garamond">Cormorant Garamond</option>
 <option value="Space Mono">Space Mono</option>
 </optgroup>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Base Font Size: {config.typography.baseSize}px</label>
 <input 
 type="range" min="12" max="20" 
 value={config.typography.baseSize} 
 onChange={(e) => updateConfig('typography', 'baseSize', Number(e.target.value))}
 className="w-full accent-blue-600"
 />
 </div>
 <div className="flex gap-2">
 <div className="flex-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Line Height</label>
 <select value={config.typography.lineHeight} onChange={(e) => updateConfig('typography', 'lineHeight', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="compact">Compact</option>
 <option value="normal">Normal</option>
 <option value="relaxed">Relaxed</option>
 </select>
 </div>
 <div className="flex-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Letter Spacing</label>
 <select value={config.typography.letterSpacing} onChange={(e) => updateConfig('typography', 'letterSpacing', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="tight">Tight</option>
 <option value="normal">Normal</option>
 <option value="wide">Wide</option>
 </select>
 </div>
 </div>
 </div>
 </Section>

 {/* 4. Navbar */}
 <Section id="navbar" title="4. Navigation Bar" icon={FaBars}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Store Name / Logo Text</label>
 <input 
 type="text" value={config.navbar.logoText} 
 onChange={(e) => updateConfig('navbar', 'logoText', e.target.value)}
 className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md"
 placeholder="Enter your store name"
 />
 <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-medium">Changes the brand text displayed in the header navigation bar.</p>
 </div>
 <div className="flex gap-4">
 <div className="flex-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Background</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.navbar.backgroundColor} onChange={(e) => updateConfig('navbar', 'backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase">{config.navbar.backgroundColor}</span>
 </div>
 </div>
 <div className="flex-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Text Color</label>
 <div className="flex items-center gap-2">
 <input type="color" value={config.navbar.textColor} onChange={(e) => updateConfig('navbar', 'textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
 <span className="text-xs uppercase">{config.navbar.textColor}</span>
 </div>
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Position</label>
 <select value={config.navbar.position} onChange={(e) => updateConfig('navbar', 'position', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="top">Top Header</option>
 <option value="side">Side Menu</option>
 </select>
 </div>
 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-lg">
 <span className="font-bold text-gray-700 dark:text-slate-300">Show Search Bar</span>
 <input type="checkbox" checked={config.navbar.showSearch} onChange={(e) => updateConfig('navbar', 'showSearch', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 </div>
 </Section>

 {/* 5. Header / Hero */}
 <Section id="header" title="5. Header & Hero" icon={FaImage}>
 <div className="space-y-4">
 <div className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-lg space-y-3">
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-700 dark:text-slate-300">Announcement Bar</span>
 <input type="checkbox" checked={config.header.announcement.show} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, show: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
 </div>
 {config.header.announcement.show && (
 <>
 <div className="flex justify-between items-center mb-1">
 <span className="text-gray-400 dark:text-slate-500 font-bold text-[9px] uppercase">Announcement Text</span>
 <button
 type="button"
 onClick={() => openCopilot('announcement', (text) => updateConfig('header', 'announcement', {...config.header.announcement, text}))}
 className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-650 hover:text-indigo-850 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100/50 transition-colors"
 >
 ✨ AI
 </button>
 </div>
 <input type="text" value={config.header.announcement.text} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, text: e.target.value})} className="w-full p-2 bg-white dark:bg-[#09080E] border rounded-md text-xs" />
 <div className="flex items-center gap-2 mt-2">
 <input type="color" value={config.header.announcement.color} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, color: e.target.value})} className="w-6 h-6" />
 <span className="text-xs">Bar Color</span>
 </div>
 </>
 )}
 </div>

 <div>
 <div className="flex justify-between items-center mb-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Hero Heading</label>
 <button
 type="button"
 onClick={() => openCopilot('heroHeading', (text) => updateConfig('header', 'heroHeading', text))}
 className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-650 hover:text-indigo-855 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100/50 transition-colors"
 >
 ✨ AI
 </button>
 </div>
 <input type="text" value={config.header.heroHeading} onChange={(e) => updateConfig('header', 'heroHeading', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md" />
 </div>
 <div>
 <div className="flex justify-between items-center mb-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Hero Subheading</label>
 <button
 type="button"
 onClick={() => openCopilot('heroTagline', (text) => updateConfig('header', 'heroSubheading', text))}
 className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-650 hover:text-indigo-855 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100/50 transition-colors"
 >
 ✨ AI
 </button>
 </div>
 <textarea value={config.header.heroSubheading} onChange={(e) => updateConfig('header', 'heroSubheading', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md text-xs" rows={2} />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">CTA Label</label>
 <input type="text" value={config.header.ctaLabel} onChange={(e) => updateConfig('header', 'ctaLabel', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md" />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Alignment</label>
 <select value={config.header.heroAlign} onChange={(e) => updateConfig('header', 'heroAlign', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="left">Left</option>
 <option value="center">Center</option>
 <option value="right">Right</option>
 </select>
 </div>
 </div>
 </Section>

 {/* 6. Spacing & Layout */}
 <Section id="spacing" title="6. Spacing & Layout" icon={FaGripHorizontal}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Border Radius</label>
 <select value={config.spacing.borderRadius} onChange={(e) => updateConfig('spacing', 'borderRadius', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="sharp">Sharp (0px)</option>
 <option value="rounded">Rounded (8px)</option>
 <option value="pill">Pill (Fully rounded)</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Container Width</label>
 <select value={config.spacing.maxWidth} onChange={(e) => updateConfig('spacing', 'maxWidth', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="narrow">Narrow (960px)</option>
 <option value="normal">Normal (1200px)</option>
 <option value="full">Full Width</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Section Padding</label>
 <select value={config.spacing.padding} onChange={(e) => updateConfig('spacing', 'padding', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="compact">Compact</option>
 <option value="comfortable">Comfortable</option>
 <option value="airy">Airy</option>
 </select>
 </div>
 </div>
 </Section>

 {/* 8. Product Cards */}
 <Section id="products" title="8. Product Cards" icon={FaMousePointer}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Grid Columns (Desktop)</label>
 <select value={config.products.columnsDesktop} onChange={(e) => updateConfig('products', 'columnsDesktop', Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="2">2 Columns</option>
 <option value="3">3 Columns</option>
 <option value="4">4 Columns</option>
 </select>
 </div>
 <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#13121A] rounded-lg border border-gray-200 dark:border-slate-700/60">
 <div className="flex items-center justify-between">
 <span>Show Prices</span>
 <input type="checkbox" checked={config.products.showPrices} onChange={(e) => updateConfig('products', 'showPrices', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 <div className="flex items-center justify-between">
 <span>Show Add to Cart</span>
 <input type="checkbox" checked={config.products.showAddToCart} onChange={(e) => updateConfig('products', 'showAddToCart', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 <div className="flex items-center justify-between">
 <span>Show Wishlist Icon</span>
 <input type="checkbox" checked={config.products.showWishlist} onChange={(e) => updateConfig('products', 'showWishlist', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 <div className="flex items-center justify-between">
 <span>Show Star Ratings</span>
 <input type="checkbox" checked={config.products.showStars} onChange={(e) => updateConfig('products', 'showStars', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Hover Effect</label>
 <select value={config.products.hoverEffect} onChange={(e) => updateConfig('products', 'hoverEffect', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="none">None</option>
 <option value="zoom">Zoom Image</option>
 <option value="second-image">Show Second Image</option>
 </select>
 </div>
 </div>
 </Section>

 {/* 9. Buttons */}
 <Section id="buttons" title="9. Buttons" icon={FaMousePointer}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Primary Style</label>
 <select value={config.buttons.primaryStyle} onChange={(e) => updateConfig('buttons', 'primaryStyle', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="filled">Filled Solid</option>
 <option value="outlined">Outlined</option>
 <option value="ghost">Ghost / Subtle</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Size</label>
 <select value={config.buttons.size} onChange={(e) => updateConfig('buttons', 'size', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md">
 <option value="small">Small</option>
 <option value="medium">Medium</option>
 <option value="large">Large</option>
 </select>
 </div>
 </div>
 </Section>

 {/* 10. FAQs Management */}
 <Section id="faqSettings" title="10. FAQs Management" icon={FaListAlt}>
 <div className="space-y-4 text-xs">
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-2">
 <span className="font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Configure FAQ List</span>
 <button 
 type="button"
 onClick={() => {
 const currentFaq = config.faq?.questions || [];
 const updated = [...currentFaq, { id: Date.now().toString(), question: 'New Question', answer: 'Answer details here.' }];
 updateConfig('faq', 'questions', updated);
 }}
 className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-[10px] transition-colors"
 >
 + Add FAQ
 </button>
 </div>
 
 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
 {(config.faq?.questions || []).map((faq, idx) => (
 <div key={faq.id || idx} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-xl space-y-2 relative">
 <button 
 type="button"
 onClick={() => {
 const currentFaq = config.faq?.questions || [];
 const updated = currentFaq.filter(q => q.id !== faq.id);
 updateConfig('faq', 'questions', updated);
 }}
 className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500 font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-slate-800"
 title="Delete FAQ"
 >
 ×
 </button>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Question</label>
 <input 
 type="text"
 value={faq.question}
 onChange={(e) => {
 const currentFaq = config.faq?.questions || [];
 const updated = currentFaq.map(q => q.id === faq.id ? { ...q, question: e.target.value } : q);
 updateConfig('faq', 'questions', updated);
 }}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs font-bold text-gray-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Answer</label>
 <textarea 
 value={faq.answer}
 onChange={(e) => {
 const currentFaq = config.faq?.questions || [];
 const updated = currentFaq.map(q => q.id === faq.id ? { ...q, answer: e.target.value } : q);
 updateConfig('faq', 'questions', updated);
 }}
 rows={2}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs text-gray-655 resize-none outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 </div>
 ))}
 {(config.faq?.questions || []).length === 0 && (
 <p className="text-gray-400 dark:text-slate-500 text-xs italic text-center py-2">No FAQs configured. Add one above.</p>
 )}
 </div>
 </div>
 </Section>

 {/* 11. Testimonials & Reviews */}
 <Section id="testimonialsSettings" title="11. Testimonials & Reviews" icon={FaListAlt}>
 <div className="space-y-4 text-xs">
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-2">
 <span className="font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Configure Customer Reviews</span>
 <button 
 type="button"
 onClick={() => {
 const currentTest = config.testimonials?.list || [];
 const updated = [...currentTest, { id: Date.now().toString(), name: 'Customer Name', role: 'Verified Buyer', review: 'Great experience shopping here!', rating: 5 }];
 updateConfig('testimonials', 'list', updated);
 }}
 className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-[10px] transition-colors"
 >
 + Add Review
 </button>
 </div>
 
 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
 {(config.testimonials?.list || []).map((item, idx) => (
 <div key={item.id || idx} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-xl space-y-2 relative">
 <button 
 type="button"
 onClick={() => {
 const currentTest = config.testimonials?.list || [];
 const updated = currentTest.filter(t => t.id !== item.id);
 updateConfig('testimonials', 'list', updated);
 }}
 className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500 font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-slate-800"
 title="Delete Review"
 >
 ×
 </button>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Name</label>
 <input 
 type="text"
 value={item.name}
 onChange={(e) => {
 const currentTest = config.testimonials?.list || [];
 const updated = currentTest.map(t => t.id === item.id ? { ...t, name: e.target.value } : t);
 updateConfig('testimonials', 'list', updated);
 }}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs font-bold text-gray-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Role / Badge</label>
 <input 
 type="text"
 value={item.role}
 onChange={(e) => {
 const currentTest = config.testimonials?.list || [];
 const updated = currentTest.map(t => t.id === item.id ? { ...t, role: e.target.value } : t);
 updateConfig('testimonials', 'list', updated);
 }}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs text-gray-805 outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2 items-center">
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Rating (1-5 Stars)</label>
 <select
 value={item.rating}
 onChange={(e) => {
 const currentTest = config.testimonials?.list || [];
 const updated = currentTest.map(t => t.id === item.id ? { ...t, rating: Number(e.target.value) } : t);
 updateConfig('testimonials', 'list', updated);
 }}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400"
 >
 <option value="5">★★★★★ 5 Stars</option>
 <option value="4">★★★★☆ 4 Stars</option>
 <option value="3">★★★☆☆ 3 Stars</option>
 <option value="2">★★☆☆☆ 2 Stars</option>
 <option value="1">★☆☆☆☆ 1 Star</option>
 </select>
 </div>
 </div>
 <div>
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Review Feedback</label>
 <textarea 
 value={item.review}
 onChange={(e) => {
 const currentTest = config.testimonials?.list || [];
 const updated = currentTest.map(t => t.id === item.id ? { ...t, review: e.target.value } : t);
 updateConfig('testimonials', 'list', updated);
 }}
 rows={2}
 className="w-full p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs text-gray-600 dark:text-slate-400 resize-none outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 </div>
 ))}
 {(config.testimonials?.list || []).length === 0 && (
 <p className="text-gray-400 dark:text-slate-500 text-xs italic text-center py-2">No reviews configured. Add one above.</p>
 )}
 </div>
 </div>
 </Section>

 {/* 12. Photo Gallery */}
 <Section id="gallerySettings" title="12. Photo Gallery" icon={FaImage}>
 <div className="space-y-4 text-xs">
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-2">
 <span className="font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Gallery Images</span>
 <button 
 type="button"
 onClick={() => {
 const currentGallery = config.gallery?.images || [];
 const updated = [...currentGallery, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80'];
 updateConfig('gallery', 'images', updated);
 }}
 className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-[10px] transition-colors"
 >
 + Add Image
 </button>
 </div>
 
 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
 {(config.gallery?.images || []).map((img, idx) => (
 <div key={idx} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-xl space-y-2 relative flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0">
 <img src={img} className="w-full h-full object-cover" alt="" />
 </div>
 <div className="flex-1 min-w-0">
 <label className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-0.5">Image URL</label>
 <input 
 type="text"
 value={img}
 onChange={(e) => {
 const currentGallery = config.gallery?.images || [];
 const updated = [...currentGallery];
 updated[idx] = e.target.value;
 updateConfig('gallery', 'images', updated);
 }}
 className="w-full p-1 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-[10px] text-gray-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 font-mono"
 />
 </div>
 <button 
 type="button"
 onClick={() => {
 const currentGallery = config.gallery?.images || [];
 const updated = currentGallery.filter((_, i) => i !== idx);
 updateConfig('gallery', 'images', updated);
 }}
 className="text-gray-400 dark:text-slate-500 hover:text-red-500 font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 flex-shrink-0"
 title="Delete Image"
 >
 ×
 </button>
 </div>
 ))}
 {(config.gallery?.images || []).length === 0 && (
 <p className="text-gray-400 dark:text-slate-500 text-xs italic text-center py-2">No gallery images. Add one above.</p>
 )}
 </div>
 </div>
 </Section>

 {/* 15. Trust */}
 <Section id="trust" title="15. Trust & Social Proof" icon={FaShieldAlt}>
 <div className="space-y-3 p-3 bg-gray-50 dark:bg-[#13121A] rounded-lg border border-gray-250">
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-700 dark:text-slate-300">Secure Checkout Badge</span>
 <input type="checkbox" checked={config.trust.badges.secure} onChange={(e) => updateConfig('trust', 'badges', {...config.trust.badges, secure: e.target.checked})} className="w-4 h-4 accent-purple-600" />
 </div>
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-700 dark:text-slate-300">Free Returns Badge</span>
 <input type="checkbox" checked={config.trust.badges.returns} onChange={(e) => updateConfig('trust', 'badges', {...config.trust.badges, returns: e.target.checked})} className="w-4 h-4 accent-purple-600" />
 </div>
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-700 dark:text-slate-300">Live Viewer Counter</span>
 <input type="checkbox" checked={config.trust.liveCounter} onChange={(e) => updateConfig('trust', 'liveCounter', e.target.checked)} className="w-4 h-4 accent-purple-600" />
 </div>
 </div>
 </Section>
 
 {/* 16. Custom Pages & Features Creator */}
 <Section id="customPages" title="16. Custom Pages & Features" icon={FaListAlt}>
 <div className="space-y-4 text-xs">
 <p className="text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
 Add new tabs/pages to your website menu (e.g. Cafe Menu, Service Specials, Features Grid) with editable card grids!
 </p>

 {/* List of current custom pages */}
 <div className="space-y-3">
 {(config.customPages || []).map(page => {
 const isEditing = editingPageId === page.id;
 return (
 <div key={page.id} className="p-3 bg-gray-50 dark:bg-[#13121A] rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <span className="font-bold text-gray-800 dark:text-slate-200 text-xs block">{page.title}</span>
 <span className="text-[9px] text-pink-650 bg-pink-50 font-bold px-2 py-0.5 rounded-full border border-pink-100 uppercase mt-1 inline-block capitalize">{page.layout} Layout</span>
 </div>
 <div className="flex gap-2">
 <button 
 type="button"
 onClick={() => setEditingPageId(isEditing ? null : page.id)}
 className="px-2.5 py-1 bg-indigo-50 text-indigo-650 hover:bg-indigo-100 rounded-full font-bold transition-all text-[10px]"
 >
 {isEditing ? 'Close' : 'Edit Items'}
 </button>
 <button 
 type="button"
 onClick={() => {
 if (window.confirm(`Delete the custom page "${page.title}"?`)) {
 const updated = config.customPages.filter(p => p.id !== page.id);
 setConfig(prev => ({ ...prev, customPages: updated }));
 if (editingPageId === page.id) setEditingPageId(null);
 }
 }}
 className="px-2.5 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-full font-bold transition-all text-[10px]"
 >
 Delete
 </button>
 </div>
 </div>

 {isEditing && (
 <div className="border-t border-gray-200 dark:border-slate-700/60/80 pt-3 space-y-3.5">
 {page.layout === 'text' ? (
 <div className="space-y-3">
 <div>
 <label className="block text-gray-500 dark:text-slate-400 font-bold mb-1 uppercase text-[9px]">Banner Image URL</label>
 <input 
 type="text"
 value={page.image || ''}
 onChange={(e) => {
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, image: e.target.value } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-2 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
 placeholder="https://picsum.photos/seed/about/1200/600"
 />
 </div>
 <div>
 <label className="block text-gray-500 dark:text-slate-400 font-bold mb-1 uppercase text-[9px]">Page Rich Text Content</label>
 <textarea 
 value={page.desc || ''}
 onChange={(e) => {
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, desc: e.target.value } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 rows={4}
 className="w-full p-2 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
 placeholder="Describe your store info here..."
 />
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 <div className="flex justify-between items-center pb-1">
 <span className="font-bold text-gray-600 dark:text-slate-400 text-[10px]">Cards List ({page.items.length})</span>
 <button
 type="button"
 onClick={() => {
 const newId = `card_${Date.now()}`;
 let newItem = { id: newId, name: 'New Card Item', desc: 'Description of the newly added card item.' };
 if (page.layout === 'menu') {
 newItem = { ...newItem, icon: '🍵', price: '199' };
 } else if (page.layout === 'specials') {
 newItem = { ...newItem, badge: 'SPECIAL', btnLabel: 'Book Now', image: '' };
 } else if (page.layout === 'features') {
 newItem = { ...newItem, icon: '💡' };
 }
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: [...p.items, newItem] } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold text-[10px]"
 >
 + Add Card
 </button>
 </div>

 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
 {(page.items || []).map((item, idx) => (
 <div key={item.id || idx} className="p-2.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded-xl relative space-y-2.5">
 <button
 type="button"
 onClick={() => {
 const updatedItems = page.items.filter(i => i.id !== item.id);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="absolute top-1.5 right-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-[#13121A] dark:bg-[#13121A] z-10"
 title="Delete Card"
 >
 ×
 </button>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Card Title</label>
 <input 
 type="text"
 value={item.name || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500"
 />
 </div>
 
 {page.layout === 'menu' && (
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Price (₹)</label>
 <input 
 type="text"
 value={item.price || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, price: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500"
 />
 </div>
 )}

 {page.layout === 'specials' && (
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Promo Badge</label>
 <input 
 type="text"
 value={item.badge || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, badge: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500"
 placeholder="e.g. 20% OFF"
 />
 </div>
 )}
 
 {(page.layout === 'menu' || page.layout === 'features') && (
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Icon / Emoji</label>
 <input 
 type="text"
 value={item.icon || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, icon: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500 text-center"
 placeholder="e.g. 🍵"
 />
 </div>
 )}

 {page.layout === 'specials' && (
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Button Text</label>
 <input 
 type="text"
 value={item.btnLabel || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, btnLabel: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500"
 />
 </div>
 )}
 </div>

 {page.layout === 'specials' && (
 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Card Image URL</label>
 <input 
 type="text"
 value={item.image || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, image: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500"
 placeholder="https://example.com/promo.jpg"
 />
 </div>
 )}

 <div>
 <label className="block text-gray-400 dark:text-slate-500 font-bold mb-0.5 text-[9px] uppercase">Description</label>
 <textarea 
 value={item.desc || ''}
 onChange={(e) => {
 const updatedItems = page.items.map(i => i.id === item.id ? { ...i, desc: e.target.value } : i);
 const updated = config.customPages.map(p => p.id === page.id ? { ...p, items: updatedItems } : p);
 setConfig(prev => ({ ...prev, customPages: updated }));
 }}
 rows={2}
 className="w-full p-1 border border-gray-150 dark:border-slate-700/60 rounded text-[11px] outline-none focus:border-indigo-500 resize-y"
 />
 </div>
 </div>
 ))}
 {page.items.length === 0 && (
 <p className="text-gray-400 dark:text-slate-500 italic text-[11px] text-center py-3">No cards configured. Add one above.</p>
 )}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* Form to add a new page */}
 <div className="border-t border-gray-100 dark:border-slate-800/60 pt-4 space-y-3.5">
 <h4 className="font-bold text-gray-700 dark:text-slate-300">✦ Create New Page</h4>
 
 <div>
 <label className="block text-gray-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">Page Title</label>
 <input 
 type="text" 
 id="new-page-title" 
 placeholder="e.g. Menu, Special Offers" 
 className="w-full p-2.5 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500" 
 />
 </div>

 <div>
 <label className="block text-gray-500 dark:text-slate-400 font-bold mb-1 uppercase text-[10px]">Page Layout Style</label>
 <select 
 id="new-page-layout"
 className="w-full p-2.5 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 font-bold"
 >
 <option value="menu">Restaurant Menu / Spa Services</option>
 <option value="specials">Specials & Promotions Card Row</option>
 <option value="features">Features / Value Perks Grid</option>
 <option value="text">Blank Rich Text & Banner Page</option>
 </select>
 </div>

 <button 
 type="button"
 onClick={() => {
 const titleInput = document.getElementById('new-page-title');
 const layoutSelect = document.getElementById('new-page-layout');
 const title = titleInput?.value.trim();
 const layout = layoutSelect?.value;
 
 if (!title) {
 alert('Please enter a page title.');
 return;
 }

 const newPageId = `custom_${Date.now()}`;
 let defaultItems = [];
 
 if (layout === 'menu') {
 defaultItems = [
 { id: '1', icon: '🍵', name: 'Premium Special Tea', price: '199', desc: 'Describe this organic beverage option.' },
 { id: '2', icon: '🍰', name: 'Fresh Fruit Parfait', price: '250', desc: 'Naturally sweetened botanical snack.' }
 ];
 } else if (layout === 'specials') {
 defaultItems = [
 { id: '1', name: 'Glow Facial Treatment', desc: 'Get our signature deep pore extraction facial at half price this week only.', badge: '50% OFF', image: '', btnLabel: 'Book Special' }
 ];
 } else if (layout === 'features') {
 defaultItems = [
 { id: '1', icon: '🌱', name: '100% Organic', desc: 'Our products contain zero sulfates, parabens, or artificial dyes.' },
 { id: '2', icon: '🐇', name: 'Cruelty Free', desc: 'No animal testing at any phase of ingredient formulation.' }
 ];
 }

 const newPage = {
 id: newPageId,
 title,
 layout,
 items: defaultItems,
 desc: layout === 'text' ? 'Welcome to our custom page! Edit this description or upload an image banner.' : '',
 image: ''
 };

 setConfig(prev => ({
 ...prev,
 customPages: [...(prev.customPages || []), newPage]
 }));

 // Clear inputs
 if (titleInput) titleInput.value = '';
 }}
 className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow transition-colors text-center"
 >
 Add Page to Website
 </button>
 </div>
 </div>
 </Section>

 {/* 17. SEO */}
 <Section id="seo" title="17. SEO & Metadata" icon={FaSearch}>
 <div className="space-y-4">
 <div>
 <div className="flex justify-between items-center mb-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Meta Title</label>
 <span className={`text-xs ${config.seo.title.length > 60 ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-slate-500'}`}>{config.seo.title.length}/60</span>
 </div>
 <input type="text" value={config.seo.title} onChange={(e) => updateConfig('seo', 'title', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md" />
 </div>
 <div>
 <div className="flex justify-between items-center mb-1">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Meta Description</label>
 <span className={`text-xs ${config.seo.description.length > 160 ? 'text-red-500 font-bold' : 'text-gray-400 dark:text-slate-500'}`}>{config.seo.description.length}/160</span>
 </div>
 <textarea value={config.seo.description} onChange={(e) => updateConfig('seo', 'description', e.target.value)} rows={3} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border rounded-md" />
 </div>
 </div>
 </Section>


 
 {/* Footer */}
 <Section id="footerSettings" title="Footer" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Tagline</label>
 <input type="text" value={config.footer?.tagline || ''} onChange={(e) => updateConfig('footer', 'tagline', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none" />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Layout</label>
 <select value={config.footer?.layout || 'standard'} onChange={(e) => updateConfig('footer', 'layout', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="standard">Standard</option>
 <option value="minimal">Minimal</option>
 <option value="centered">Centered</option>
 </select>
 </div>
 </div>
 </Section>

 {/* Forms */}
 <Section id="formSettings" title="Forms" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Input Border Radius</label>
 <select value={config.forms?.inputRadius || '8px'} onChange={(e) => updateConfig('forms', 'inputRadius', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="0px">Sharp</option>
 <option value="8px">Rounded</option>
 <option value="9999px">Pill</option>
 </select>
 </div>
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={config.forms?.border === 'true'} onChange={(e) => updateConfig('forms', 'border', e.target.checked ? 'true' : 'false')} className="accent-blue-600" />
 <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Show Borders</span>
 </label>
 </div>
 </Section>
 {/* Gallery */}
 <Section id="gallerySettings" title="Gallery" icon={FaImage}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Section Title</label>
 <input 
 type="text"
 value={config.gallery?.title || ''}
 onChange={(e) => updateConfig('gallery', 'title', e.target.value)}
 className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md text-xs outline-none focus:border-blue-500"
 placeholder="Our Photo Gallery"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Gallery Images (URLs)</label>
 <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
 Paste new image links below to update your gallery photos.
 </p>
 <div className="space-y-2">
 {(config.gallery?.images || []).map((imgUrl, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <div className="w-8 h-8 flex-shrink-0 bg-gray-100 dark:bg-[#1A1A24] rounded border border-gray-200 dark:border-slate-700 overflow-hidden">
 {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt="" /> : <FaImage className="w-full h-full p-2 text-gray-300" />}
 </div>
 <input 
 type="text"
 value={imgUrl || ''}
 onChange={(e) => {
 const newImages = [...(config.gallery?.images || [])];
 newImages[idx] = e.target.value;
 updateConfig('gallery', 'images', newImages);
 }}
 className="flex-1 p-2 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs outline-none"
 placeholder={`Image URL ${idx + 1}`}
 />
 </div>
 ))}
 </div>
 </div>
 </div>
 </Section>

 {/* Sections Visibility */}
 <Section id="sectionsVisibility" title="Sections" icon={FaDesktop}>
 <div className="space-y-2">
 <p className="text-xs text-gray-500 mb-3">Toggle visibility of store sections.</p>
 {Object.keys(config.sections || {}).map(sec => (
 <label key={sec} className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-150 dark:border-slate-800 rounded">
 <span className="text-xs font-bold text-gray-700 dark:text-slate-300 capitalize">{sec}</span>
 <input type="checkbox" checked={!!config.sections[sec]} onChange={(e) => updateConfig('sections', sec, e.target.checked)} className="accent-blue-600" />
 </label>
 ))}
 </div>
 </Section>

 {/* Animations */}
 <Section id="animations" title="Animations" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Page Transition</label>
 <select value={config.animations?.pageAnimation || 'fade'} onChange={(e) => updateConfig('animations', 'pageAnimation', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="fade">Fade In</option>
 <option value="slide">Slide Up</option>
 <option value="zoom">Zoom</option>
 <option value="none">None</option>
 </select>
 </div>
 </div>
 </Section>

 {/* Border Radius Global */}
 <Section id="borderRadius" title="Border Radius" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Global Radius</label>
 <select value={config.spacing?.borderRadius || '8px'} onChange={(e) => updateConfig('spacing', 'borderRadius', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="0px">Sharp</option>
 <option value="4px">Slightly Rounded</option>
 <option value="8px">Rounded</option>
 <option value="16px">Extra Rounded</option>
 <option value="9999px">Pill</option>
 </select>
 </div>
 </div>
 </Section>

 {/* Shadows */}
 <Section id="shadows" title="Shadows" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Global Shadow Style</label>
 <select value={config.shadows?.globalStyle || 'medium'} onChange={(e) => updateConfig('shadows', 'globalStyle', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="none">None</option>
 <option value="light">Light</option>
 <option value="medium">Medium</option>
 <option value="heavy">Heavy</option>
 </select>
 </div>
 </div>
 </Section>

 {/* Icons */}
 <Section id="icons" title="Icons" icon={FaDesktop}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Icon Style</label>
 <select value={config.icons?.style || 'outlined'} onChange={(e) => updateConfig('icons', 'style', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
 <option value="outlined">Outlined</option>
 <option value="filled">Filled</option>
 <option value="rounded">Rounded</option>
 </select>
 </div>
 </div>
 </Section>

 {/* Images */}
 <Section id="images" title="Images" icon={FaDesktop}>
 <div className="space-y-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={config.images?.overlay || false} onChange={(e) => updateConfig('images', 'overlay', e.target.checked)} className="accent-blue-600" />
 <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Darken Overlays</span>
 </label>
 </div>
 </Section>

 {/* Custom CSS */}
 <Section id="customCss" title="Custom CSS" icon={FaDesktop}>
 <div className="space-y-2">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Inject Custom Styles</label>
 <textarea 
 value={config.customCss || ''} 
 onChange={(e) => setConfig(p => ({ ...p, customCss: e.target.value }))}
 placeholder="/* Add CSS here */"
 rows={8}
 className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-md outline-none"
 />
 </div>
 </Section>
\n\n {/* 18. Business Hours */}
 <Section id="hoursSettings" title="18. Business Hours" icon={FaClock}>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Section Title</label>
 <input 
 type="text" 
 value={config.hours?.title || 'Business Hours'} 
 onChange={(e) => updateConfig('hours', 'title', e.target.value)}
 className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none focus:border-blue-500 dark:focus:border-blue-400"
 />
 </div>
 
 <div className="space-y-3">
 <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Daily Timings</label>
 {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
 const defaultDays = config.hours?.days || [
 { day: 'Monday', hours: '9:00 AM - 9:00 PM' },
 { day: 'Tuesday', hours: '9:00 AM - 9:00 PM' },
 { day: 'Wednesday', hours: '9:00 AM - 9:00 PM' },
 { day: 'Thursday', hours: '9:00 AM - 9:00 PM' },
 { day: 'Friday', hours: '9:00 AM - 10:00 PM' },
 { day: 'Saturday', hours: '10:00 AM - 10:00 PM' },
 { day: 'Sunday', hours: 'Closed' }
 ];
 
 const currentDayObj = defaultDays.find(d => d.day === day) || { day, hours: 'Closed' };
 const isClosed = currentDayObj.hours === 'Closed';
 
 const getTimes = (hoursStr) => {
 if (hoursStr === 'Closed' || !hoursStr) return { open: '', close: '' };
 const parts = hoursStr.split('-');
 if (parts.length !== 2) return { open: '', close: '' };
 
 const parseHalf = (str) => {
 const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
 if (!match) return '';
 let [_, h, m, ampm] = match;
 h = parseInt(h, 10);
 if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
 if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
 return `${h.toString().padStart(2, '0')}:${m}`;
 };
 return { open: parseHalf(parts[0]), close: parseHalf(parts[1]) };
 };
 
 const formatHalf = (time24) => {
 if (!time24) return '12:00 AM';
 const [hStr, mStr] = time24.split(':');
 let h = parseInt(hStr, 10);
 const ampm = h >= 12 ? 'PM' : 'AM';
 h = h % 12;
 if (h === 0) h = 12;
 return `${h}:${mStr} ${ampm}`;
 };

 const times = getTimes(currentDayObj.hours);

 const updateDay = (newHours) => {
 const newDays = [...defaultDays];
 const dIdx = newDays.findIndex(d => d.day === day);
 if (dIdx !== -1) {
 newDays[dIdx] = { day, hours: newHours };
 } else {
 newDays.push({ day, hours: newHours });
 }
 updateConfig('hours', 'days', newDays);
 };

 return (
 <div key={day} className="p-3 bg-gray-50 dark:bg-[#13121A] border border-gray-150 dark:border-slate-700/60 rounded-xl space-y-2">
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-800 dark:text-slate-200 text-xs w-20">{day}</span>
 <label className="flex items-center gap-1.5 cursor-pointer">
 <input 
 type="checkbox" 
 checked={isClosed}
 onChange={(e) => {
 if (e.target.checked) updateDay('Closed');
 else updateDay('9:00 AM - 5:00 PM');
 }}
 className="accent-red-500 w-3 h-3"
 />
 <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Closed</span>
 </label>
 </div>
 {!isClosed && (
 <div className="flex items-center gap-2">
 <input 
 type="time" 
 value={times.open}
 onChange={(e) => {
 const newOpen = formatHalf(e.target.value);
 const newClose = formatHalf(times.close || '17:00');
 updateDay(`${newOpen} - ${newClose}`);
 }}
 className="flex-1 p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs outline-none"
 />
 <span className="text-gray-400 dark:text-slate-500 text-xs font-bold">to</span>
 <input 
 type="time" 
 value={times.close}
 onChange={(e) => {
 const newOpen = formatHalf(times.open || '09:00');
 const newClose = formatHalf(e.target.value);
 updateDay(`${newOpen} - ${newClose}`);
 }}
 className="flex-1 p-1.5 bg-white dark:bg-[#09080E] border border-gray-200 dark:border-slate-700/60 rounded text-xs outline-none"
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 </Section>

 
 {/* Placeholder for others */}
 <div className="p-6 text-center text-gray-400 dark:text-slate-500 text-xs italic">
 Additional sections omitted for brevity in demo...
 </div>

 </div>

 <AICopilot 
 isOpen={copilotOpen}
 onClose={() => setCopilotOpen(false)}
 onApply={copilotCallback}
 fieldName={copilotField}
 category={website?.storeInfo?.category || 'general'}
 />
 </div>
 </AccordionContext.Provider>
 );
}

export default EditorControls;
