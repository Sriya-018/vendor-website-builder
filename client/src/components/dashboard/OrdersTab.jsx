import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaSync, FaGlobe } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function OrdersTab({ businessId, websites }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [businessId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/business/${businessId}/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await axios.put(`${API_URL}/business/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
    } catch (error) {
      console.error('Failed to update order status', error);
      alert('Error updating order. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingId(orderId + '_payment');
      const res = await axios.put(`${API_URL}/business/orders/${orderId}`, { paymentStatus: newPaymentStatus });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
    } catch (error) {
      console.error('Failed to update payment status', error);
      alert('Error updating payment status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Stores Found</h2>
        <p className="text-gray-500 mb-6">Create a store from the Overview tab before viewing orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <button onClick={fetchOrders} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition-colors" title="Refresh Orders">
          <FaSync className={isLoading ? 'animate-spin text-blue-600' : 'text-gray-500'} /> Refresh Orders
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Loading orders...</div>
      ) : (
        websites.map((website) => {
          const storeOrders = orders.filter(o => o.websiteId === website._id || o.storeName === website.slug);

          return (
            <div key={website._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaGlobe className="text-blue-500" />
                    Store: <span className="font-medium text-gray-700">{website.storeName || website.slug}</span>
                  </h2>
                  <p className="text-sm text-gray-500">Manage customer orders placed on this specific website</p>
                </div>
                <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold">
                  {storeOrders.length} Order{storeOrders.length !== 1 ? 's' : ''}
                </div>
              </div>

              {storeOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 text-2xl">
                    <FaBoxOpen />
                  </div>
                  <p className="text-lg font-medium text-gray-900">No orders yet</p>
                  <p className="mt-1">When customers place orders on {website.slug}, they will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                        <th className="px-6 py-4 font-medium">Order Details</th>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Status & Payment</th>
                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {storeOrders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 mb-1">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                            <div className="text-xs text-gray-500 max-w-[200px]">
                              {order.items?.map((i, idx) => (
                                <div key={idx} className="truncate">{i.quantity}x {i.name}</div>
                              ))}
                            </div>
                            {order.notes && <div className="text-xs text-red-500 mt-1 mt-1 truncate max-w-[200px]">Note: {order.notes}</div>}
                            <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="font-medium text-gray-900">{order.customerName || 'Guest'}</div>
                            <div>{order.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                disabled={updatingId === order._id}
                                className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)} ${updatingId === order._id ? 'opacity-50' : ''}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <select
                                value={order.paymentStatus || 'unpaid'}
                                onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                                disabled={updatingId === order._id + '_payment'}
                                className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                                } ${updatingId === order._id + '_payment' ? 'opacity-50' : ''}`}
                              >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-medium text-gray-900 mb-1">
                              ₹{order.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-medium">
                              {order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : order.paymentMethod === 'pay_on_delivery' ? 'COD' : 'Manual'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Unassigned / Legacy Orders */}
      {orders.filter(o => !websites.some(w => w._id === o.websiteId || w.slug === o.storeName)).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaBoxOpen className="text-gray-500" />
                Unassigned Orders
              </h2>
              <p className="text-sm text-gray-500">Older orders or orders not associated with a specific active store.</p>
            </div>
            <div className="bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-sm font-bold">
              {orders.filter(o => !websites.some(w => w._id === o.websiteId || w.slug === o.storeName)).length} Order(s)
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Order Details</th>
                  <th className="px-6 py-4 font-medium">Store Name</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status & Payment</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {orders.filter(o => !websites.some(w => w._id === o.websiteId || w.slug === o.storeName)).map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 max-w-[200px]">
                        {order.items?.map((i, idx) => (
                          <div key={idx} className="truncate">{i.quantity}x {i.name}</div>
                        ))}
                      </div>
                      {order.notes && <div className="text-xs text-red-500 mt-1 mt-1 truncate max-w-[200px]">Note: {order.notes}</div>}
                      <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.storeName || 'Main Store'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-gray-900">{order.customerName || 'Guest'}</div>
                      <div>{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)} ${updatingId === order._id ? 'opacity-50' : ''}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                          value={order.paymentStatus || 'unpaid'}
                          onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id + '_payment'}
                          className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                          } ${updatingId === order._id + '_payment' ? 'opacity-50' : ''}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900 mb-1">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-medium">
                        {order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : order.paymentMethod === 'pay_on_delivery' ? 'COD' : 'Manual'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersTab;
