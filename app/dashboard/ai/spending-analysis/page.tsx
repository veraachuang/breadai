"use client"

import React, { useState } from 'react';
import axios from 'axios';

export default function SpendingAnalysisPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can help analyze your spending patterns. What would you like to know?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try { 
      const response = await axios.post("/api/chatgpt", { message: inputValue });
      console.log("CHATGPT response: ", response.data);
      
      // Format the AI response to match your message structure
      // This is where your issue likely is - check your console.log to see the actual structure
      const aiResponse = { 
        role: 'assistant', 
        content: response.data.message || response.data.content || response.data
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      // Add an error message to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">AI Spending Analysis</h1>
      <div className="dashboard-card">
        <p className="text-[#3a3027] opacity-80 mb-6">
          Get AI-powered insights into your spending patterns. BreadAI analyzes your transactions to identify trends,
          anomalies, and opportunities for savings.
        </p>

        {/* ChatGPT-like interface */}
        <div className="mt-6 border border-[#e6dfd5] rounded-lg bg-[#f8f5f0] flex flex-col h-96">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-[#e8e1d9] text-[#3a3027]' 
                      : 'bg-white text-[#3a3027] border border-[#e6dfd5]'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#3a3027] border border-[#e6dfd5] rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#e8e1d9] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#e8e1d9] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#e8e1d9] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="border-t border-[#e6dfd5] p-4">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your spending patterns..."
                className="flex-1 border border-[#e6dfd5] rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6dfd5]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#3a3027] text-white px-4 py-2 rounded-r-lg hover:bg-[#4a4037] disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6">
          <div className="recommendation-card">
            <h3 className="recommendation-title">Spending Pattern Detected</h3>
            <p className="recommendation-content">
              Our AI has detected that your restaurant spending has increased by 32% compared to last month. Would you
              like to create a specialized budget for dining out?
            </p>
            <button className="recommendation-action">Create budget</button>
          </div>
        </div>
      </div>
    </div>
  );
}