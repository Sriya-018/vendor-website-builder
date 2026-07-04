import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaImage, FaGlobe, FaMicrophone, FaCamera, FaUpload, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function ProductsTab({ businessId, websites }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState(null);
  
  // Voice and Camera State
  const [isListening, setIsListening] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'general',
    description: '',
    image: null,
    imagePreview: null,
    stockQuantity: 10,
    inStock: true
  });

  useEffect(() => {
    fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL products for the business
      const res = await axios.get(`${API_URL}/business/${businessId}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: 'general', description: '', image: null, imagePreview: null, stockQuantity: 10, inStock: true });
    setEditingProduct(null);
    setActiveWebsiteId(null);
    setShowAddModal(false);
    stopCamera();
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: transcript }));
      } else if (!formData.price && !isNaN(parseFloat(transcript))) {
        setFormData(prev => ({ ...prev, price: parseFloat(transcript) }));
      } else {
        setFormData(prev => ({ ...prev, description: (prev.description + ' ' + transcript).trim() }));
      }
    };

    recognition.start();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera", error);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file)
        }));
        stopCamera();
      }, "image/jpeg");
    }
  };

  const handleAddClick = (websiteId) => {
    setActiveWebsiteId(websiteId);
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveWebsiteId(product.websiteId);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || 'general',
      description: product.description || '',
      image: null,
      imagePreview: product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null,
      stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10,
      inStock: product.inStock !== false
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/business/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = editingProduct ? editingProduct.imageUrl : '';
      
      // Upload image if a new one was selected
      if (formData.image) {
        const imageForm = new FormData();
        imageForm.append('image', formData.image);
        const uploadRes = await axios.post(`${API_URL}/upload/product-image`, imageForm);
        finalImageUrl = uploadRes.data.url;
      }

      const productPayload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrl: finalImageUrl,
        websiteId: activeWebsiteId,
        stockQuantity: Number(formData.stockQuantity),
        inStock: formData.inStock
      };

      if (editingProduct) {
        // Update
        const res = await axios.put(`${API_URL}/business/products/${editingProduct._id}`, productPayload);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        resetForm(); // Close modal after edit
      } else {
        // Create
        const res = await axios.post(`${API_URL}/business/${businessId}/products`, productPayload);
        setProducts([...products, res.data]);
        
        // Clear form but keep modal open for multiple additions
        setFormData({ name: '', price: '', category: 'general', description: '', image: null, imagePreview: null, stockQuantity: 10, inStock: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
        stopCamera();
      }
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Error saving product. Please try again.');
    }
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Stores Found</h2>
        <p className="text-slate-450 mb-6">Create a store from the Overview tab before managing products.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading products...</div>;
  }

  return (
    <div className="space-y-8">
      {websites.map((website) => {
        const websiteProducts = products.filter(p => p.websiteId === website._id);
        
        return (
          <div key={website._id} className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaGlobe className="text-indigo-400" />
                  Store: <span className="font-medium text-slate-350">{website.storeName || website.slug}</span>
                </h2>
                <p className="text-sm text-slate-400">Manage products for this specific website</p>
              </div>
              <button
                onClick={() => handleAddClick(website._id)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
              >
                <FaPlus /> Add Product
              </button>
            </div>

            {websiteProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 text-2xl border border-purple-500/20">
                  <FaImage />
                </div>
                <p className="text-lg font-medium text-white">No products yet</p>
                <p className="mt-1 mb-6 text-slate-450">Add products to display them on {website.slug}.</p>
                <button
                  onClick={() => handleAddClick(website._id)}
                  className="flex items-center gap-2 bg-[#13121A] border border-slate-700/60 text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <FaPlus /> Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800/60 text-xs uppercase text-slate-500 tracking-wider font-semibold">
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {websiteProducts.map(product => (
                      <tr key={product._id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                                alt={product.name} 
                                className="w-12 h-12 rounded object-cover border border-slate-800/60"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-purple-600/10 rounded flex items-center justify-center text-purple-400 border border-purple-500/20">
                                <FaImage />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">{product.name}</div>
                              <div className="text-xs text-slate-450 truncate max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.inStock !== false ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              In Stock ({product.stockQuantity ?? 10})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(product)} className="text-purple-400 hover:text-purple-300 p-2 mr-2">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-400 hover:text-red-300 p-2">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned / Legacy Products */}
      {products.filter(p => !p.websiteId).length > 0 && (
        <div className="bg-[#13121A] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/40">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaImage className="text-purple-400" />
              Unassigned Products
            </h2>
            <p className="text-sm text-slate-400">Older products that are not assigned to a specific store.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800/60 text-xs uppercase text-slate-500 tracking-wider font-semibold">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {products.filter(p => !p.websiteId).map(product => (
                  <tr key={product._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                            alt={product.name} 
                            className="w-12 h-12 rounded object-cover border border-slate-800/60"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-600/10 rounded flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <FaImage />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-xs text-slate-450 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-purple-400 hover:text-purple-300 p-2 mr-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-400 hover:text-red-300 p-2">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Add/Edit Product 2-Column Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13121A] border border-slate-800/60 rounded-2xl w-full max-w-6xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row relative">
            <button 
              onClick={resetForm} 
              className="absolute top-6 right-6 text-slate-500 hover:text-slate-350 bg-[#13121A] hover:bg-slate-800 rounded-full p-2 z-10 transition-colors shadow-sm border border-slate-800/60"
            >
              <FaTimes className="text-xl" />
            </button>
            
            {/* Left Column: Form */}
            <div className="w-full md:w-1/2 p-8 border-r border-slate-800/60 overflow-y-auto max-h-[95vh] bg-[#13121A]">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <FaPlus className="text-purple-400" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-200 mb-4 text-lg">Product Image & Details</h4>
                  
                  {/* 3 Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button 
                      type="button"
                      onClick={startVoiceInput}
                      className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold transition-all ${isListening ? 'bg-purple-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'}`}
                    >
                      <FaMicrophone className="text-2xl mb-1" />
                      <span className="text-xs">Voice Input</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={isCameraActive ? capturePhoto : startCamera}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold bg-indigo-650 hover:bg-indigo-700 text-white shadow-md transition-all"
                    >
                      <FaCamera className="text-2xl mb-1" />
                      <span className="text-xs">{isCameraActive ? 'Capture' : 'Take Photo'}</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold border-2 border-dashed border-slate-800/60 text-slate-400 hover:text-slate-250 hover:border-slate-600 hover:bg-slate-800/40 transition-all"
                    >
                      <FaUpload className="text-2xl mb-1" />
                      <span className="text-xs">Upload File</span>
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      ref={fileInputRef}
                    />
                  </div>

                  {/* Camera / Image Preview Area */}
                  {(isCameraActive || formData.imagePreview) && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-slate-800/60 bg-[#09080E] relative flex items-center justify-center min-h-[150px]">
                      {isCameraActive ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="w-full max-h-[250px] object-contain bg-black"></video>
                          <canvas ref={canvasRef} className="hidden"></canvas>
                          <button 
                            type="button" 
                            onClick={stopCamera}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 animate-pulse"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <div className="relative w-full text-center">
                          <img src={formData.imagePreview} alt="Preview" className="max-h-[250px] object-contain mx-auto" />
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                            className="absolute top-2 right-2 bg-[#13121A]/85 text-slate-200 p-2 rounded-full shadow hover:bg-[#13121A] transition-colors border border-slate-800/60"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <input 
                      type="text" required name="name" 
                      value={formData.name} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium bg-[#09080E] focus:bg-[#0D0C14] transition-all text-slate-200 outline-none placeholder-slate-650" 
                      placeholder="Product Name *"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">₹</span>
                      </div>
                      <input 
                        type="number" required min="0" step="0.01" name="price" 
                        value={formData.price} onChange={handleInputChange}
                        className="w-full pl-8 pr-4 py-3 border border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium bg-[#09080E] focus:bg-[#0D0C14] transition-all text-slate-200 outline-none placeholder-slate-650" 
                        placeholder="Price *"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" name="category" 
                        value={formData.category} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium bg-[#09080E] focus:bg-[#0D0C14] transition-all text-slate-200 outline-none placeholder-slate-650" 
                        placeholder="Category"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea 
                      name="description" rows="3"
                      value={formData.description} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-medium bg-[#09080E] focus:bg-[#0D0C14] transition-all text-slate-200 outline-none placeholder-slate-650" 
                      placeholder="Product Description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-1">
                    <label className="flex items-center gap-2.5 cursor-pointer p-3.5 bg-[#09080E] hover:bg-[#0D0C14] border border-slate-700/60 rounded-lg transition-all select-none">
                      <input 
                        type="checkbox" 
                        name="inStock"
                        checked={formData.inStock} 
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            inStock: checked,
                            stockQuantity: checked ? (prev.stockQuantity > 0 ? prev.stockQuantity : 10) : 0
                          }));
                        }}
                        className="w-4 h-4 accent-purple-500 cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-slate-350">📦 In Stock</span>
                    </label>
                    <div>
                      <input 
                        type="number" 
                        name="stockQuantity"
                        min="0"
                        value={formData.stockQuantity} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            stockQuantity: val,
                            inStock: val > 0
                          }));
                        }}
                        className="w-full px-4 py-3.5 border border-slate-700/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm bg-[#09080E] focus:bg-[#0D0C14] transition-all text-slate-200 outline-none" 
                        placeholder="Quantity in Stock"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button" onClick={resetForm}
                    className="flex-1 px-4 py-3 bg-[#09080E] border border-slate-700/60 text-slate-350 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Your Products */}
            <div className="w-full md:w-1/2 p-8 bg-[#0D0C14] overflow-y-auto max-h-[95vh]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
                <h3 className="text-xl font-bold text-white">Your Products</h3>
                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-1 px-3 rounded-full text-sm font-bold">
                  {products.filter(p => p.websiteId === activeWebsiteId).length} items
                </span>
              </div>
              
              <div className="space-y-4">
                {products.filter(p => p.websiteId === activeWebsiteId).length === 0 ? (
                  <div className="border-2 border-dashed border-slate-800/60 rounded-2xl p-12 text-center bg-[#13121A] flex flex-col items-center justify-center">
                    <FaImage className="text-5xl text-slate-655 mb-4" />
                    <h4 className="text-slate-455 font-medium mb-1">No products added yet</h4>
                    <p className="text-slate-500 text-sm">Fill the form and click "Add Product"</p>
                  </div>
                ) : (
                  products.filter(p => p.websiteId === activeWebsiteId).reverse().map(product => (
                    <div key={product._id} className="bg-[#13121A] rounded-xl border border-slate-800/60 p-4 shadow-sm flex items-center justify-between group hover:border-purple-500/40 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                            alt={product.name} 
                            className="w-16 h-16 rounded-lg object-cover bg-[#09080E] border border-slate-800/60"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-600/10 rounded-lg flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <FaImage className="text-2xl" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-lg leading-tight">{product.name}</div>
                          <div className="font-bold text-purple-400 mt-1">₹{product.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="p-3 text-purple-400 hover:bg-slate-800 rounded-full transition-colors">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsTab;
