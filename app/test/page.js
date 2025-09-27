'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function WhatsAppChatView() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! How are you doing?", sent: false, time: "10:30 AM" },
    { id: 2, text: "I'm doing great! Just finished my morning workout. How about you?", sent: true, time: "10:32 AM" },
    { id: 3, text: "That's awesome! I'm just getting ready for work. Have a great day!", sent: false, time: "10:35 AM" },
    { id: 4, text: "Thanks! You too. Let's catch up later this evening?", sent: true, time: "10:36 AM" },
    { id: 5, text: "Absolutely! Looking forward to it 😊", sent: false, time: "10:37 AM" },
    { id: 6, text: "Perfect! I'll call you around 7 PM. Is that good for you?", sent: true, time: "10:38 AM" },
    { id: 7, text: "Yes, that works perfectly. Talk to you then!", sent: false, time: "10:39 AM" },
    { id: 8, text: "Great! Have an amazing day at work! 💪", sent: true, time: "10:40 AM" },
  ]);
  const messagesEndRef = useRef(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardRect, setKeyboardRect] = useState(null);

  useEffect(() => {
    // console.log(navigator.virtualKeyboard)
    if ('virtualKeyboard' in navigator) {
      const vk = navigator.virtualKeyboard;
      alert('in this ')
      // Enable overlay so your content can move instead of resize
      vk.overlaysContent = true;

      // Handle keyboard geometry changes
      const handleGeometryChange = () => {
        const rect = vk.boundingRect;
        setKeyboardRect(rect);
        setKeyboardVisible(rect.height > 0);
      };

      vk.addEventListener('geometrychange', handleGeometryChange);

      return () => {
        vk.removeEventListener('geometrychange', handleGeometryChange);
      };
    }
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-viewport">
      {/* Header */}
      <div className="chat-header absolute">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" alt="Contact" />
            <AvatarFallback className="bg-green-500 text-white">JD</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">John Doe</h3>
              {keyboardVisible && (
        <p>Keyboard height: {keyboardRect.height}px</p>
      )}
            <p className="text-xs text-green-100">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="chat-messages">
        <div className="messages-inner">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} mb-3`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg shadow-sm ${
                msg.sent 
                  ? 'bg-green-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border'
              }`}>
                <p className="text-sm break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sent ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Container */}
      <div className="chat-input">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none p-2 text-base"
            autoComplete="off"
          />
        
        </div>
        <Button 
          onClick={handleSendMessage}
          size="icon"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10"
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      
    </div>
  );
}