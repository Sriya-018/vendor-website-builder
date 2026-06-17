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
    imagePreview: null
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
    setFormData({ name: '', price: '', category: 'general', description: '', image: null, imagePreview: null });
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
      imagePreview: product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null
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
        websiteId: activeWebsiteId
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
        setFormData({ name: '', price: '', category: 'general', description: '', image: null, imagePreview: null });
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Stores Found</h2>
        <p className="text-gray-500 mb-6">Create a store from the Overview tab before managing products.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading products...</div>;
  }

  return (
    <div className="space-y-8">
      {websites.map((website) => {
        const websiteProducts = products.filter(p => p.websiteId === website._id);
        
        return (
          <div key={website._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaGlobe className="text-blue-500" />
                  Store: <span className="font-medium text-gray-700">{website.storeName || website.slug}</span>
                </h2>
                <p className="text-sm text-gray-500">Manage products for this specific website</p>
              </div>
              <button
                onClick={() => handleAddClick(website._id)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus /> Add Product
              </button>
            </div>

            {websiteProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 text-2xl">
                  <FaImage />
                </div>
                <p className="text-lg font-medium text-gray-900">No products yet</p>
                <p className="mt-1 mb-6">Add products to display them on {website.slug}.</p>
                <button
                  onClick={() => handleAddClick(website._id)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm"
                >
                  <FaPlus /> Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {websiteProducts.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                                alt={product.name} 
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                <FaImage />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-2 mr-2">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-2">
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaImage className="text-gray-500" />
              Unassigned Products
            </h2>
            <p className="text-sm text-gray-500">Older products that are not assigned to a specific store.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {products.filter(p => !p.websiteId).map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                            alt={product.name} 
                            className="w-12 h-12 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-2 mr-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-2">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product 2-Column Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row relative">
            <button 
              onClick={resetForm} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 z-10 transition-colors shadow-sm border border-gray-100"
            >
              <FaTimes className="text-xl" />
            </button>
            
            {/* Left Column: Form */}
            <div className="w-full md:w-1/2 p-8 border-r border-gray-100 overflow-y-auto max-h-[95vh] bg-white">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <FaPlus className="text-blue-600" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Product Image & Details</h4>
                  
                  {/* 3 Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button 
                      type="button"
                      onClick={startVoiceInput}
                      className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold transition-all ${isListening ? 'bg-purple-600 text-white animate-pulse' : 'bg-[#a855f7] hover:bg-purple-600 text-white shadow-sm hover:shadow-md'}`}
                    >
                      <FaMicrophone className="text-2xl mb-1" />
                      <span className="text-xs">Voice Input</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={isCameraActive ? capturePhoto : startCamera}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                    >
                      <FaCamera className="text-2xl mb-1" />
                      <span className="text-xs">{isCameraActive ? 'Capture' : 'Take Photo'}</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl font-bold border-2 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
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
                    <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative flex items-center justify-center min-h-[150px]">
                      {isCameraActive ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="w-full max-h-[250px] object-contain bg-black"></video>
                          <canvas ref={canvasRef} className="hidden"></canvas>
                          <button 
                            type="button" 
                            onClick={stopCamera}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700"
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
                            className="absolute top-2 right-2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" 
                      placeholder="Product Name *"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">₹</span>
                      </div>
                      <input 
                        type="number" required min="0" step="0.01" name="price" 
                        value={formData.price} onChange={handleInputChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" 
                        placeholder="Price *"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" name="category" 
                        value={formData.category} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" 
                        placeholder="Category"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea 
                      name="description" rows="3"
                      value={formData.description} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-medium" 
                      placeholder="Product Description"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button" onClick={resetForm}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Your Products */}
            <div className="w-full md:w-1/2 p-8 bg-[#fafafa] overflow-y-auto max-h-[95vh]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Your Products</h3>
                <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">
                  {products.filter(p => p.websiteId === activeWebsiteId).length} items
                </span>
              </div>
              
              <div className="space-y-4">
                {products.filter(p => p.websiteId === activeWebsiteId).length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white flex flex-col items-center justify-center">
                    <FaImage className="text-5xl text-gray-300 mb-4" />
                    <h4 className="text-gray-500 font-medium mb-1">No products added yet</h4>
                    <p className="text-gray-400 text-sm">Fill the form and click "Add Product"</p>
                  </div>
                ) : (
                  products.filter(p => p.websiteId === activeWebsiteId).reverse().map(product => (
                    <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                            alt={product.name} 
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <FaImage className="text-2xl" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 text-lg leading-tight">{product.name}</div>
                          <div className="font-bold text-blue-600 mt-1">₹{product.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
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
