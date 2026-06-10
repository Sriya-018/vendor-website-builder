import React from 'react';
import { FaEye, FaBoxOpen, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';

function OverviewTab({ stats, recentOrders, websites, navigate, setSelectedWebsite }) {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FaEye className="text-xl" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.views || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Total Page Views</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FaBoxOpen className="text-xl" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.orders || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Total Orders</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">₹{stats?.revenue?.toLocaleString() || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
        </div>
      </div>

      {/* My Storefronts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">My Storefronts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites && websites.length > 0 ? websites.map((website, index) => (
            <div key={website._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-gray-900 truncate">Storefront {index + 1}</div>
                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full">{website.views || 0} views</span>
              </div>
              <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                Template: <span className="font-medium capitalize">{website.template}</span><br/>
                Slug: <span className="font-medium text-gray-700">{website.slug}</span>
              </div>
              <div className="mt-auto flex gap-2">
                <button 
                  onClick={() => window.open(`/website/${website.slug}`, '_blank')}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 border border-gray-200"
                >
                  <FaEye /> View
                </button>
                <button 
                  onClick={() => {
                    setSelectedWebsite(website);
                    navigate('edit-website');
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 border border-blue-200"
                >
                  Edit Design
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p>No storefronts created yet. Start by creating a new store from the Templates section!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Container */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Recent Orders */}
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button onClick={() => navigate('orders')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {recentOrders && recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-900">No orders yet</p>
                <p className="text-sm mt-1">When customers place orders, they'll appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {recentOrders && recentOrders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <div>{order.customerPhone}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {order.items?.map(i => `${i.name}`).join(', ') || 'Order placed'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
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
