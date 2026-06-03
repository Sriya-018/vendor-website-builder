import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaArrowLeft } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function EditWebsite({ token, businessId }) {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const businessRes = await axios.get(`${API_URL}/business/${businessId}`);
      setBusiness(businessRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const saveEdit = async () => {
    if (!editingField) return;
    
    const updateData = {};
    if (editingField === 'businessName') {
      updateData.businessName = tempValue;
    } else if (editingField === 'location') {
      updateData.location = { address: tempValue };
    } else if (editingField === 'phone') {
      updateData.contact = { ...business.contact, phone: tempValue };
    }
    
    await axios.put(`${API_URL}/business/${businessId}`, updateData);
    setBusiness({ ...business, ...updateData });
    setEditingField(null);
    setTempValue('');
  };

  if (!business) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="p-2">
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-bold flex-1">Edit Website</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Business Name</div>
              <div className="font-medium">{business.businessName || 'Not set'}</div>
            </div>
            <button
              onClick={() => handleEdit('businessName', business.businessName)}
              className="text-gray-400 p-2"
            >
              <FaPencilAlt />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Location</div>
              <div className="font-medium">{business.location?.address || 'Not set'}</div>
            </div>
            <button
              onClick={() => handleEdit('location', business.location?.address)}
              className="text-gray-400 p-2"
            >
              <FaPencilAlt />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Phone</div>
              <div className="font-medium">{business.contact?.phone || 'Not set'}</div>
            </div>
            <button
              onClick={() => handleEdit('phone', business.contact?.phone)}
              className="text-gray-400 p-2"
            >
              <FaPencilAlt />
            </button>
          </div>
        </div>
      </div>

      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Edit {editingField}</h3>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditWebsite;