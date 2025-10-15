import React, { useState } from 'react';
import SwitchFrame from './components/SwitchFrame';
import ChatBot from './components/ChatBot';
import './styles.css';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="app-container">
      <SwitchFrame />
      
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle-btn ${isChatOpen ? 'open' : ''}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Toggle chat"
      >
        {isChatOpen ? '✕' : '💬'}
      </button>

      {/* Chat Sidebar */}
      <div className={`chat-sidebar ${isChatOpen ? 'open' : ''}`}>
        <ChatBot onClose={() => setIsChatOpen(false)} />
      </div>

      {/* Overlay when chat is open (mobile) */}
      {isChatOpen && (
        <div 
          className="chat-overlay"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
