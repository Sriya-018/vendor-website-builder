import React, { useState } from 'react';
import { FaEye, FaBoxOpen, FaMoneyBillWave, FaArrowRight, FaTrash, FaExternalLinkAlt, FaEllipsisV, FaCog } from 'react-icons/fa';

const TEMPLATE_NAMES = {
 t1: 'Aurora', t2: 'Slate', t3: 'Bloom', t4: 'Crave', t5: 'Haven',
 t6: 'Nexus', t7: 'Vogue', t8: 'Pixel', t9: 'Glow', t10: 'Bistro',
 t11: 'Loft', t12: 'Zenith', t13: 'Trend', t14: 'Spark', t15: 'Flora',
 t16: 'Silk', t17: 'Active', t18: 'Vintage', t19: 'Quantum', t20: 'Aero',
 t21: 'RetroTech', t22: 'Onyx', t23: 'Mist', t24: 'Petal', t25: 'Brew',
 t26: 'Slice', t27: 'Hops', t28: 'Harvest', t29: 'Manor', t30: 'Patio',
 t31: 'Urban', t32: 'Zen', t33: 'Pulse', t34: 'Scale', t35: 'PixelCraft', t36: 'Care'
};

function OverviewTab({ stats, recentOrders, websites, navigate, routerNavigate, setSelectedWebsite, onDeleteWebsite }) {
 const [activeMenuId, setActiveMenuId] = useState(null);

 return (
 <>
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div className="bg-white dark:bg-[#13121A] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/20">
 <FaEye className="text-xl" />
 </div>
 <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+12%</span>
 </div>
 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.views || 0}</div>
 <div className="text-sm text-slate-600 dark:text-slate-500 font-medium">Total Page Views</div>
 </div>

 <div className="bg-white dark:bg-[#13121A] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
 <FaBoxOpen className="text-xl" />
 </div>
 <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+5%</span>
 </div>
 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.orders || 0}</div>
 <div className="text-sm text-slate-600 dark:text-slate-500 font-medium">Total Orders</div>
 </div>

 <div className="bg-white dark:bg-[#13121A] p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/20">
 <FaMoneyBillWave className="text-xl" />
 </div>
 <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-300 dark:border-slate-700">All time</span>
 </div>
 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">₹{stats?.revenue?.toLocaleString() || 0}</div>
 <div className="text-sm text-slate-600 dark:text-slate-500 font-medium">Total Revenue</div>
 </div>
 </div>

 {/* My Stores Table */}
 <div className="mb-8">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Stores</h2>
 </div>
 <div className="bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden">
 {websites && websites.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 text-xs uppercase text-slate-600 dark:text-slate-500 tracking-wider font-semibold">
 <th className="px-6 py-4">Store Details</th>
 <th className="px-6 py-4">Website Slug</th>
 <th className="px-6 py-4">Template</th>
 <th className="px-6 py-4">Views</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-sm">
 {websites.map((website, index) => {
 const isOpen = activeMenuId === website._id;
 return (
 <tr key={website._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800/20 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-extrabold shadow-md shadow-indigo-500/20 text-sm">
 {website.storeName?.charAt(0).toUpperCase() || 'S'}
 </div>
 <div>
 <div className="font-bold text-slate-900 dark:text-white">{website.storeName || `Store ${index + 1}`}</div>
 <div className="text-xs text-slate-600 dark:text-slate-500 capitalize">{website.storeInfo?.category || 'General'}</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <a
 href={`/website/${website.slug}`}
 target="_blank"
 rel="noopener noreferrer"
 className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 hover:underline"
 >
 {website.slug}
 <FaExternalLinkAlt className="text-[10px]" />
 </a>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
 {TEMPLATE_NAMES[website.template] || website.template}
 </span>
 </td>
 <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
 {website.views || 0} views
 </td>
 <td className="px-6 py-4 text-right relative">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => routerNavigate(`/editor/${website._id}`)}
 className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/30"
 >
 Edit Design
 </button>
 <div className="relative inline-block text-left">
 <button
 onClick={() => setActiveMenuId(isOpen ? null : website._id)}
 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-300 dark:border-slate-700"
 title="Actions"
 >
 <FaEllipsisV />
 </button>
 {isOpen && (
 <>
 <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)}></div>
 <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#13121A] border border-slate-300 dark:border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 z-40 py-1.5 text-left text-xs">
 <button
 onClick={() => { window.open(`/website/${website.slug}`, '_blank'); setActiveMenuId(null); }}
 className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
 >
 <FaEye className="text-slate-600 dark:text-slate-500" /> View Live Site
 </button>
 <button
 onClick={() => { setSelectedWebsite(website); navigate('settings'); setActiveMenuId(null); }}
 className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
 >
 <FaCog className="text-slate-600 dark:text-slate-500" /> Store Settings
 </button>
 <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
 <button
 onClick={() => { onDeleteWebsite(website._id); setActiveMenuId(null); }}
 className="w-full px-4 py-2 hover:bg-red-500/10 text-red-400 font-bold flex items-center gap-2"
 >
 <FaTrash /> Delete Store
 </button>
 </div>
 </>
 )}
 </div>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="p-12 text-center">
 <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
 <FaBoxOpen className="text-3xl text-purple-500/50" />
 </div>
 <p className="font-semibold text-slate-900 dark:text-white mb-1">No stores yet</p>
 <p className="text-slate-600 dark:text-slate-500 text-sm">Create your first store from the Templates section!</p>
 </div>
 )}
 </div>
 </div>

 {/* Recent Orders */}
 <div className="grid grid-cols-1 gap-8">
 <div className="col-span-1">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
 <button onClick={() => navigate('orders')} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
 View all <FaArrowRight className="text-xs" />
 </button>
 </div>

 <div className="bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden">
 {recentOrders && recentOrders.length === 0 ? (
 <div className="p-8 text-center">
 <FaBoxOpen className="text-4xl text-slate-700 mx-auto mb-3" />
 <p className="font-medium text-slate-900 dark:text-white">No orders yet</p>
 <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">When customers place orders, they'll appear here.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 text-xs uppercase text-slate-600 dark:text-slate-500 tracking-wider">
 <th className="px-6 py-4 font-medium">Order ID</th>
 <th className="px-6 py-4 font-medium">Customer</th>
 <th className="px-6 py-4 font-medium">Status</th>
 <th className="px-6 py-4 font-medium text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-sm">
 {recentOrders && recentOrders.map(order => (
 <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800/20 transition-colors">
 <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
 <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
 <div className="text-slate-700 dark:text-slate-300">{order.customerPhone}</div>
 <div className="text-xs text-slate-600 truncate max-w-[200px]">
 {order.items?.map(i => `${i.name}`).join(', ') || 'Order placed'}
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
 order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
 order.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
 }`}>
 {order.status}
 </span>
 </td>
 <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
 ₹{order.totalAmount.toLocaleString()}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 </>
 );
}

export default OverviewTab;
