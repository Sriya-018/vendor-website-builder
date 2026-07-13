import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaSync, FaGlobe, FaTrash, FaUser, FaEnvelopeOpen } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function InquiriesTab({ businessId, websites }) {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, [businessId]);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/business/${businessId}/inquiries`);
      setInquiries(res.data);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      setDeletingId(inquiryId);
      await axios.delete(`${API_URL}/business/inquiries/${inquiryId}`);
      setInquiries(inquiries.filter(i => i._id !== inquiryId));
    } catch (error) {
      console.error('Failed to delete inquiry', error);
      alert('Error deleting message. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Stores Found</h2>
        <p className="text-slate-600 dark:text-slate-450 mb-6">Create a store from the Overview tab before viewing messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">Customer Inquiries</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Read and manage messages sent through your website's contact forms.</p>
        </div>
        <button 
          onClick={fetchInquiries} 
          className="flex items-center gap-2 bg-white dark:bg-[#13121A] border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 hover:border-slate-600 transition-colors shadow-sm text-sm" 
          title="Refresh Messages"
        >
          <FaSync className={isLoading ? 'animate-spin text-purple-400' : 'text-gray-500'} /> Refresh Messages
        </button>
      </div>

      {isLoading && inquiries.length === 0 ? (
        <div className="p-8 text-center text-slate-600 dark:text-slate-500">Loading messages...</div>
      ) : (
        websites.map((website) => {
          const storeInquiries = inquiries.filter(i => i.websiteId === website._id);

          return (
            <div key={website._id} className="bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden mb-6">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaGlobe className="text-indigo-400" />
                    Store: <span className="font-medium text-slate-600 dark:text-slate-400">{website.storeName || website.slug}</span>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Messages sent via {website.slug}.localhost</p>
                </div>
                <div className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-1 px-3 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <FaEnvelope /> {storeInquiries.length} Message{storeInquiries.length !== 1 ? 's' : ''}
                </div>
              </div>

              {storeInquiries.length === 0 ? (
                <div className="p-12 text-center text-slate-600 dark:text-slate-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20 text-2xl">
                    <FaEnvelopeOpen />
                  </div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">No messages yet</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-450">When customers fill out the Contact page form, their messages will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/60 text-xs uppercase text-slate-600 dark:text-slate-500 tracking-wider font-semibold">
                        <th className="px-6 py-4 font-semibold w-1/4">Sender Details</th>
                        <th className="px-6 py-4 font-semibold w-1/2">Message</th>
                        <th className="px-6 py-4 font-semibold w-1/6">Date</th>
                        <th className="px-6 py-4 font-semibold text-center w-12">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {storeInquiries.map(inquiry => (
                        <tr key={inquiry._id} className="hover:bg-slate-50 dark:hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <FaUser className="text-slate-600 dark:text-slate-400 text-xs" />
                              {inquiry.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-500 break-all">{inquiry.email}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-w-md break-words">
                            {inquiry.message}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-450 text-xs">
                            {new Date(inquiry.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteInquiry(inquiry._id)}
                              disabled={deletingId === inquiry._id}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50 p-2 hover:bg-red-500/10 rounded-lg transition-colors inline-block"
                              title="Delete Message"
                            >
                              <FaTrash />
                            </button>
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
    </div>
  );
}

export default InquiriesTab;
