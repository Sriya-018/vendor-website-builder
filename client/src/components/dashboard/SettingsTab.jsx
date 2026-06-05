import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaStore, FaPhone, FaMapMarkerAlt, FaHashtag, FaEnvelope, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function SettingsTab({ businessId, businessData, onUpdate }) {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    email: '',
    phone: '',
    address: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      whatsapp: ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (businessData) {
      setFormData({
        businessName: businessData.businessName || '',
        description: businessData.description || '',
        category: businessData.category || '',
        email: businessData.email || '',
        phone: businessData.contact?.phone || businessData.phone || '',
        address: businessData.location?.address || businessData.address || '',
        socialMedia: {
          instagram: businessData.socialMedia?.instagram || '',
          facebook: businessData.socialMedia?.facebook || '',
          twitter: businessData.socialMedia?.twitter || '',
          whatsapp: businessData.socialMedia?.whatsapp || ''
        }
      });
    }
  }, [businessData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialPlatform = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialPlatform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage('');
      
      const updateData = {
        businessName: formData.businessName,
        description: formData.description,
        category: formData.category,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        contact: { phone: formData.phone },
        location: { address: formData.address },
        socialMedia: formData.socialMedia
      };

      const res = await axios.put(`${API_URL}/business/${businessId}`, updateData);
      
      // Update parent component's business state if callback provided
      if (onUpdate) onUpdate(res.data);
      
      setMessage('Settings saved successfully! You may need to regenerate your website for changes to appear live.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Failed to update settings', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>
        <p className="text-sm text-gray-500">Update your business information and contact details</p>
      </div>

      <div className="p-6 md:p-8">
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FaStore className="text-gray-400" /> General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input 
                  type="text" required name="businessName" value={formData.businessName} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" name="category" value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Retail, Restaurant, Services"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Tagline</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" 
                  placeholder="A short description of your business..."
                />
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FaPhone className="text-gray-400" /> Contact Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaPhone className="text-gray-400" /> Phone Number
                </label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" /> Email Address
                </label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" /> Store Address
                </label>
                <textarea 
                  name="address" value={formData.address} onChange={handleChange} rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" 
                />
              </div>
            </div>
          </section>

          {/* Social Media Links */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FaHashtag className="text-gray-400" /> Social Media
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaInstagram className="text-pink-600" /> Instagram Profile
                </label>
                <input 
                  type="url" name="social_instagram" value={formData.socialMedia.instagram} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaFacebook className="text-blue-600" /> Facebook Page
                </label>
                <input 
                  type="url" name="social_facebook" value={formData.socialMedia.facebook} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaTwitter className="text-blue-400" /> Twitter / X Profile
                </label>
                <input 
                  type="url" name="social_twitter" value={formData.socialMedia.twitter} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaWhatsapp className="text-green-500" /> WhatsApp Direct Link
                </label>
                <input 
                  type="url" name="social_whatsapp" value={formData.socialMedia.whatsapp} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="https://wa.me/yournumber"
                />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsTab;
