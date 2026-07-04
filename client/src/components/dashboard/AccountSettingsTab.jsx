import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaSun, FaMoon, FaBell, FaLock, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function AccountSettingsTab({ theme, setTheme, business, onUpdate }) {
  const [profileForm, setProfileForm] = useState({
    businessName: business?.businessName || '',
    vendorEmail: business?.vendorEmail || '',
    vendorPhone: business?.vendorPhone || '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailInquiries: true,
    whatsappLogs: true,
    weeklyReport: false,
  });

  const [profileMessage, setProfileMessage] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePreference = (key) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your profile, adjust interface themes, and set email preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Quick Profile & Theme */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar Panel */}
          <div className="bg-[#13121A] rounded-2xl border border-slate-800/60 p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative mb-4 group">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold text-2xl flex items-center justify-center rounded-full shadow-lg border-2 border-purple-500/30">
                {initialLetter}
              </div>
            </div>
            <h2 className="text-base font-bold text-white leading-tight">{profileForm.businessName || 'Workspace Owner'}</h2>
            <p className="text-xs text-slate-500 mt-1">{profileForm.vendorEmail || 'No Email Added'}</p>
            <span className="mt-3 px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
              Admin Account
            </span>
          </div>

          {/* Theme Selector Panel */}
          <div className="bg-[#13121A] rounded-2xl border border-slate-800/60 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FaSun className="text-purple-400 text-xs" /> App Interface Theme
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all text-xs font-semibold ${
                  theme === 'dark'
                    ? 'bg-purple-600/10 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/5'
                    : 'bg-[#09080E] border-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FaMoon className="text-lg" />
                Carbon Dark
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all text-xs font-semibold ${
                  theme === 'light'
                    ? 'bg-purple-600/10 border-purple-500/40 text-purple-600 shadow-sm'
                    : 'bg-[#09080E] border-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FaSun className="text-lg" />
                Chalk Light
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Profile Details Form */}
          <div className="bg-[#13121A] rounded-2xl border border-slate-800/60 p-6 shadow-lg">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-3 mb-5 flex items-center gap-2">
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Owner Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={profileForm.businessName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-[#09080E] border border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="vendorEmail"
                    value={profileForm.vendorEmail}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 bg-[#09080E] border border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Linked Phone Number</label>
                <input
                  type="text"
                  name="vendorPhone"
                  value={profileForm.vendorPhone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-[#09080E] border border-slate-700/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-200"
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



          {/* Email Alert Preferences */}
          <div className="bg-[#13121A] rounded-2xl border border-slate-800/60 p-6 shadow-lg">
            <h3 className="text-base font-bold text-white border-b border-slate-850 pb-3 mb-5 flex items-center gap-2">
              <FaBell className="text-purple-400 text-sm" /> Alert Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Email alerts on new inquiries</h4>
                  <p className="text-xs text-slate-500">Receive an email instantly when customers submit WhatsApp checkout logs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('emailInquiries')}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    notificationPrefs.emailInquiries ? 'bg-purple-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    notificationPrefs.emailInquiries ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-850">
                <div>
                  <h4 className="text-sm font-bold text-white">WhatsApp logs mirroring</h4>
                  <p className="text-xs text-slate-500">Send copy of client checkout orders to linked business numbers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('whatsappLogs')}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    notificationPrefs.whatsappLogs ? 'bg-purple-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    notificationPrefs.whatsappLogs ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AccountSettingsTab;
