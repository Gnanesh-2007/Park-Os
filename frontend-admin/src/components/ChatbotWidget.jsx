import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your ParkOS Assistant. How can I help you today?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chatbot`, { message: userMessage });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:shadow-emerald-500/40 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 z-50 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 flex items-center justify-between p-4 to-emerald-600 border-b border-transparent">
          <div className="flex items-center gap-2 text-white">
            <Bot size={20} />
            <h3 className="font-semibold">ParkOS Assistant</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.map((msg, index) => (
             <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
               <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                 msg.isBot 
                  ? 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600' 
                  : 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20'
               }`}>
                 {msg.text}
               </div>
             </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-400 rounded-xl rounded-tl-none px-4 py-3 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!message.trim() || isLoading}
              className="absolute right-2 top-1.5 p-1 text-blue-500 hover:text-blue-400 disabled:text-slate-500 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
