import React from 'react';
import { FaEye, FaBoxOpen, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';

function OverviewTab({ stats, recentOrders, websiteUrl, navigate }) {
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

      {/* Quick Actions & Recent Orders Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders - Takes up 2 columns on lg */}
        <div className="lg:col-span-2">
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

        {/* Quick Setup / Help Section */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Setup</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add your first product</h3>
                  <p className="text-sm text-gray-500 mt-1">Start by adding items to your store.</p>
                  <button onClick={() => navigate('products')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                    Add product &rarr;
                  </button>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100"></div>
              
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Customize design</h3>
                  <p className="text-sm text-gray-500 mt-1">Change colors, fonts, and layout.</p>
                  <button onClick={() => navigate('edit-website')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                    Edit website &rarr;
                  </button>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100"></div>
              
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Share your store</h3>
                  <p className="text-sm text-gray-500 mt-1">Get your first visitors by sharing.</p>
                  <button onClick={() => window.open(websiteUrl, '_blank')} className="mt-2 text-sm text-blue-600 font-medium hover:underline">
                    View website &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default OverviewTab;
