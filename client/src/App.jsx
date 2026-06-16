import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import WebsiteView from './pages/WebsiteView';
import EditWebsite from './pages/EditWebsite';
import WebsiteEditor from './pages/WebsiteEditor';
import Templates from './pages/Templates';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [businessId, setBusinessId] = useState(localStorage.getItem('businessId'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (businessId) {
      localStorage.setItem('businessId', businessId);
    } else {
      localStorage.removeItem('businessId');
    }
  }, [businessId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing token={token} setToken={setToken} setBusinessId={setBusinessId} />} />
        <Route path="/templates" element={<Templates token={token} businessId={businessId} />} />
        <Route path="/setup" element={
          token ? <Setup token={token} businessId={businessId} setBusinessId={setBusinessId} /> : <Navigate to="/" />
        } />
        <Route path="/dashboard" element={
          token ? <Dashboard token={token} businessId={businessId} /> : <Navigate to="/" />
        } />
        <Route path="/edit" element={
          token ? <EditWebsite token={token} businessId={businessId} /> : <Navigate to="/" />
        } />
        <Route path="/editor/:websiteId" element={
          token ? <WebsiteEditor token={token} businessId={businessId} /> : <Navigate to="/" />
        } />
        <Route path="/website/:slug" element={<WebsiteView />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;