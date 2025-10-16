import React, { useState, useRef, useEffect } from 'react';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🍽️ Ciao! Sono Switch Assistant. Inserisci un Recipe ID (formato: tenant/id) o carica un JSON per iniziare!\n\nEsempio Recipe ID:\nae941ce8-efc6-49b0-baee-7f7b512a7c31/68b873ab7ebb28169394ff4d'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeAttachment, setRecipeAttachment] = useState(null);
  const [recipeId, setRecipeId] = useState('');
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

    // Verifica che ci sia una fonte di ricetta
    if (!recipeAttachment && !recipeId.trim()) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Per favore:\n1. Inserisci un Recipe ID (formato: tenant/id)\n   Es: ae941ce8-efc6-49b0-baee-7f7b512a7c31/68b873ab7ebb28169394ff4d\n\nOPPURE\n\n2. Carica un file JSON con la ricetta'
        }
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepara il payload per /api/assistant
      const payload = {
        question: userMessage
      };

      if (recipeAttachment) {
        payload.recipeJson = recipeAttachment;
      } else {
        payload.recipeId = recipeId.trim();
      }

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Assistant API failed');
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.answer }
      ]);
    } catch (error) {
      console.error('Assistant error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Errore: ${error.message}\n\nVerifica che:\n- Il Recipe ID sia nel formato corretto (tenant/id)\n- La connessione all'API funzioni\n- Hai configurato OPENAI_API_KEY su Vercel`
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
        setRecipeId(''); // Clear recipe ID when uploading JSON
        
        // Messaggio di conferma
        const recipeName = parsed.recipeName || parsed.name || 'Senza nome';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `✅ Ricetta "${recipeName}" caricata! Ora puoi farmi domande su di essa.`
          }
        ]);
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

  // Suggerimenti rapidi
  const quickQuestions = [
    "Quali sono gli ingredienti?",
    "Qual è l'impatto ambientale?",
    "Come renderla più sostenibile?",
    "Informazioni nutrizionali?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div>
          <h3>🍽️ Switch Assistant</h3>
          <p>Assistente per ricette sostenibili</p>
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
            <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Quick questions (solo se c'è una ricetta caricata) */}
        {(recipeAttachment || recipeId.trim()) && messages.length <= 2 && !isLoading && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '12px',
                  border: '1px solid #FF6B35',
                  background: 'white',
                  color: '#FF6B35',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FF6B35';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#FF6B35';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        
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
        {/* Recipe ID input */}
        <div className="recipe-id-row">
          <input
            type="text"
            value={recipeId}
            onChange={(e) => {
              setRecipeId(e.target.value);
              if (e.target.value.trim()) {
                setRecipeAttachment(null); // Clear JSON when typing ID
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }
            }}
            placeholder="Recipe ID (tenant/id)"
            disabled={isLoading || !!recipeAttachment}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e1e8ed',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '0.8rem',
          margin: '0.25rem 0'
        }}>
          oppure
        </div>

        {/* Attachment row */}
        <div className="attachment-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleRecipeUpload}
            aria-label="Allega una ricetta in formato JSON"
            className="attachment-input"
            disabled={isLoading || !!recipeId.trim()}
          />
          <button
            type="button"
            className="attachment-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !!recipeId.trim()}
          >
            📎 Carica JSON
          </button>
          {recipeAttachment ? (
            <div className="attachment-chip">
              <span>{recipeAttachment.recipeName || recipeAttachment.name || 'Ricetta allegata'}</span>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                aria-label="Rimuovi ricetta allegata"
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>
        {attachmentError && (
          <p className="attachment-error">{attachmentError}</p>
        )}

        {/* Message input row */}
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              recipeAttachment || recipeId.trim()
                ? "Fai una domanda sulla ricetta..."
                : "Prima inserisci Recipe ID o carica JSON"
            }
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
