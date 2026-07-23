import React from 'react';

export default function FloatingAsset({ type = 'storefront', className = '' }) {
 const renderAsset = () => {
 switch (type) {
 case 'storefront':
 return (
 <div className="relative w-64 h-64 mx-auto select-none" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
 {/* Ambient Glow Shadow Base */}
 <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-indigo-600/10 rounded-full blur-2xl opacity-80 animate-pulse transform translate-y-8 scale-90" style={{ transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(-20px)' }}></div>

 {/* Isometric Base Grid (Layer 0) - Static */}
 <div className="absolute inset-0 border-2 border-indigo-500/20 bg-indigo-950/20 rounded-3xl backdrop-blur-sm flex items-center justify-center" style={{ transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(0px)' }}>
 <div className="w-full h-full border border-purple-500/10 rounded-3xl grid grid-cols-4 grid-rows-4 p-4 gap-2">
 {[...Array(16)].map((_, i) => (
 <div key={i} className="border border-indigo-500/5 bg-purple-500/5 rounded-md"></div>
 ))}
 </div>
 </div>

 {/* Shop Floor Slab (Layer 1 - elevated and floats) */}
 <div className="absolute inset-4 animate-[float_6s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-gradient-to-tr from-purple-900/60 to-indigo-900/60 border border-purple-500/30 rounded-2xl shadow-2xl flex items-center justify-center" style={{ transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(25px)' }}>
 {/* Internal glowing elements */}
 <div className="w-12 h-12 bg-purple-500/20 rounded-full filter blur-md"></div>
 </div>
 </div>

 {/* Shop Front Structure (Layer 2 - highly elevated and floats with delay) */}
 <div className="absolute inset-8 animate-[float_6s_ease-in-out_infinite_1s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md border border-slate-900/20 dark:border-white/20 rounded-xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] flex flex-col items-center justify-center p-4" style={{ transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(55px)' }}>
 {/* Neon Door & Window highlights */}
 <div className="w-full flex justify-between gap-2 mb-2">
 <div className="w-8 h-12 border-2 border-indigo-400 bg-indigo-500/10 rounded-sm"></div>
 <div className="w-12 h-16 border-2 border-purple-400 bg-purple-500/10 rounded-sm flex items-center justify-center">
 <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></div>
 </div>
 </div>
 <div className="w-full h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-sm shadow-md"></div>
 </div>
 </div>

 {/* Floating Roof Canopy (Layer 3 - top layer) */}
 <div className="absolute inset-x-12 top-6 bottom-14 animate-[float_6s_ease-in-out_infinite_2s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-gradient-to-br from-indigo-500/85 to-purple-600/85 border border-slate-900/30 dark:border-white/30 rounded-lg shadow-2xl flex items-center justify-center" style={{ transform: 'rotateX(60deg) rotateZ(-45deg) translateZ(85px)' }}>
 <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">SHOP</span>
 </div>
 </div>
 </div>
 );

 case 'database':
 return (
 <div className="relative w-48 h-48 mx-auto select-none" style={{ transformStyle: 'preserve-3d', perspective: '800px' }}>
 {/* Glow Base */}
 <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl opacity-70 translate-y-6" style={{ transform: 'rotateX(60deg) translateZ(-10px)' }}></div>

 {/* Cylinder Disk 3 (Bottom) */}
 <div className="absolute inset-x-4 top-24 bottom-0 animate-[float_5s_ease-in-out_infinite_0.8s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-indigo-950/80 border border-indigo-500/40 rounded-full flex items-center justify-center shadow-lg" style={{ transform: 'rotateX(60deg) translateZ(0px)' }}>
 <div className="w-full h-full border border-indigo-500/20 rounded-full p-2">
 <div className="w-full h-full bg-indigo-900/40 rounded-full"></div>
 </div>
 </div>
 </div>

 {/* Cylinder Disk 2 (Middle) */}
 <div className="absolute inset-x-4 top-12 bottom-12 animate-[float_5s_ease-in-out_infinite_0.4s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-purple-900/85 border border-purple-400/40 rounded-full flex items-center justify-center shadow-lg" style={{ transform: 'rotateX(60deg) translateZ(30px)' }}>
 <div className="w-full h-full border border-purple-400/20 rounded-full p-2">
 <div className="w-full h-full bg-purple-800/40 rounded-full"></div>
 </div>
 </div>
 </div>

 {/* Cylinder Disk 1 (Top) */}
 <div className="absolute inset-x-4 top-0 bottom-24 animate-[float_5s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 border border-slate-900/20 dark:border-white/20 rounded-full flex items-center justify-center shadow-2xl" style={{ transform: 'rotateX(60deg) translateZ(60px)' }}>
 <div className="w-full h-full border border-slate-900/10 dark:border-white/10 rounded-full p-2 flex items-center justify-center">
 <div className="w-3 h-3 bg-purple-300 rounded-full animate-ping"></div>
 </div>
 </div>
 </div>
 </div>
 );

 case 'analytics':
 return (
 <div className="relative w-56 h-56 mx-auto select-none" style={{ transformStyle: 'preserve-3d', perspective: '800px' }}>
 {/* Grid Floor */}
 <div className="absolute inset-0 border border-purple-500/10 bg-purple-950/5 rounded-2xl flex items-center justify-center" style={{ transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(0px)' }}>
 <div className="w-full h-full border border-indigo-500/5 grid grid-cols-5 grid-rows-5 p-2">
 {[...Array(25)].map((_, i) => (
 <div key={i} className="border-t border-l border-indigo-500/5"></div>
 ))}
 </div>
 </div>

 {/* Bar 1 (Left) */}
 <div className="absolute bottom-16 left-8 w-6 animate-[float_5s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 border border-indigo-400/30 rounded-md shadow-lg" style={{ height: '60px', transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(10px)' }}></div>
 </div>

 {/* Bar 2 (Middle) */}
 <div className="absolute bottom-16 left-20 w-6 animate-[float_5s_ease-in-out_infinite_1.5s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full bg-gradient-to-t from-purple-900 to-purple-500 border border-purple-400/30 rounded-md shadow-lg" style={{ height: '90px', transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(25px)' }}></div>
 </div>

 {/* Bar 3 (Right) */}
 <div className="absolute bottom-16 left-32 w-6 animate-[float_5s_ease-in-out_infinite_0.7s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full bg-gradient-to-t from-pink-900 to-pink-500 border border-pink-400/30 rounded-md shadow-lg" style={{ height: '120px', transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(40px)' }}></div>
 </div>

 {/* Floating Star (Overlay Target) */}
 <div className="absolute right-4 top-8 w-8 h-8 animate-[float_5s_ease-in-out_infinite_1.2s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-amber-400 rounded-lg flex items-center justify-center shadow-lg text-slate-900 dark:text-white text-xs animate-[spin_8s_linear_infinite]" style={{ transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(75px)' }}>
 ⭐
 </div>
 </div>
 </div>
 );

 case 'message':
 return (
 <div className="relative w-48 h-48 mx-auto select-none" style={{ transformStyle: 'preserve-3d', perspective: '800px' }}>
 {/* Shadow base */}
 <div className="absolute inset-4 bg-purple-600/10 rounded-xl blur-lg transform translate-y-6" style={{ transform: 'rotateX(50deg) rotateZ(-20deg) translateZ(-10px)' }}></div>

 {/* Isometric Envelope Body */}
 <div className="absolute inset-0 animate-[float_5s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-gradient-to-br from-indigo-900/90 to-purple-950/90 border border-indigo-500/30 rounded-xl shadow-2xl flex flex-col justify-between p-4" style={{ transform: 'rotateX(50deg) rotateZ(-20deg) translateZ(15px)' }}>
 <div className="flex justify-between items-center">
 <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
 <div className="w-10 h-1 bg-indigo-500/40 rounded-full"></div>
 </div>
 <div className="space-y-1.5">
 <div className="w-full h-1 bg-indigo-500/20 rounded-full"></div>
 <div className="w-3/4 h-1 bg-indigo-500/20 rounded-full"></div>
 </div>
 </div>
 </div>

 {/* Floating Letter (elevated) */}
 <div className="absolute inset-x-4 top-4 bottom-12 animate-[float_5s_ease-in-out_infinite_1.2s]" style={{ transformStyle: 'preserve-3d' }}>
 <div className="w-full h-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md border border-slate-900/20 dark:border-white/20 rounded-lg shadow-xl p-3 flex flex-col justify-between" style={{ transform: 'rotateX(50deg) rotateZ(-20deg) translateZ(45px)' }}>
 <div className="w-8 h-1 bg-purple-400 rounded-full"></div>
 <div className="space-y-1">
 <div className="w-full h-0.5 bg-slate-900/30 dark:bg-white/30 rounded-full"></div>
 <div className="w-full h-0.5 bg-slate-900/30 dark:bg-white/30 rounded-full"></div>
 <div className="w-2/3 h-0.5 bg-slate-900/30 dark:bg-white/30 rounded-full"></div>
 </div>
 </div>
 </div>
 </div>
 );

 default:
 return null;
 }
 };

 return (
 <div className={`flex items-center justify-center pointer-events-none ${className}`}>
 {renderAsset()}
 </div>
 );
}
