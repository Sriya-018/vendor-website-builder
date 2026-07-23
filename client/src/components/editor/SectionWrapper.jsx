import React from 'react';

export default function SectionWrapper({ 
 isEditable, 
 sectionKey, 
 sectionOrder, 
 onUpdateConfig, 
 config,
 children,
 className = '',
 ...props
}) {
 if (!isEditable) {
 return <div className={className} {...props}>{children}</div>;
 }

 const defaultOrder = ['hero', 'products', 'gallery', 'faq', 'testimonials', 'hours', 'contact'];
 const order = sectionOrder || defaultOrder;
 const index = order.indexOf(sectionKey);

 const moveSection = (direction) => {
 const newOrder = [...order];
 if (direction === 'up' && index > 0) {
 newOrder[index] = newOrder[index - 1];
 newOrder[index - 1] = sectionKey;
 } else if (direction === 'down' && index < newOrder.length - 1) {
 newOrder[index] = newOrder[index + 1];
 newOrder[index + 1] = sectionKey;
 }
 if (onUpdateConfig) {
 onUpdateConfig('sectionOrder', null, newOrder);
 }
 };

 const removeSection = () => {
 if (onUpdateConfig) {
 // Toggle visibility in config.sections
 onUpdateConfig('sections', sectionKey, false);
 }
 };

 return (
 <div className={`relative group/section ${className}`} {...props}>
 {/* Section Hover Overlay/Border */}
 <div className="absolute inset-0 border-2 border-transparent group-hover/section:border-blue-500/40 pointer-events-none transition-colors z-30 rounded-lg"></div>
 
 {/* Toolbar */}
 <div className="absolute top-3 right-3 bg-slate-900/95 text-slate-900 dark:text-white rounded-xl p-1.5 flex items-center gap-1.5 opacity-0 group-hover/section:opacity-100 transition-opacity z-40 shadow-xl pointer-events-auto select-none border border-slate-800">
 <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 uppercase text-gray-300 tracking-wider font-mono">{sectionKey}</span>
 
 {/* Move Up */}
 <button 
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSection('up'); }} 
 disabled={index <= 0}
 className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-20 transition-colors text-slate-900 dark:text-white"
 title="Move Up"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"/></svg>
 </button>

 {/* Move Down */}
 <button 
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSection('down'); }} 
 disabled={index >= order.length - 1}
 className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-20 transition-colors text-slate-900 dark:text-white"
 title="Move Down"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
 </button>

 <div className="w-px h-4 bg-slate-800 mx-0.5"></div>

 {/* Hide Section */}
 <button 
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSection(); }} 
 className="p-1 hover:bg-red-500 hover:text-white rounded-md transition-colors text-red-400"
 title="Hide Section"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
 </button>
 </div>

 {children}
 </div>
 );
}
