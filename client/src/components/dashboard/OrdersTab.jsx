import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaSync, FaGlobe, FaDownload } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function OrdersTab({ businessId, websites }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }
    const headers = [
      "Order ID",
      "Store Name",
      "Customer Name",
      "Phone Number",
      "Order Date",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Items Breakdown"
    ];
    const rows = orders.map(order => {
      const itemsList = (order.items || [])
        .map(item => `${item.name} (x${item.quantity})`)
        .join("; ");
      
      return [
        order._id || "",
        order.storeName || "",
        order.customerDetails?.name || "",
        order.customerDetails?.phone || "",
        order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
        order.totalAmount || 0,
        order.paymentMethod || "",
        order.paymentStatus || "",
        order.status || "",
        `"${itemsList}"`
      ];
    });

    const csvRows = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      case 'pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'confirmed': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'ready': return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-800 text-slate-450 border-slate-700';
    }
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Stores Found</h2>
        <p className="text-slate-450 mb-6">Create a store from the Overview tab before viewing orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center gap-3 mb-4">
        <button
          type="button"
          onClick={exportOrdersCSV}
          className="flex items-center gap-2 bg-[#13121A] border border-slate-700/60 text-slate-350 hover:text-white px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
        >
          <FaDownload className="text-slate-400" /> Export CSV Report
        </button>
        <button onClick={fetchOrders} className="flex items-center gap-2 bg-[#13121A] border border-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-800 hover:border-slate-600 transition-colors shadow-sm text-sm" title="Refresh Orders">
          <FaSync className={isLoading ? 'animate-spin text-purple-400' : 'text-slate-500'} /> Refresh Orders
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Loading orders...</div>
      ) : (
        websites.map((website) => {
          const storeOrders = orders.filter(o => o.websiteId === website._id || o.storeName === website.slug);

          return (
            <div key={website._id} className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaGlobe className="text-indigo-400" />
                    Store: <span className="font-medium text-slate-350">{website.storeName || website.slug}</span>
                  </h2>
                  <p className="text-sm text-slate-400">Manage customer orders placed on this specific website</p>
                </div>
                <div className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-1 px-3 rounded-full text-sm font-bold">
                  {storeOrders.length} Order{storeOrders.length !== 1 ? 's' : ''}
                </div>
              </div>

              {storeOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20 text-2xl">
                    <FaBoxOpen />
                  </div>
                  <p className="text-lg font-medium text-white">No orders yet</p>
                  <p className="mt-1 text-slate-450">When customers place orders on {website.slug}, they will appear here.</p>
                </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/60 border-b border-slate-800/60 text-xs uppercase text-slate-500 tracking-wider font-semibold">
                          <th className="px-6 py-4 font-semibold">Order Details</th>
                          <th className="px-6 py-4 font-semibold">Customer</th>
                          <th className="px-6 py-4 font-semibold">Status & Payment</th>
                          <th className="px-6 py-4 text-right font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {storeOrders.map(order => (
                          <tr key={order._id} className="hover:bg-slate-800/20 transition-colors">
                           <td className="px-6 py-4">
                              <div className="font-medium text-white mb-1">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                              <div className="text-xs text-slate-450 max-w-[200px]">
                                {order.items?.map((i, idx) => (
                                  <div key={idx} className="truncate">{i.quantity}x {i.name}</div>
                                ))}
                              </div>
                              {order.notes && <div className="text-xs text-red-400 mt-1 truncate max-w-[200px]">Note: {order.notes}</div>}
                              <div className="text-xs text-slate-555 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-400">
                              <div className="font-medium text-white">{order.customerName || 'Guest'}</div>
                              <div>{order.customerPhone}</div>
                            </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                disabled={updatingId === order._id}
                                className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStatusColor(order.status)} ${updatingId === order._id ? 'opacity-50' : ''}`}
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
                                className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                  order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                } ${updatingId === order._id + '_payment' ? 'opacity-50' : ''}`}
                              >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-medium text-white mb-1">
                              ₹{order.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500 uppercase font-medium">
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
        <div className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaBoxOpen className="text-purple-400" />
                Unassigned Orders
              </h2>
              <p className="text-sm text-slate-400">Older orders or orders not associated with a specific active store.</p>
            </div>
            <div className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-1 px-3 rounded-full text-sm font-bold">
              {orders.filter(o => !websites.some(w => w._id === o.websiteId || w.slug === o.storeName)).length} Order(s)
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800/60 text-xs uppercase text-slate-500 tracking-wider font-semibold">
                  <th className="px-6 py-4 font-semibold">Order Details</th>
                  <th className="px-6 py-4 font-semibold">Store Name</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Status & Payment</th>
                  <th className="px-6 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {orders.filter(o => !websites.some(w => w._id === o.websiteId || w.slug === o.storeName)).map(order => (
                  <tr key={order._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                      <div className="text-xs text-slate-450 max-w-[200px]">
                        {order.items?.map((i, idx) => (
                          <div key={idx} className="truncate">{i.quantity}x {i.name}</div>
                        ))}
                      </div>
                      {order.notes && <div className="text-xs text-red-400 mt-1 truncate max-w-[200px]">Note: {order.notes}</div>}
                      <div className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {order.storeName || 'Main Store'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="font-medium text-white">{order.customerName || 'Guest'}</div>
                      <div>{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStatusColor(order.status)} ${updatingId === order._id ? 'opacity-50' : ''}`}
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
                          className={`text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          } ${updatingId === order._id + '_payment' ? 'opacity-50' : ''}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-white mb-1">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-550 uppercase font-medium">
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
