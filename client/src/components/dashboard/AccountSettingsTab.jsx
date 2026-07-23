import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function AccountSettingsTab({ business, onUpdate }) {
  const [profileForm, setProfileForm] = useState({
    businessName: business?.businessName || '',
    vendorEmail: business?.vendorEmail || '',
    vendorPhone: business?.vendorPhone || '',
  });

  const [profileMessage, setProfileMessage] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await axios.put(`${API_URL}/business/${business._id}`, {
        businessName: profileForm.businessName,
        vendorEmail: profileForm.vendorEmail,
        vendorPhone: profileForm.vendorPhone
      });
      if (onUpdate) onUpdate(res.data);
      setProfileMessage({ type: 'success', text: 'Account profile details updated successfully!' });
    } catch (err) {
      console.error(err);
      setProfileMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const initialLetter = profileForm.businessName?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">Account Settings</h1>
        <p className="text-slate-600 dark:text-slate-500 text-sm">Manage your profile details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Profile */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar Panel */}
          <div className="bg-white dark:bg-[#13121A] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative mb-4 group">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold text-2xl flex items-center justify-center rounded-full shadow-lg border-2 border-purple-500/30">
                {initialLetter}
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{profileForm.businessName || 'Workspace Owner'}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{profileForm.vendorEmail || 'No Email Added'}</p>
            <span className="mt-3 px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
              Admin Account
            </span>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Details Form */}
          <div className="bg-white dark:bg-[#13121A] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-3 mb-5 flex items-center gap-2">
              <FaUser className="text-purple-400 text-sm" /> Profile details
            </h3>

            {profileMessage && (
              <div className={`p-4 mb-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {profileMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Owner Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={profileForm.businessName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#09080E] border border-slate-300 dark:border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="vendorEmail"
                    value={profileForm.vendorEmail}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#09080E] border border-slate-300 dark:border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Linked Phone Number</label>
                <input
                  type="text"
                  name="vendorPhone"
                  value={profileForm.vendorPhone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#09080E] border border-slate-300 dark:border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.01] text-xs disabled:opacity-50"
                >
                  <FaSave />
                  {isSavingProfile ? 'Saving Details...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettingsTab;
