import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaMicrophone, FaStore, FaCheck, FaUtensils, 
  FaCut, FaShoppingCart, FaWrench, FaCoffee, 
  FaTshirt, FaImage, FaCamera, FaIdBadge, FaListAlt 
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const businessTypes = [
  { id: 'restaurant', name: 'Restaurant', icon: <FaUtensils className="text-2xl mb-3 text-orange-500" /> },
  { id: 'tailor', name: 'Apparel & Tailor', icon: <FaTshirt className="text-2xl mb-3 text-purple-500" /> },
  { id: 'grocery', name: 'Grocery & Retail', icon: <FaShoppingCart className="text-2xl mb-3 text-green-500" /> },
  { id: 'salon', name: 'Salon & Spa', icon: <FaCut className="text-2xl mb-3 text-pink-500" /> },
  { id: 'mechanic', name: 'Mechanic', icon: <FaWrench className="text-2xl mb-3 text-blue-500" /> },
  { id: 'tea_shop', name: 'Cafe & Tea', icon: <FaCoffee className="text-2xl mb-3 text-yellow-600" /> },
];

function Setup({ token, businessId, setBusinessId }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState({
    category: '',
    businessName: '',
    location: '',
    services: [],
    description: ''
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapedProducts, setScrapedProducts] = useState([]);

  const handleUrlScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/scrape-and-recommend`, { url: scrapeUrl });
      setBusinessData({
        category: response.data.recommendedTemplate || 'grocery',
        businessName: response.data.business?.businessName || '',
        location: response.data.business?.address || '',
        services: response.data.extractedProducts?.map(p => p.name) || [],
        description: response.data.business?.description || ''
      });
      setScrapedProducts(response.data.extractedProducts || []);
      setStep(2);
    } catch (error) {
      console.error('Scraping error:', error);
      alert(error.response?.data?.error || error.message || 'Failed to import business details from the URL.');
    }
    setLoading(false);
  };

  const handleVoiceSetup = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setLoading(true);
      
      try {
        const response = await axios.post(`${API_URL}/ai/extract-business`, { text });
        setBusinessData(prev => ({
          ...prev,
          businessName: response.data.businessName || prev.businessName,
          location: response.data.location || prev.location,
          services: response.data.services || prev.services,
          description: response.data.description || prev.description
        }));
        setStep(2);
      } catch (error) {
        alert('Failed to process voice input');
      }
      setLoading(false);
    };
    
    recognition.start();
  };

  const handlePhotoUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      try {
        const response = await axios.post(`${API_URL}/upload/${businessId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPhotos(prev => [...prev, response.data]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const generateWebsite = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/business/${businessId}`, businessData);
      
      const categoryToTemplate = {
        restaurant: 't4',
        tailor: 't1',
        grocery: 't28',
        salon: 't3',
        mechanic: 't33',
        tea_shop: 't10'
      };
      const templateId = categoryToTemplate[businessData.category] || 't1';

      const response = await axios.post(`${API_URL}/ai/generate-website`, {
        businessData,
        photos,
        template: templateId,
        theme: { primaryColor: '#2563eb', secondaryColor: '#4f46e5' },
        products: scrapedProducts
      });
      
      const saveRes = await axios.post(`${API_URL}/website/${businessId}/new`, {
        html: response.data.html,
        css: response.data.css,
        template: templateId,
        published: true
      });

      const newWebsiteId = saveRes.data._id;
      if (scrapedProducts.length > 0) {
        for (const product of scrapedProducts) {
          await axios.post(`${API_URL}/business/${businessId}/products`, {
            websiteId: newWebsiteId,
            name: product.name,
            price: Number(product.price) || 0,
            category: product.category || 'general',
            description: product.description || '',
            imageUrl: ''
          });
        }
      }
      
      navigate(`/website/${saveRes.data.slug}`);
    } catch (error) {
      console.error('Website launch failed:', error);
      alert('Failed to generate website');
    }
    setLoading(false);
  };

  const steps = ['Business Type', 'Details', 'Photos', 'Launch'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09080E] font-sans text-slate-200 flex flex-col">
      {/* Top Navbar / Stepper */}
      <div className="bg-white dark:bg-[#0D0C14] border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-10 px-4 py-4 md:py-6 shadow-xl shadow-black/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-slate-100 dark:bg-slate-800 z-0 hidden sm:block"></div>
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              
              return (
                <div key={index} className="relative z-10 flex flex-col items-center flex-1 sm:flex-none">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-2 transition-all ${
                    isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 
                    isCompleted ? 'bg-white dark:bg-[#13121A] border-indigo-500 text-indigo-400' : 'bg-white dark:bg-[#13121A] border-slate-300 dark:border-slate-700 text-slate-600'
                  }`}>
                    {isCompleted ? <FaCheck /> : stepNumber}
                  </div>
                  <div className={`text-xs md:text-sm mt-2 font-semibold hidden sm:block ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full px-4 py-8 md:py-12">
        
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">What kind of business are you building?</h1>
              <p className="text-slate-600 dark:text-slate-500">Select an industry to help us tailor your experience.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setBusinessData({ ...businessData, category: type.id });
                    setStep(2);
                  }}
                  className={`bg-white dark:bg-[#13121A] border-2 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-255 hover:-translate-y-1 hover:shadow-xl ${
                    businessData.category === type.id ? 'border-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/20 scale-[1.01]' : 'border-slate-200 dark:border-slate-800/60 hover:border-purple-500/40'
                  }`}
                >
                  {type.icon}
                  <span className="font-bold text-slate-200 text-sm md:text-base">{type.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVoiceSetup}
                  disabled={loading}
                  className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-[#13121A] border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 hover:border-slate-300 dark:border-slate-700 transition-colors shadow-sm font-semibold"
                >
                  {isRecording ? (
                    <>
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                      Listening...
                    </>
                  ) : (
                    <>
                      <FaMicrophone className="text-slate-600 dark:text-slate-400" />
                      Describe with voice instead
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up bg-white dark:bg-[#13121A] p-6 md:p-10 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800/60">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Business Details</h2>
            <p className="text-slate-600 dark:text-slate-500 mb-8">Provide some basic information to get started.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-[#09080E] rounded-xl p-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY"
                  value={businessData.location}
                  onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-[#09080E] rounded-xl p-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Description</label>
                <textarea
                  placeholder="Tell us a bit about what you do..."
                  value={businessData.description}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-[#09080E] rounded-xl p-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                  rows="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Key Services or Products</label>
                <input
                  type="text"
                  placeholder="e.g. Consulting, Design, Marketing"
                  value={businessData.services.join(', ')}
                  onChange={(e) => setBusinessData({ 
                    ...businessData, 
                    services: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-[#09080E] rounded-xl p-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium"
                />
                <p className="text-xs text-slate-600 mt-2">Separate multiple items with a comma.</p>
              </div>
            </div>
            
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800/40 hover:text-slate-200 font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!businessData.businessName}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Photos
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up bg-white dark:bg-[#13121A] p-6 md:p-10 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800/60">
             <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Add Media</h2>
             <p className="text-slate-600 dark:text-slate-500 mb-8">Upload photos to make your website stand out.</p>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { type: 'shop_front', label: 'Store or Banner', icon: <FaImage className="text-3xl text-slate-600 dark:text-slate-450 mb-3" /> },
                { type: 'product', label: 'Product Highlights', icon: <FaCamera className="text-3xl text-slate-600 dark:text-slate-450 mb-3" /> },
                { type: 'owner', label: 'Team or Owner', icon: <FaIdBadge className="text-3xl text-slate-600 dark:text-slate-450 mb-3" /> },
                { type: 'price_list', label: 'Menus or Pricing', icon: <FaListAlt className="text-3xl text-slate-600 dark:text-slate-450 mb-3" /> }
              ].map((item) => (
                <label
                  key={item.type}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, item.type)}
                    className="hidden"
                  />
                  <div className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</div>
                  <div className="text-sm text-indigo-400 font-bold mt-2">Browse Files</div>
                </label>
              ))}
            </div>
            
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800/40 hover:text-slate-200 font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.01]"
              >
                Skip or Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up text-center bg-white dark:bg-[#13121A] p-10 md:p-16 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800/60 max-w-xl mx-auto w-full">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
              <FaStore className="text-indigo-400 text-3xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">You're all set!</h2>
            <p className="text-slate-600 dark:text-slate-500 mb-10 text-lg">
              We have everything we need to construct a beautiful, professional website for {businessData.businessName || 'your business'}.
            </p>
            <button
              onClick={generateWebsite}
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 mx-auto shadow-lg shadow-indigo-500/15 hover:scale-[1.01] transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Magic...
                </>
              ) : (
                'Launch Website'
              )}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default Setup;