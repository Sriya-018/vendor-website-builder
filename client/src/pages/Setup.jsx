import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaCamera, FaStore, FaCheck } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const businessTypes = [
  { id: 'restaurant', name: 'Restaurant', icon: '🍛', color: 'bg-orange-500' },
  { id: 'tailor', name: 'Tailor', icon: '🧵', color: 'bg-purple-500' },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: 'bg-green-500' },
  { id: 'salon', name: 'Salon', icon: '💇', color: 'bg-pink-500' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔧', color: 'bg-blue-500' },
  { id: 'tea_shop', name: 'Tea Shop', icon: '🍵', color: 'bg-yellow-500' },
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
        theme: { primaryColor: '#4CAF50', secondaryColor: '#FF9800' }
      });
      
      await axios.post(`${API_URL}/website/${businessId}`, {
        html: response.data.html,
        css: response.data.css,
        template: businessData.category,
        published: true
      });
      
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to generate website');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                step >= s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? <FaCheck className="text-xs" /> : s}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {s === 1 && 'Type'}
                {s === 2 && 'Details'}
                {s === 3 && 'Photos'}
                {s === 4 && 'Finish'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Choose your business</h2>
            <div className="grid grid-cols-2 gap-4">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setBusinessData({ ...businessData, category: type.id });
                    setStep(2);
                  }}
                  className={`${type.color} text-white p-6 rounded-2xl text-center transition-transform active:scale-95`}
                >
                  <div className="text-5xl mb-2">{type.icon}</div>
                  <div className="font-semibold">{type.name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleVoiceSetup}
              disabled={loading}
              className="w-full mt-6 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {isRecording ? (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  Recording...
                </>
              ) : (
                <>
                  <FaMicrophone /> Tell me instead of typing
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Tell us about your business</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="🏪 Business Name"
                value={businessData.businessName}
                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg"
              />
              <input
                type="text"
                placeholder="📍 Location"
                value={businessData.location}
                onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg"
              />
              <textarea
                placeholder="📝 Description"
                value={businessData.description}
                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg"
                rows="3"
              />
              <input
                type="text"
                placeholder="🔧 Services (comma separated)"
                value={businessData.services.join(', ')}
                onChange={(e) => setBusinessData({ 
                  ...businessData, 
                  services: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg"
              />
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg mt-6"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Add photos</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'shop_front', label: 'Shop Front', icon: '🏪' },
                { type: 'product', label: 'Products', icon: '📦' },
                { type: 'owner', label: 'Owner Photo', icon: '👤' },
                { type: 'price_list', label: 'Price List', icon: '💰' }
              ].map((item) => (
                <label
                  key={item.type}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoUpload(e, item.type)}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <div className="font-medium text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1">Tap to add</div>
                </label>
              ))}
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg mt-6"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStore className="text-green-600 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your website is ready!</h2>
            <p className="text-gray-600 mb-8">
              We've built a professional website for your business based on your inputs.
            </p>
            <button
              onClick={generateWebsite}
              disabled={loading}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
            >
              {loading ? 'Generating...' : '✨ Launch My Website'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setup;