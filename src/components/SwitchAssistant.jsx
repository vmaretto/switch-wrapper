import { useState, useMemo } from 'react';

const parseRecipeIdFromPath = (path) => {
  if (!path || path === '/') {
    return null;
  }

  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
};

export default function SwitchAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recipeId = useMemo(() => parseRecipeIdFromPath(window.location.pathname), []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    if (!recipeId) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Impossibile determinare la ricetta dall\'URL.' }
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage.content,
          recipeId
        })
      });

      if (!response.ok) {
        throw new Error('Assistant response not ok');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.answer || 'Non sono riuscito a generare una risposta.'
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Assistant fetch error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'C\'è stato un problema nel contattare l\'assistente.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <div style={styles.placeholder}>
            Fai una domanda sulla ricetta per iniziare la chat.
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              ...styles.message,
              ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
            }}
          >
            <strong>{message.role === 'user' ? 'Tu' : 'Switch Assistant'}:</strong>{' '}
            <span>{message.content}</span>
          </div>
        ))}
        {isLoading && (
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            <em>Switch Assistant sta scrivendo...</em>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={recipeId ? 'Chiedi qualcosa sulla ricetta...' : 'ID ricetta non disponibile'}
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading || !recipeId}>
          Invia
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
  },
  chatBox: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 240,
    maxHeight: 360,
    overflowY: 'auto',
    backgroundColor: '#fafafa'
  },
  placeholder: {
    color: '#8a8a8a',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  message: {
    padding: '10px 12px',
    borderRadius: 8,
    lineHeight: 1.4,
    fontSize: 14
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e8ff',
    color: '#0b5394'
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32'
  },
  form: {
    display: 'flex',
    padding: 12,
    borderTop: '1px solid #e0e0e0',
    gap: 8
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #cccccc',
    fontSize: 14
  },
  button: {
    padding: '10px 16px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#2e7d32',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
