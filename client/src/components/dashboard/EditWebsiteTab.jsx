import React from 'react';
import { FaDesktop, FaPalette } from 'react-icons/fa';

const TEMPLATE_NAMES = {
 t1: 'Aurora',
 t2: 'Slate',
 t3: 'Bloom',
 t4: 'Crave',
 t5: 'Haven',
 t6: 'Nexus',
 t7: 'Vogue',
 t8: 'Pixel',
 t9: 'Glow',
 t10: 'Bistro',
 t11: 'Loft',
 t12: 'Zenith',
 t13: 'Trend',
 t14: 'Spark',
 t15: 'Flora',
 t16: 'Silk',
 t17: 'Active',
 t18: 'Vintage',
 t19: 'Quantum',
 t20: 'Aero',
 t21: 'RetroTech',
 t22: 'Onyx',
 t23: 'Mist',
 t24: 'Petal',
 t25: 'Brew',
 t26: 'Slice',
 t27: 'Hops',
 t28: 'Harvest',
 t29: 'Manor',
 t30: 'Patio',
 t31: 'Urban',
 t32: 'Zen',
 t33: 'Pulse',
 t34: 'Scale',
 t35: 'PixelCraft',
 t36: 'Care'
};

function EditWebsiteTab({ websites, routerNavigate }) {
 return (
 <div className="mb-8">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Store to Design</h2>
 <p className="text-sm text-slate-600 dark:text-slate-400">Choose which store you want to open in the Advanced Website Editor.</p>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {websites && websites.length > 0 ? websites.map((website, index) => (
 <div key={website._id} className="bg-white dark:bg-[#13121A] p-5 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:border-purple-500/40 transition-all cursor-pointer flex flex-col" onClick={() => routerNavigate(`/editor/${website._id}`)}>
 <div className="flex justify-between items-start mb-3">
 <div className="font-bold text-slate-900 dark:text-white truncate">{website.storeName || `Store ${index + 1}`}</div>
 <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">{website.views || 0} views</span>
 </div>
 <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
 Template: <span className="font-medium capitalize">{TEMPLATE_NAMES[website.template] || website.template}</span><br/>
 Slug: <span className="font-medium text-slate-600 dark:text-slate-400">{website.slug}</span>
 </div>
 <div className="mt-auto">
 <button 
 onClick={(e) => {
 e.stopPropagation();
 routerNavigate(`/editor/${website._id}`);
 }}
 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 shadow-sm"
 >
 <FaPalette /> Open Editor
 </button>
 </div>
 </div>
 )) : (
 <div className="col-span-full bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden p-12 text-center">
 <FaDesktop className="text-5xl text-slate-700 mx-auto mb-4" />
 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Stores Found</h2>
 <p className="text-slate-600 dark:text-slate-400 mb-6">You don't have any stores yet. Create one to edit its design.</p>
 </div>
 )}
 </div>
 </div>
 );
}

export default EditWebsiteTab;
