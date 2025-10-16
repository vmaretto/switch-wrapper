import { useState, useMemo } from 'react';

const parseRecipeIdFromPath = (path) => {
  if (!path || path === '/') {
    return null;
  }

  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
};

const extractPreview = (recipe) => {
  if (!recipe || typeof recipe !== 'object') {
    return null;
  }

  const name =
    recipe?.name ||
    recipe?.title ||
    recipe?.recipeName ||
    recipe?.generalData?.recipeName ||
    'Ricetta caricata';

  const possibleIngredientLists = [
    recipe?.ingredients,
    recipe?.ingredienti,
    recipe?.ingredientsList,
    recipe?.generalData?.ingredients,
    recipe?.generalData?.ingredienti
  ];

  const ingredientList = possibleIngredientLists.find((list) => Array.isArray(list)) || [];

  const ingredientPreview = ingredientList
    .map((ingredient) => {
      if (typeof ingredient === 'string') {
        return ingredient;
      }

      if (ingredient && typeof ingredient === 'object') {
        return (
          ingredient?.name ||
          ingredient?.ingredientName ||
          ingredient?.label ||
          ingredient?.ingredient
        );
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 5);

  return {
    name,
    ingredients: ingredientPreview
  };
};

export default function SwitchAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeJson, setRecipeJson] = useState(null);
  const [recipePreview, setRecipePreview] = useState(null);

  const recipeId = useMemo(() => {
    const { pathname } = window.location;
    try {
      const currentUrl = new URL(window.location.href);
      const queryRecipeId = currentUrl.searchParams.get('recipeId');
      if (queryRecipeId) {
        return queryRecipeId;
      }
    } catch (error) {
      console.warn('Unable to parse current URL for recipeId:', error);
    }

    return parseRecipeIdFromPath(pathname);
  }, []);

  const apiBase = window.location.origin;

  const hasRecipeSource = Boolean(recipeId) || Boolean(recipeJson);

  const handleRecipeUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setRecipeJson(null);
      setRecipePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setRecipeJson(parsed);
        setRecipePreview(extractPreview(parsed));
      } catch (error) {
        console.error('Unable to parse uploaded recipe JSON:', error);
        setRecipeJson(null);
        setRecipePreview(null);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Non sono riuscito a leggere il file JSON della ricetta. Controlla il formato e riprova.'
          }
        ]);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    if (!hasRecipeSource) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Per continuare carica un file JSON della ricetta oppure assicurati che l'URL contenga un recipeId."
        }
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const payload = recipeJson
        ? { question: userMessage.content, recipeJson }
        : { question: userMessage.content, recipeId };

      const response = await fetch(`${apiBase}/api/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
      {recipePreview && (
        <div style={styles.previewBox}>
          <div style={styles.previewTitle}>Ricetta caricata</div>
          <div style={styles.previewName}>{recipePreview.name}</div>
          {recipePreview.ingredients?.length > 0 && (
            <div style={styles.previewIngredients}>
              Ingredienti principali: {recipePreview.ingredients.join(', ')}
            </div>
          )}
        </div>
      )}
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
          placeholder={
            hasRecipeSource
              ? 'Chiedi qualcosa sulla ricetta...'
              : 'Carica una ricetta o fornisci un URL con recipeId'
          }
          style={styles.input}
          disabled={isLoading}
        />
        <label style={styles.uploadLabel}>
          <span>Carica JSON</span>
          <input type="file" accept="application/json" onChange={handleRecipeUpload} style={styles.fileInput} />
        </label>
        <button type="submit" style={styles.button} disabled={isLoading || !hasRecipeSource}>
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
  previewBox: {
    padding: 12,
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5fbe9'
  },
  previewTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 600,
    color: '#2e7d32',
    marginBottom: 4
  },
  previewName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4
  },
  previewIngredients: {
    fontSize: 13,
    color: '#2e7d32'
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
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #2e7d32',
    backgroundColor: '#ffffff',
    color: '#2e7d32',
    fontWeight: 600,
    cursor: 'pointer'
  },
  fileInput: {
    display: 'none'
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
