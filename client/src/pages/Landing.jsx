import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaStore, FaPaintBrush, FaRobot, FaMobileAlt,
  FaArrowRight, FaTimes, FaBars, FaSignOutAlt
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function Landing({ token, setToken, setBusinessId }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sendOTP = async () => {
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { phone });
      setShowOtp(true);
    } catch (error) {
      alert('Failed to send OTP. For demo, it might still proceed.');
      setShowOtp(true);
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
    } catch (error) {
      alert('Invalid OTP. Use 123456 for demo.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setBusinessId(null);
  };

  return (
    <div className="min-h-screen bg-page font-sans text-primary">
      {/* Navbar */}
      <nav className="bg-page border-b border-borderline sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-cta rounded-xl flex items-center justify-center text-white shadow-md">
                <FaStore className="text-xl" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-primary hover:text-accent transition-colors">VendorBuild</span>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              {token ? (
                <>
                  <button onClick={() => navigate('/templates')} className="text-muted hover:text-accent font-medium transition-colors">Templates</button>
                  <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-accent font-medium transition-colors">Dashboard</button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-muted hover:text-red-600 font-medium transition-colors">
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="text-muted hover:text-accent font-medium transition-colors">Features</a>
                  <a href="#how-it-works" className="text-muted hover:text-accent font-medium transition-colors">How it Works</a>
                  <a href="#pricing" className="text-muted hover:text-accent font-medium transition-colors">Pricing</a>
                  <button onClick={() => navigate('/admin')} className="text-muted hover:text-accent font-medium transition-colors">Admin Panel</button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center">
              {token ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-cta hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-cta hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
                >
                  Get Started
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-muted hover:text-primary focus:outline-none">
                {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-page border-b border-borderline px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
            {token ? (
              <>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/templates'); }} className="w-full text-left px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-sidebar rounded-md">Templates</button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="w-full text-left px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-sidebar rounded-md">Dashboard</button>
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
                  <FaSignOutAlt /> Logout
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-accent hover:bg-sidebar rounded-md mt-2"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-sidebar rounded-md">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-sidebar rounded-md">How it Works</a>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }} className="w-full text-left px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-sidebar rounded-md">Admin Panel</button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-accent hover:bg-sidebar rounded-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Main Content with Login Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12">
        {/* Left side content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
            ✨ The future of commerce
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Build your online store in <span className="text-blue-600">30 seconds</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto lg:mx-0">
            No drag-and-drop. No complex menus. Just talk to our AI and watch your professional ecommerce website generate instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <a href="#login" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto text-center">
              Start Free Trial
            </a>
            <a href="#features" className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-lg font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center">
              See how it works
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
            <p>Join 10,000+ businesses already growing with VendorBuild</p>
          </div>
        </div>

        {/* Login Box */}
        {token ? (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 z-10 transform transition-all hover:-translate-y-1">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStore className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome back!</h3>
              <p className="text-gray-500 mt-2">You are currently logged in.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md flex justify-center items-center gap-2"
            >
              Go to Dashboard <FaArrowRight className="text-sm" />
            </button>
          </div>
        ) : (
          <div id="login" className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h3>
              <p className="text-gray-500">Enter your phone number to get started instantly.</p>
            </div>

            {!showOtp ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
                    <span className="bg-gray-50 text-gray-500 px-4 py-3 border-r border-gray-300 font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 px-4 py-3 outline-none text-gray-900 w-full"
                    />
                  </div>
                </div>
                <button
                  onClick={sendOTP}
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Continue'}
                  {!loading && <FaArrowRight className="text-sm" />}
                </button>
                <p className="text-xs text-center text-gray-400">By continuing, you agree to our Terms of Service.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full border border-gray-300 rounded-xl p-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-blue-600 font-medium">Demo OTP: 123456</p>
                    <button onClick={() => setShowOtp(false)} className="text-xs text-gray-500 hover:text-gray-900 underline">Change Number</button>
                  </div>
                </div>
                <button
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Verify & Login'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed online
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We've completely reimagined how businesses go online. Stop wrestling with drag-and-drop builders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FaRobot className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Just talk to our AI. Tell it what your business does, and it will generate your entire website structure, copy, and layout automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FaPaintBrush className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Designs</h3>
              <p className="text-gray-600 leading-relaxed">
                Get a world-class, premium design that looks like you paid an agency thousands of dollars, ready out of the box.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FaMobileAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Optimized</h3>
              <p className="text-gray-600 leading-relaxed">
                Your store will look perfect and load blazing fast on every device, ensuring you never lose a customer to a clunky mobile experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <FaStore className="text-sm" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 hover:text-blue-600 transition-colors">VendorBuild</span>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; 2026 VendorBuild Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;