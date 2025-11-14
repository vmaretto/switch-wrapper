import { useState, useEffect } from 'react';
import SwitchFrame from './components/SwitchFrame';
import ChatBot from './components/ChatBot';
import DemographicsForm from './components/DemographicsForm';
import './styles.css';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);

  // Check if user has completed demographics on mount
  useEffect(() => {
    const completed = localStorage.getItem('demographicsCompleted');

    if (completed === 'true') {
      setShowDemographics(false);
    } else {
      setShowDemographics(true);
    }
  }, []);

  const handleDemographicsComplete = () => {
    setShowDemographics(false);
  };

  // Show demographics form if not completed
  if (showDemographics) {
    return <DemographicsForm onComplete={handleDemographicsComplete} />;
  }

  // Show main app once demographics are completed
  return (
    <div className="app-container">
      <main className="app-content" role="main">
        <SwitchFrame />
      </main>

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsChatOpen(true)}
          aria-label="Apri la chat"
        >
          💬
        </button>
      )}

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
