import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaStore, FaPaintBrush, FaRobot, FaMobileAlt, FaStar,
  FaArrowRight, FaTimes, FaBars, FaSignOutAlt, FaEnvelope, FaPhone
} from 'react-icons/fa';
import FloatingAsset from '../components/FloatingAsset';

const API_URL = 'http://localhost:5000/api';


function Landing({ token, setToken, setBusinessId }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginMethod, setLoginMethod] = useState('phone');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sendOTP = async () => {
    if (loginMethod === 'phone' && phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (loginMethod === 'email' && !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (loginMethod === 'phone') {
        response = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      } else {
        response = await axios.post(`${API_URL}/auth/send-otp`, { email });
      }
      
      setIsNewUser(response.data.isNewUser);
      setShowOtp(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 4) {
      alert('Please enter 4-digit OTP');
      return;
    }
    if (isNewUser && !businessName.trim()) {
      alert('Please enter your Business Name');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (loginMethod === 'phone') {
        response = await axios.post(`${API_URL}/auth/verify-otp`, { 
          phone,
          otp,
          ...(isNewUser && { businessName })
        });
      } else {
        response = await axios.post(`${API_URL}/auth/verify-otp`, { 
          email,
          otp,
          ...(isNewUser && { businessName })
        });
      }
      
      setToken(response.data.token);
      setBusinessId(response.data.business.id);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Invalid OTP.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setBusinessId(null);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 theme-${theme} ${theme === 'dark' ? 'bg-[#09080E] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'} relative overflow-hidden`}>
      
      {/* Decorative Glow Blobs (Vibrant Dark Mode Neon) */}
      <div className="absolute top-10 left-10 w-[35rem] h-[35rem] bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow-delay"></div>
      <div className="absolute bottom-10 left-1/4 w-[40rem] h-[40rem] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>

      {/* Tech Grid Background overlay with neon blue hints */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e8120_1px,transparent_1px),linear-gradient(to_bottom,#312e8120_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_85%,transparent_100%)] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="bg-[#09080E]/85 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <FaStore className="text-xl" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white hover:text-indigo-400 transition-colors">VendorBuild</span>
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              {token ? (
                <>
                  <button onClick={() => navigate('/templates')} className="text-slate-400 hover:text-white font-medium transition-colors">Templates</button>
                  <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white font-medium transition-colors">Dashboard</button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 font-medium transition-colors">
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="text-slate-400 hover:text-white font-medium transition-colors">Features</a>
                  <a href="#how-it-works" className="text-slate-400 hover:text-white font-medium transition-colors">How it Works</a>
                  <a href="#pricing" className="text-slate-400 hover:text-white font-medium transition-colors">Pricing</a>
                  <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white font-medium transition-colors">Admin Panel</button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center">
              {token ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.01]"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById('login').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.01]"
                >
                  Get Started
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white focus:outline-none">
                {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D0C14] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-xl absolute w-full z-50">
            {token ? (
              <>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/templates'); }} className="w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-md">Templates</button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-md">Dashboard</button>
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-red-400 hover:bg-slate-850 rounded-md">
                  <FaSignOutAlt /> Logout
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-indigo-400 hover:bg-slate-850 rounded-md mt-2"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <a href="#features" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-md">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-md">How it Works</a>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }} className="w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-md">Admin Panel</button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-indigo-400 hover:bg-slate-850 rounded-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Left side content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6">
            <FaStar className="text-amber-400 text-xs animate-spin-slow" /> Lavender Haze Edition
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Build your online store in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-450">30 seconds</span>
          </h1>
          <p className="text-lg text-slate-450 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            No complex menus or clunky drag-and-drop. Simply tell our conversational AI builder what you sell, or import details instantly from any existing link to launch your store.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <a 
              href="#login" 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 text-center hover:scale-[1.02]"
            >
              Start Free Trial
            </a>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto bg-[#13121A]/80 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all text-center shadow-sm hover:scale-[1.02]"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="w-full sm:w-auto text-slate-450 hover:text-indigo-400 px-6 py-4 rounded-xl font-bold text-base transition-all text-center hover:underline"
            >
              See Features
            </a>
          </div>

          {/* Interactive animated 3D Storefront visual */}
          <div className="mt-16 block lg:hidden">
            <FloatingAsset type="storefront" className="scale-100" />
          </div>
        </div>

        {/* Right side - Login / Account Card or Large 3D storefront */}
        <div className="w-full max-w-md flex flex-col items-center">
          {token ? (
            <div className="w-full bg-[#13121A] border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden transform transition-all">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-950/40 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStore className="text-purple-400 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-white">Welcome back!</h3>
                <p className="text-slate-450 mt-2">You are currently logged in to your account.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 hover:scale-[1.01] transition-transform"
              >
                Go to Dashboard <FaArrowRight className="text-sm" />
              </button>
            </div>
          ) : (
            <div id="login" className="w-full bg-[#13121A] border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Create your store</h3>
                <p className="text-slate-450 text-sm">Enter phone or email to log in instantly.</p>
              </div>

              {!showOtp ? (
                <div className="space-y-6">
                  
                  <div className="flex bg-[#09080E] border border-slate-800 p-1 rounded-xl">
                    <button 
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-[#181720] text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      <FaPhone className="text-xs" /> Phone
                    </button>
                    <button 
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-[#181720] text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      <FaEnvelope className="text-xs" /> Email
                    </button>
                  </div>

                  {loginMethod === 'phone' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                      <div className="flex items-center border border-slate-800 bg-[#09080E] focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-[#13121A] focus-within:border-transparent rounded-xl overflow-hidden transition-all">
                        <span className="bg-[#181720] text-slate-400 px-4 py-3.5 border-r border-slate-800 font-semibold">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          className="flex-1 px-4 py-3.5 bg-transparent outline-none text-white w-full font-medium"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <div className="flex items-center border border-slate-800 bg-[#09080E] focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-[#13121A] focus-within:border-transparent rounded-xl overflow-hidden transition-all">
                        <div className="bg-[#181720] text-slate-400 px-4 py-3.5 border-r border-slate-800">
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="flex-1 px-4 py-3.5 bg-transparent outline-none text-white w-full font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={sendOTP}
                    disabled={loading || (loginMethod === 'phone' ? phone.length !== 10 : !email.includes('@'))}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 hover:scale-[1.01]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Continue'}
                    {!loading && <FaArrowRight className="text-sm" />}
                  </button>
                  <p className="text-[10px] text-center text-slate-500">By continuing, you agree to our Terms of Service.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    {isNewUser && (
                      <>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Enter your business name"
                          className="w-full border border-slate-800 bg-[#09080E] rounded-xl p-4 text-center text-xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#13121A] text-white mb-4 font-semibold"
                        />
                      </>
                    )}
                    <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0 0 0 0"
                      className="w-full border border-slate-800 bg-[#09080E] rounded-xl p-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#13121A] text-white font-mono font-bold"
                    />
                    <div className="flex justify-between items-center mt-4">
                      {loginMethod === 'phone' ? (
                        <p className="text-xs text-purple-400 font-semibold">Demo OTP: 1234</p>
                      ) : (
                        <p className="text-xs text-purple-400 font-semibold">Demo OTP: 1234 (Mock)</p>
                      )}
                      <button onClick={() => setShowOtp(false)} className="text-xs text-slate-400 hover:text-white underline">
                        Change {loginMethod === 'phone' ? 'Number' : 'Email'}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={verifyOTP}
                    disabled={loading || otp.length !== 4 || (isNewUser && !businessName.trim())}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/25 flex justify-center items-center hover:scale-[1.01]"
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

        {/* 3D Storefront Floating Graphics - Desktop Right Column */}
        <div className="hidden lg:block flex-1 flex items-center justify-center">
          <FloatingAsset type="storefront" className="scale-125" />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 md:py-28 bg-[#09080E] border-t border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs text-purple-400 font-black tracking-widest uppercase bg-purple-950/50 border border-purple-500/20 px-3 py-1 rounded-full">Premium Features</span>
            <h2 className="mt-4 text-3xl md:text-4xl leading-9 font-extrabold tracking-tight text-white">
              Everything you need to succeed online
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-400 mx-auto leading-relaxed">
              We've completely reimagined how businesses go online. Stop wrestling with complex drag-and-drop builders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Feature 1 */}
            <div className="dark-card bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1.5 transition-all duration-300 group backdrop-blur-md">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <FaRobot className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">AI-Powered Setup</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Just talk to our AI or paste a link. Tell it what your business does, and it will generate your entire website structure, copy, and catalog automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="dark-card bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1.5 transition-all duration-300 group backdrop-blur-md">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <FaPaintBrush className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Premium Layouts</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Access 15+ world-class, premium design templates tailored for local florists, bakeries, salons, tailor boutiques, mechanics, and tea cafes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="dark-card bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/5 hover:-translate-y-1.5 transition-all duration-300 group backdrop-blur-md">
              <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                <FaMobileAlt className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Mobile Responsive</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Your storefront is built for lightning-fast speeds and displays flawlessly on mobile screens, tablets, and desktop monitors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className="py-20 md:py-28 bg-[#0D0C14] border-t border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs text-indigo-400 font-black tracking-widest uppercase bg-indigo-950/50 border border-indigo-500/20 px-3 py-1 rounded-full">Interactive Process</span>
            <h2 className="mt-4 text-3xl md:text-4xl leading-9 font-extrabold tracking-tight text-white">
              From Idea to Live Store in 3 Steps
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-400 mx-auto leading-relaxed">
              Our streamlined AI-first onboarding builder takes the friction out of creating a digital presence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative mb-16">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 pointer-events-none z-0"></div>

            {/* Step 1 */}
            <div className="dark-card flex flex-col items-center lg:items-start text-center lg:text-left bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 relative group backdrop-blur-md z-10 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center mb-6 font-extrabold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Provide Store Details</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Input your business name, description, and contact info, or copy-paste any existing website link. Our local scraper automatically extracts products, contact details, and images for you in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="dark-card flex flex-col items-center lg:items-start text-center lg:text-left bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 relative group backdrop-blur-md z-10 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-600 text-white flex items-center justify-center mb-6 font-extrabold text-lg shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-300">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Customize Theme & Catalog</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Select from our library of 15+ responsive layout templates. Refine your catalog, upload logos, select colors, re-order section rows, and build custom promo slots within our side-by-side live design sandbox.
              </p>
            </div>

            {/* Step 3 */}
            <div className="dark-card flex flex-col items-center lg:items-start text-center lg:text-left bg-gradient-to-b from-[#161424]/90 to-[#0D0C14]/90 p-8 rounded-3xl border border-slate-800/80 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-300 relative group backdrop-blur-md z-10 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-pink-600 text-white flex items-center justify-center mb-6 font-extrabold text-lg shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-all duration-300">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-wide">Publish and Sell</h3>
              <p className="text-slate-450 leading-relaxed text-xs">
                Deploy your storefront live instantly. Share the generated link, update search engine metadata (SEO), collect customer order details, and interact with buyers via integrated direct-to-WhatsApp messaging.
              </p>
            </div>
          </div>

          {/* Detailed Feature Breakdown */}
          <div className="dark-card mt-20 bg-gradient-to-b from-[#13121A] to-[#09080E] border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-650/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <h3 className="text-xl font-bold text-white mb-8 tracking-wide">Inside the Technology: How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
                <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span>
                  Local Smart Scraping
                </h4>
                <p className="text-slate-450 text-[11px] leading-relaxed">
                  When you import an existing URL, our engine fetches the HTML markup. It extracts raw metadata (like site title, OpenGraph tags, contact info) and automatically maps your industry category. Realistic catalog listings are dynamically built based on page text heuristics.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 hover:border-purple-500/30 transition-colors">
                <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span>
                  Visual Sandbox Editor
                </h4>
                <p className="text-slate-450 text-[11px] leading-relaxed">
                  Your template is configured through an isolated JSON schema holding state properties for typography styles, header hero grids, store branding elements, product columns, and testimonials. Any modifications you make reflect in the iframe canvas instantly.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 hover:border-pink-500/30 transition-colors">
                <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></span>
                  Direct Messaging Checkout
                </h4>
                <p className="text-slate-450 text-[11px] leading-relaxed">
                  Customers select products to create a cart. When they order, a WhatsApp API payload prefilled with order details, product titles, quantities, pricing, and total amounts is generated. This redirects the buyer directly to start a chat with you, ensuring simple order fulfillment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#09080E] border-t border-slate-800/80 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <FaStore className="text-sm" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors">VendorBuild</span>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; 2026 VendorBuild Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.16; transform: scale(1.05); }
        }
        @keyframes pulse-slow-delay {
          0%, 100% { opacity: 0.08; transform: scale(1.05); }
          50% { opacity: 0.13; transform: scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 8s infinite ease-in-out 4s;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Landing;