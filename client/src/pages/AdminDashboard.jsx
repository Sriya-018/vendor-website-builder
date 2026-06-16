import React, { useState, useEffect } from 'react';
import { FaStore, FaGlobe, FaEye, FaExternalLinkAlt, FaChartBar, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
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
    // Note: since we changed from website to websites array, we must update filter logic:
    if (filter === 'published') return v.websites && v.websites.some(w => w.published);
    if (filter === 'draft') return v.websites && v.websites.some(w => !w.published);
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStore className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-6">Enter your unique identification number</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Admin PIN"
              className="w-full border border-gray-300 rounded-xl p-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !pin}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Access Dashboard'}
            </button>
            <div className="mt-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 underline">Return Home</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-md">
            V
          </div>
          <span className="font-bold text-xl tracking-tight">VendorBuild <span className="text-blue-600">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Exit Admin
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Platform Overview</h1>
            <p className="text-gray-500 text-sm">Monitor all vendors and their websites</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Vendors</p>
              <h3 className="text-3xl font-bold">{data.stats?.totalVendors || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FaStore className="text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Published Websites</p>
              <h3 className="text-3xl font-bold">{data.stats?.publishedSites || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FaGlobe className="text-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Page Views</p>
              <h3 className="text-3xl font-bold">{data.stats?.totalViews || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <FaEye className="text-xl" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-lg">Vendor Directory</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search business or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors w-64"
                />
              </div>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="all">All Vendors</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Business</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Template</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No vendors found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{vendor.businessName || 'Unnamed Store'}</div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5">{vendor.category.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{vendor.vendorPhone}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Joined {new Date(vendor.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vendor.websites.map(site => (
                              <div key={site._id}>
                                {site.published ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Draft
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            No Website
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {vendor.websites.map(site => (
                              <div key={site._id} className="py-1">
                                <span className="text-sm font-medium capitalize">{site.template}</span>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  <FaChartBar className="text-[10px]" /> {site.views || 0} views
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(site.createdAt).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {vendor.websites && vendor.websites.length > 0 ? (
                          <div className="flex flex-col gap-2 items-end">
                            {vendor.websites.map(site => (
                              <div key={site._id} className="py-1">
                                {site.published ? (
                                  <a 
                                    href={`/website/${site.slug}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                                  >
                                    Visit Site <FaExternalLinkAlt className="text-xs" />
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">Not available</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not available</span>
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
