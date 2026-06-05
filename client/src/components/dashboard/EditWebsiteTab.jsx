import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMagic, FaPalette, FaDesktop, FaCheckCircle, FaGlobe } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const THEMES = [
  { name: 'Blue', primary: '#2563eb', secondary: '#eff6ff' },
  { name: 'Red', primary: '#dc2626', secondary: '#fef2f2' },
  { name: 'Green', primary: '#16a34a', secondary: '#f0fdf4' },
  { name: 'Purple', primary: '#9333ea', secondary: '#faf5ff' },
  { name: 'Orange', primary: '#ea580c', secondary: '#fff7ed' },
  { name: 'Dark', primary: '#1f2937', secondary: '#f3f4f6' },
];

const TEMPLATES = [
  { id: 'modern', name: 'Modern Premium', description: 'Clean, bold, and highly converting design for any business.' },
  { id: 'elegant', name: 'Elegant Minimalist', description: 'Focus on images and subtle typography for luxury brands.' },
  { id: 'playful', name: 'Playful & Vibrant', description: 'Colorful and energetic layout for creative stores.' }
];

function EditWebsiteTab({ businessId, businessData }) {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      setPublishStatus('fetching_products');
      
      // 1. Fetch current products
      const productsRes = await axios.get(`${API_URL}/business/${businessId}/products`);
      const products = productsRes.data;
      
      const services = products.map(p => ({
        name: p.name,
        price: p.price,
        description: p.description
      }));
      
      const productImages = products.map(p => p.imageUrl || null);
      
      // Update businessData services with fresh products
      const updatedBusinessData = {
        ...businessData,
        services
      };

      setPublishStatus('generating');
      
      // 2. Generate new HTML
      const genRes = await axios.post(`${API_URL}/ai/generate-website`, {
        businessData: updatedBusinessData,
        productImages,
        template: activeTemplate,
        theme: {
          primaryColor: activeTheme.primary,
          secondaryColor: activeTheme.secondary
        }
      });
      
      setPublishStatus('saving');
      
      // 3. Save website
      await axios.post(`${API_URL}/website/${businessId}`, {
        html: genRes.data.html,
        css: genRes.data.css,
        template: activeTemplate,
        published: true
      });
      
      setPublishStatus('success');
      setTimeout(() => setPublishStatus(null), 3000);
      
    } catch (error) {
      console.error('Failed to regenerate website:', error);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  const websiteUrl = `/website/${businessData?.businessName?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Website Design</h2>
          <p className="text-sm text-gray-500">Customize the look and feel of your online store</p>
        </div>
        <button 
          onClick={() => window.open(websiteUrl, '_blank')}
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <FaGlobe /> View Live Site
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-10">
        
        {/* Templates Selection */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <FaDesktop className="text-gray-400" /> Select Layout Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map(template => (
              <div 
                key={template.id}
                onClick={() => setActiveTemplate(template.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTemplate === template.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900">{template.name}</h4>
                  {activeTemplate === template.id && <FaCheckCircle className="text-blue-500" />}
                </div>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Theme Colors */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <FaPalette className="text-gray-400" /> Choose Theme Color
          </h3>
          <div className="flex flex-wrap gap-4">
            {THEMES.map(theme => (
              <button
                key={theme.name}
                onClick={() => setActiveTheme(theme)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${activeTheme.name === theme.name ? 'border-blue-500 bg-blue-50 scale-105' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div 
                  className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center border border-gray-200"
                  style={{ backgroundColor: theme.primary }}
                >
                  {activeTheme.name === theme.name && <FaCheckCircle className="text-white drop-shadow-md" />}
                </div>
                <span className="text-xs font-medium text-gray-700">{theme.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Publish Action */}
        <section className="pt-6 border-t border-gray-200">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Publish Design Changes</h4>
              <p className="text-sm text-gray-500">Apply your selected template and theme to your live website. This will also sync any new products or setting changes.</p>
            </div>
            
            <div className="w-full md:w-auto">
              {publishStatus === 'error' && (
                <div className="text-red-500 text-sm font-medium mb-2 text-center md:text-right">Failed to publish. Try again.</div>
              )}
              {publishStatus === 'success' && (
                <div className="text-green-600 text-sm font-bold mb-2 text-center md:text-right">Website updated successfully!</div>
              )}
              
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPublishing ? (
                  <>
                    <FaMagic className="animate-pulse" />
                    {publishStatus === 'fetching_products' ? 'Syncing...' : 
                     publishStatus === 'generating' ? 'Designing...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <FaMagic /> Publish New Design
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default EditWebsiteTab;
