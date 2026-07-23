import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaTimes, FaUser, FaSpinner, FaMicrophone } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function AIChatModal({ isOpen, onClose, onBuildTriggered, businessId, storeContext }) {
 const [messages, setMessages] = useState([
 { role: 'ai', text: 'Hi there! I am your VendorBuild AI assistant. I can help you pick a template or guide you on setting up your store. How can I help you today?' }
 ]);
 const [inputMessage, setInputMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isVoiceRecording, setIsVoiceRecording] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isLoading]);

 if (!isOpen) return null;

 const startVoice = () => {
 if (!('webkitSpeechRecognition' in window)) {
 alert('Voice recognition not supported in this browser');
 return;
 }
 
 const recognition = new window.webkitSpeechRecognition();
 recognition.lang = 'en-US';
 recognition.continuous = false;
 recognition.interimResults = false;
 
 recognition.onstart = () => setIsVoiceRecording(true);
 recognition.onend = () => setIsVoiceRecording(false);
 
 recognition.onresult = (event) => {
 const text = event.results[0][0].transcript;
 setInputMessage(text);
 handleSendMessage(null, text);
 };
 
 recognition.start();
 };

 const handleSendMessage = async (e, textOverride = null) => {
 if (e) e.preventDefault();
 const textToSend = textOverride || inputMessage;
 if (!textToSend.trim()) return;

 const userMessage = { role: 'user', text: textToSend };
 const newMessages = [...messages, userMessage];
 setMessages(newMessages);
 setInputMessage('');
 setIsLoading(true);

 try {
 const response = await axios.post(`${API_URL}/ai/chat`, {
 messages: newMessages,
 businessId: businessId || localStorage.getItem('businessId'),
 storeContext
 });
 let replyText = response.data.reply;
 
 // Check for hidden build command
 const buildMatch = replyText.match(/___BUILD___([\s\S]*?)___BUILD___/);
 if (buildMatch) {
 try {
 const buildData = JSON.parse(buildMatch[1].trim());
 if (onBuildTriggered) {
 onBuildTriggered(buildData);
 }
 } catch (e) {
 console.error("Failed to parse build command", e);
 }
 // Remove the build command from visible text
 replyText = replyText.replace(/___BUILD___[\s\S]*?___BUILD___/, '').trim();
 }

 setMessages([...newMessages, { role: 'ai', text: replyText }]);
 } catch (error) {
 console.error('Chat error:', error);
 setMessages([...newMessages, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server right now.' }]);
 } finally {
 setIsLoading(false);
 }
 };

 return (
    <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 dark:border-gray-800 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 flex items-center justify-between shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FaRobot className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Vendor AI Assistant</h3>
            <p className="text-xs text-purple-200">Always here to help</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-900 flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-transparent'
            }`}>
              {msg.role === 'user' ? <FaUser className="text-xs" /> : <FaRobot className="text-xs" />}
            </div>
            
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-sm' 
                : 'bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-gray-700 rounded-tl-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-transparent flex items-center justify-center shrink-0">
              <FaRobot className="text-xs" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <button 
            type="button"
            onClick={startVoice}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isVoiceRecording 
                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 animate-pulse' 
                : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
            }`}
          >
            <FaMicrophone />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isVoiceRecording ? "Listening..." : "Type your question..."}
            className="flex-1 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
            disabled={isLoading || isVoiceRecording}
          />
          <button 
            id="ai-chat-submit-btn"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors shadow-md shrink-0"
          >
            <FaPaperPlane className="text-xs ml-0.5" />
          </button>
        </form>
      </div>
    </div>
 );
}

export default AIChatModal;
