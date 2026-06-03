import React, { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaMicrophone, FaCamera, FaStore } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function Landing({ setToken, setBusinessId }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { phone });
      setShowOtp(true);
      alert('OTP sent! Use 123456 for demo');
    } catch (error) {
      alert('Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      alert('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
      setToken(response.data.token);
      setBusinessId(response.data.business.id);
      window.location.href = response.data.business.hasBusiness ? '/dashboard' : '/setup';
    } catch (error) {
      alert('Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="text-center pt-16 pb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-lg mb-6">
          <FaStore className="text-white text-5xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Start Your Shop</h1>
        <p className="text-gray-500 mt-2">in 30 seconds</p>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!showOtp ? (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">📞 Phone Number</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl p-3">
                  <span className="text-gray-500 mr-2">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 outline-none text-lg"
                  />
                </div>
              </div>
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 transition-transform active:scale-95"
              >
                {loading ? 'Sending...' : '🔴 Start Free'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">🔐 Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-center text-2xl tracking-widest outline-none"
                />
                <p className="text-xs text-gray-400 text-center mt-2">
                  Demo OTP: 123456
                </p>
              </div>
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 transition-transform active:scale-95"
              >
                {loading ? 'Verifying...' : '✅ Verify'}
              </button>
              <button
                onClick={() => setShowOtp(false)}
                className="w-full text-gray-500 py-3 mt-2 text-sm"
              >
                ← Edit phone number
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaPhone className="text-green-600 text-2xl" />
            </div>
            <span className="text-xs text-gray-600">Phone Login</span>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaMicrophone className="text-green-600 text-2xl" />
            </div>
            <span className="text-xs text-gray-600">Voice Setup</span>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaCamera className="text-green-600 text-2xl" />
            </div>
            <span className="text-xs text-gray-600">Photo Upload</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;