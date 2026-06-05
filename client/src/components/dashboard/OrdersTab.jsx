import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaSync } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function OrdersTab({ businessId }) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">Track and fulfill customer orders</p>
        </div>
        <button onClick={fetchOrders} className="text-gray-500 hover:text-blue-600 transition-colors p-2" title="Refresh Orders">
          <FaSync className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 text-2xl">
            <FaBoxOpen />
          </div>
          <p className="text-lg font-medium text-gray-900">No orders yet</p>
          <p className="mt-1">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-4 font-medium">Order Details</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {orders.map(order => (
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
  );
}

export default OrdersTab;
