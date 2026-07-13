import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaStore, FaPhone, FaMapMarkerAlt, FaHashtag, FaEnvelope, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaMoneyBillWave, FaGlobe } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function SettingsTab({ businessId, businessData, onUpdate, refreshData, websites, selectedWebsite, setSelectedWebsite }) {
  const [formData, setFormData] = useState({
    businessName: '',
    storeName: '',
    logo: '',
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
    },
    paymentInfo: {
      upiId: '',
      bankDetails: '',
      instructions: ''
    },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Handle store selection changes
  useEffect(() => {
    if (selectedWebsite) {
      // Load specific store's info, fallback to businessData if storeInfo is empty
      const storeInfo = selectedWebsite.storeInfo || {};
      const seo = selectedWebsite.seo || {};
      setFormData({
        businessName: storeInfo.businessName ?? businessData?.businessName ?? '',
        storeName: selectedWebsite.storeName ?? '',
        logo: storeInfo.logo ?? businessData?.logo ?? '',
        description: storeInfo.description ?? businessData?.description ?? '',
        category: storeInfo.category ?? businessData?.category ?? '',
        email: storeInfo.contact?.email ?? businessData?.contact?.email ?? '',
        phone: storeInfo.contact?.phone ?? businessData?.contact?.phone ?? '',
        address: storeInfo.location?.address ?? businessData?.location?.address ?? '',
        socialMedia: {
          instagram: storeInfo.socialMedia?.instagram ?? businessData?.socialMedia?.instagram ?? '',
          facebook: storeInfo.socialMedia?.facebook ?? businessData?.socialMedia?.facebook ?? '',
          twitter: storeInfo.socialMedia?.twitter ?? businessData?.socialMedia?.twitter ?? '',
          whatsapp: storeInfo.socialMedia?.whatsapp ?? businessData?.socialMedia?.whatsapp ?? ''
        },
        paymentInfo: {
          upiId: storeInfo.paymentInfo?.upiId ?? businessData?.paymentInfo?.upiId ?? '',
          bankDetails: storeInfo.paymentInfo?.bankDetails ?? businessData?.paymentInfo?.bankDetails ?? '',
          instructions: storeInfo.paymentInfo?.instructions ?? businessData?.paymentInfo?.instructions ?? ''
        },
        seoTitle: seo.title ?? '',
        seoDescription: seo.description ?? '',
        seoKeywords: seo.keywords ?? ''
      });
    } else if (businessData) {
      // Load global business defaults
      setFormData({
        businessName: businessData.businessName || '',
        storeName: '',
        logo: businessData.logo || '',
        description: businessData.description || '',
        category: businessData.category || '',
        email: businessData.contact?.email || '',
        phone: businessData.contact?.phone || '',
        address: businessData.location?.address || '',
        socialMedia: {
          instagram: businessData.socialMedia?.instagram || '',
          facebook: businessData.socialMedia?.facebook || '',
          twitter: businessData.socialMedia?.twitter || '',
          whatsapp: businessData.socialMedia?.whatsapp || ''
        },
        paymentInfo: {
          upiId: businessData.paymentInfo?.upiId || '',
          bankDetails: businessData.paymentInfo?.bankDetails || '',
          instructions: businessData.paymentInfo?.instructions || ''
        },
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
    }
  }, [businessData, selectedWebsite]);

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
    } else if (name.startsWith('payment_')) {
      const paymentField = name.replace('payment_', '');
      setFormData(prev => ({
        ...prev,
        paymentInfo: {
          ...prev.paymentInfo,
          [paymentField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo size must be less than 2MB");
        return;
      }
      try {
        setIsSaving(true);
        const logoFormData = new FormData();
        logoFormData.append('image', file, 'logo.png');
        const uploadResponse = await axios.post(`${API_URL}/upload/product-image`, logoFormData);
        const uploadedLogoUrl = uploadResponse.data.url;
        setFormData(prev => ({ ...prev, logo: uploadedLogoUrl }));
        setMessage('Logo uploaded! Click Save to apply changes.');
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        console.error('Logo upload failed', error);
        alert('Failed to upload logo');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage('');
      
      if (selectedWebsite) {
        // Save to specific website's storeInfo and storeName
        const updateData = {
          storeName: formData.storeName,
          storeInfo: {
            businessName: formData.businessName,
            logo: formData.logo,
            description: formData.description,
            category: formData.category,
            contact: {
              phone: formData.phone,
              email: formData.email
            },
            location: {
              address: formData.address
            },
            socialMedia: formData.socialMedia,
            paymentInfo: formData.paymentInfo
          },
          seo: {
            title: formData.seoTitle,
            description: formData.seoDescription,
            keywords: formData.seoKeywords
          }
        };

        const res = await axios.put(`${API_URL}/website/update/${selectedWebsite._id}`, updateData);
        setMessage('Store-specific settings saved successfully!');
        
        // Update local selectedWebsite reference so the UI doesn't jump
        if (setSelectedWebsite) {
          setSelectedWebsite(res.data);
        }
      } else {
        // Save to global business object
        const updateData = {
          businessName: formData.businessName,
          logo: formData.logo,
          description: formData.description,
          category: formData.category,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contact: { phone: formData.phone, email: formData.email, whatsapp: formData.socialMedia.whatsapp },
          location: { address: formData.address },
          socialMedia: formData.socialMedia,
          paymentInfo: formData.paymentInfo
        };

        const res = await axios.put(`${API_URL}/business/${businessId}`, updateData);
        if (onUpdate) onUpdate(res.data);
        if (refreshData) await refreshData();
        setMessage('Global settings saved successfully!');
      }

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Failed to update settings', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#13121A] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-lg overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 bg-slate-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Update information and contact details</p>
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-500 mb-1 uppercase tracking-wider">Editing Settings For:</label>
          <select 
            value={selectedWebsite ? selectedWebsite._id : 'global'} 
            onChange={(e) => {
              if (e.target.value === 'global') {
                if (setSelectedWebsite) setSelectedWebsite(null);
              } else {
                const site = websites.find(w => w._id === e.target.value);
                if (setSelectedWebsite) setSelectedWebsite(site);
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#09080E] border border-slate-300 dark:border-slate-700/60 rounded-lg text-sm font-medium text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="global">🏢 Global Business Defaults</option>
            {websites && websites.map(site => (
              <option key={site._id} value={site._id}>🏪 Store: {site.storeName || site.slug}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
              <FaStore className="text-purple-400" /> General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Business Name *
                </label>
                <input 
                  type="text" required name="businessName" value={formData.businessName} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none"
                />
              </div>

              {selectedWebsite && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Store Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logo ? (
                      <div className="relative w-16 h-16 bg-slate-50 dark:bg-[#09080E] rounded-lg border border-slate-200 dark:border-slate-800/60 flex items-center justify-center">
                        <img src={formData.logo.startsWith('http') ? formData.logo : `http://localhost:5000${formData.logo}`} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, logo: '' }))} style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px', padding: 0, margin: 0, lineHeight: '18px' }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white flex items-center justify-center rounded-full text-[12px] shadow hover:bg-red-600 border border-white z-10">&times;</button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-purple-600/10 rounded-lg border border-dashed border-purple-500/25 flex items-center justify-center text-purple-400">
                        <FaStore />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white dark:bg-[#13121A] border border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                      Upload New Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
              
              {selectedWebsite && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Store Name
                  </label>
                  <input 
                    type="text" name="storeName" value={formData.storeName} onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <input 
                  type="text" name="category" value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="e.g. Retail, Restaurant, Services"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description / Tagline</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none resize-none" 
                  placeholder="A short description of your business..."
                />
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
              <FaPhone className="text-purple-400" /> Contact Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaPhone className="text-slate-600 dark:text-slate-500 animate-pulse" /> Phone Number
                </label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaEnvelope className="text-slate-550" /> Email Address
                </label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-550" /> Address
                </label>
                <textarea 
                  name="address" value={formData.address} onChange={handleChange} rows="2"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none resize-none" 
                />
              </div>
            </div>
          </section>

          {/* Social Media Links */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
              <FaHashtag className="text-purple-400" /> Social Media
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaInstagram className="text-pink-500" /> Instagram Profile
                </label>
                <input 
                  type="url" name="social_instagram" value={formData.socialMedia.instagram} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaFacebook className="text-blue-500" /> Facebook Page
                </label>
                <input 
                  type="url" name="social_facebook" value={formData.socialMedia.facebook} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaTwitter className="text-blue-400" /> Twitter / X Profile
                </label>
                <input 
                  type="url" name="social_twitter" value={formData.socialMedia.twitter} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <FaWhatsapp className="text-emerald-500" /> WhatsApp Direct Link
                </label>
                <input 
                  type="url" name="social_whatsapp" value={formData.socialMedia.whatsapp} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="https://wa.me/yournumber"
                />
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-purple-400" /> Payment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">UPI ID</label>
                <input 
                  type="text" name="payment_upiId" value={formData.paymentInfo.upiId} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none" 
                  placeholder="e.g. yourname@upi"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bank Details / Other Info</label>
                <textarea 
                  name="payment_bankDetails" value={formData.paymentInfo.bankDetails} onChange={handleChange} rows="2"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none resize-none" 
                  placeholder="Account Number, IFSC code, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Payment Instructions for Customers</label>
                <textarea 
                  name="payment_instructions" value={formData.paymentInfo.instructions} onChange={handleChange} rows="2"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none resize-none" 
                  placeholder="e.g. Please send a screenshot of the payment on WhatsApp after placing the order."
                />
              </div>
            </div>
          </section>

          {/* SEO (Search Engine Optimization) - Only for individual websites */}
          {selectedWebsite && (
            <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
                <FaGlobe className="text-purple-400" /> Search Engine Optimization (SEO)
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Meta Title
                  </label>
                  <input 
                    type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none"
                    placeholder="e.g. Premium Florist Shop | Flora Hub"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Appears as the main clickable headline in search engines. Recommended length: 50-60 characters.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Meta Description
                  </label>
                  <textarea 
                    name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows="2"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none resize-none" 
                    placeholder="e.g. Order fresh bouquets, roses, and wedding flowers online. Same-day delivery with 100% freshness guarantee. Order now!"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Appears as the snippet below your page title. Recommended length: 150-160 characters.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Keywords
                  </label>
                  <input 
                    type="text" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 dark:bg-[#09080E] focus:bg-white dark:focus:bg-slate-900 dark:bg-[#0D0C14] text-slate-900 dark:text-slate-200 transition-all outline-none"
                    placeholder="e.g. flowers, florist, bouquet delivery, roses, gift shop"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">Comma-separated tags representing search terms relevant to your business.</p>
                </div>
              </div>
            </section>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save {selectedWebsite ? 'Store Settings' : 'Global Settings'}
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
