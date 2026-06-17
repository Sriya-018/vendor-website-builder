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
      
      const response = await axios.post(`${API_URL}/ai/generate-website`, {
        businessData,
        photos,
        template: businessData.category,
        theme: { primaryColor: '#2563eb', secondaryColor: '#4f46e5' }
      });
      
      const saveRes = await axios.post(`${API_URL}/website/${businessId}`, {
        html: response.data.html,
        css: response.data.css,
        template: businessData.category,
        published: true
      });
      
      navigate(`/website/${saveRes.data.slug}`);
    } catch (error) {
      alert('Failed to generate website');
    }
    setLoading(false);
  };

  const steps = ['Business Type', 'Details', 'Photos', 'Launch'];

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans text-gray-800 flex flex-col">
      {/* Top Navbar / Stepper */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 md:py-6 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0 hidden sm:block"></div>
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              
              return (
                <div key={index} className="relative z-10 flex flex-col items-center flex-1 sm:flex-none">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base border-2 transition-colors ${
                    isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                    isCompleted ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <FaCheck /> : stepNumber}
                  </div>
                  <div className={`text-xs md:text-sm mt-2 font-medium hidden sm:block ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What kind of business are you building?</h1>
              <p className="text-gray-500">Select an industry to help us tailor your experience.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setBusinessData({ ...businessData, category: type.id });
                    setStep(2);
                  }}
                  className={`bg-white border-2 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    businessData.category === type.id ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {type.icon}
                  <span className="font-semibold text-gray-800 text-sm md:text-base">{type.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleVoiceSetup}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
              >
                {isRecording ? (
                  <>
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    Listening...
                  </>
                ) : (
                  <>
                    <FaMicrophone className="text-gray-400" />
                    Describe your business with voice instead
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Business Details</h2>
            <p className="text-gray-500 mb-8">Provide some basic information to get started.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY"
                  value={businessData.location}
                  onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Tell us a bit about what you do..."
                  value={businessData.description}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow resize-none"
                  rows="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Services or Products</label>
                <input
                  type="text"
                  placeholder="e.g. Consulting, Design, Marketing"
                  value={businessData.services.join(', ')}
                  onChange={(e) => setBusinessData({ 
                    ...businessData, 
                    services: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                />
                <p className="text-xs text-gray-400 mt-2">Separate multiple items with a comma.</p>
              </div>
            </div>
            
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!businessData.businessName}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Photos
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Add Media</h2>
             <p className="text-gray-500 mb-8">Upload photos to make your website stand out.</p>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { type: 'shop_front', label: 'Store or Banner', icon: <FaImage className="text-3xl text-gray-400 mb-3" /> },
                { type: 'product', label: 'Product Highlights', icon: <FaCamera className="text-3xl text-gray-400 mb-3" /> },
                { type: 'owner', label: 'Team or Owner', icon: <FaIdBadge className="text-3xl text-gray-400 mb-3" /> },
                { type: 'price_list', label: 'Menus or Pricing', icon: <FaListAlt className="text-3xl text-gray-400 mb-3" /> }
              ].map((item) => (
                <label
                  key={item.type}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
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
                  <div className="font-semibold text-gray-800">{item.label}</div>
                  <div className="text-sm text-blue-600 font-medium mt-2">Browse Files</div>
                </label>
              ))}
            </div>
            
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Skip or Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up text-center bg-white p-10 md:p-16 rounded-2xl shadow-sm border border-gray-200 max-w-xl mx-auto w-full">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStore className="text-blue-600 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h2>
            <p className="text-gray-500 mb-10 text-lg">
              We have everything we need to construct a beautiful, professional website for {businessData.businessName || 'your business'}.
            </p>
            <button
              onClick={generateWebsite}
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 mx-auto"
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