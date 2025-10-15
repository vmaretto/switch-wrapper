import React, { useState, useRef, useEffect } from 'react';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! Sono qui per aiutarti con Switch Food Explorer. Chiedimi qualsiasi cosa sulle ricette, gli ingredienti o le funzionalità dell\'app!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeAttachment, setRecipeAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const payload = {
        messages: [...messages, { role: 'user', content: userMessage }]
      };
      if (recipeAttachment) {
        payload.recipe = recipeAttachment;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Chat API failed');

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message }
      ]);
      setRecipeAttachment(null);
      setAttachmentError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant', 
          content: 'Scusa, ho avuto un problema. Riprova per favore.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setRecipeAttachment(null);
      setAttachmentError('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result;
        if (typeof result !== 'string') {
          throw new Error('Formato non valido');
        }
        const parsed = JSON.parse(result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Formato non valido');
        }
        setRecipeAttachment(parsed);
        setAttachmentError('');
      } catch (error) {
        console.error('Errore di parsing della ricetta:', error);
        setRecipeAttachment(null);
        setAttachmentError('Il file deve contenere un JSON valido.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveAttachment = () => {
    setRecipeAttachment(null);
    setAttachmentError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div>
          <h3>🍽️ Switch Assistant</h3>
          <p>Aiuto per Food Explorer</p>
        </div>
        <button 
          className="close-chat-btn"
          onClick={onClose}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chatbot-input" onSubmit={handleSubmit}>
        <div className="attachment-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleRecipeUpload}
            aria-label="Allega una ricetta in formato JSON"
            className="attachment-input"
          />
          <button
            type="button"
            className="attachment-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            📎 Allegare ricetta
          </button>
          {recipeAttachment ? (
            <div className="attachment-chip">
              <span>{recipeAttachment.recipeName || 'Ricetta allegata'}</span>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                aria-label="Rimuovi ricetta allegata"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="attachment-hint">
              Carica un JSON con la ricetta (es. carbonara)
            </p>
          )}
        </div>
        {attachmentError && (
          <p className="attachment-error">{attachmentError}</p>
        )}
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi qualcosa su Switch..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Invia messaggio"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}
