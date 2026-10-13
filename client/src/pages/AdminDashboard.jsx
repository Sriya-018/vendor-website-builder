import React, { useState, useEffect } from 'react';
import { FaStore, FaGlobe, FaEye, FaExternalLinkAlt, FaChartBar, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const { theme } = useTheme();
  const [data, setData] = useState({ stats: null, vendors: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard?pin=${pin}`);
      setData(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      setError('Invalid Admin PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendors = data.vendors.filter(v => {
    const searchMatch = (v.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (v.vendorPhone || '').includes(searchTerm);
    if (!searchMatch) return false;
    if (filter === 'published') return v.websites && v.websites.some(w => w.published);
    if (filter === 'draft') return v.websites && v.websites.some(w => !w.published);
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 theme-${theme} bg-slate-50 dark:bg-[#09080E] text-slate-900 dark:text-slate-200`}>
        <div className="max-w-md w-full rounded-2xl shadow-xl p-8 border text-center bg-white dark:bg-[#13121A] border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaStore className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Admin Access</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Enter your administrative master PIN to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              autoFocus
              className="w-full border rounded-xl p-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !pin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-50 transition-colors shadow-md flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Access Dashboard'}
            </button>
            <div className="pt-2">
              <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                ← Return to Homepage
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 theme-${theme} bg-slate-50 dark:bg-[#09080E]`}>
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 theme-${theme} bg-slate-50 dark:bg-[#09080E] text-slate-900 dark:text-slate-200`}>
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 bg-white/95 dark:bg-[#13121A]/95 backdrop-blur-md border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-sm">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            VendorBuild <span className="text-blue-600 dark:text-blue-400">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            Exit Admin
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Platform Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor all registered vendors, generated storefronts, and website metrics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl p-6 border shadow-sm flex items-start justify-between bg-white dark:bg-[#13121A] border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold mb-1 text-slate-500 dark:text-slate-400">Total Vendors</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.stats?.totalVendors || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
              <FaStore className="text-xl" />
            </div>
          </div>

          <div className="rounded-2xl p-6 border shadow-sm flex items-start justify-between bg-white dark:bg-[#13121A] border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold mb-1 text-slate-500 dark:text-slate-400">Published Websites</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.stats?.publishedSites || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center justify-center">
              <FaGlobe className="text-xl" />
            </div>
          </div>

          <div className="rounded-2xl p-6 border shadow-sm flex items-start justify-between bg-white dark:bg-[#13121A] border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold mb-1 text-slate-500 dark:text-slate-400">Total Page Views</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.stats?.totalViews || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
              <FaEye className="text-xl" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-[#13121A] border-slate-200 dark:border-slate-800">
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Vendor Directory</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search business or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#13121A]">All Vendors</option>
                <option value="published" className="bg-white dark:bg-[#13121A]">Published Only</option>
                <option value="draft" className="bg-white dark:bg-[#13121A]">Drafts Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Business</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Contact</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Template</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No vendors found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{vendor.businessName || 'Unnamed Store'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{vendor.category ? vendor.category.replace('_', ' ') : 'General'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{vendor.vendorPhone}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Joined {new Date(vendor.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vendor.websites.map(site => (
                              <div key={site._id}>
                                {site.published ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Draft
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            No Website
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vendor.websites.map(site => (
                              <div key={site._id} className="py-0.5">
                                <span className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{site.template}</span>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                  <FaChartBar className="text-[10px]" /> {site.views || 0} views
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2 items-end">
                            {vendor.websites.map(site => (
                              <div key={site._id} className="py-0.5">
                                {site.published ? (
                                  <a
                                    href={`/website/${site.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                                  >
                                    Visit Site <FaExternalLinkAlt className="text-[10px]" />
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">Not published</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">No storefront</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
