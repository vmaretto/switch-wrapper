# 🍽️ Switch Food Explorer - Chat Wrapper

Un wrapper per Switch Food Explorer con chatbot Claude integrato per assistenza in tempo reale.

## ✨ Funzionalità

- 🎯 **Switch Food Explorer** integrato in iframe
- 💬 **Chatbot Claude** con toggle laterale
- 🎨 **Design moderno** con animazioni fluide
- 📱 **Responsive** per desktop e mobile
- 🚀 **Deploy su Vercel** con API routes

---

## 🚀 Setup Rapido

### 1. Clone del repository

```bash
git clone https://github.com/vmaretto/switch-wrapper.git
cd switch-wrapper
```

### 2. Installa dipendenze

```bash
npm install
```

### 3. Configura API Key di Claude

1. Vai su [console.anthropic.com](https://console.anthropic.com/)
2. Crea un account (se non ce l'hai)
3. Vai su **API Keys** e crea una nuova chiave
4. Copia la chiave

Poi crea il file `.env.local`:

```bash
# Su Mac/Linux
cp .env.local.example .env.local

# Su Windows
copy .env.local.example .env.local
```

Apri `.env.local` e incolla la tua API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
NODE_ENV=development
```

### 4. Avvia in locale

```bash
npm run dev
```

Apri: `http://localhost:5173`

---

## 📦 Deploy su Vercel

### 1. Push su GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connetti Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca **"New Project"**
3. Importa il repository `switch-wrapper`
4. In **Environment Variables** aggiungi:
   - Name: `ANTHROPIC_API_KEY`
   - Value: La tua API key di Claude
   - Environments: Production, Preview, Development
5. Clicca **"Deploy"**

### 3. Testa in produzione

```
https://switch-wrapper.vercel.app
```

---

## 🎨 Personalizzazione

### Colori

Modifica `src/styles.css` per cambiare i colori del tema:

```css
/* Cambia il gradiente del chatbot */
.chatbot-header {
  background: linear-gradient(135deg, #TUO_COLORE_1 0%, #TUO_COLORE_2 100%);
}
```

### System Prompt

Modifica `api/chat.js` per cambiare il comportamento del chatbot:

```javascript
const systemPrompt = `Il tuo prompt personalizzato...`;
```

---

## 📱 Funzionalità UI

### Toggle Button

- **Posizione**: Bottom-right (fisso)
- **Click**: Apre/chiude la sidebar
- **Icona**: 💬 (chiuso) / ✕ (aperto)

### Chat Sidebar

- **Larghezza**: 400px (desktop) / 100vw (mobile)
- **Animazione**: Slide da destra
- **Overlay**: Su mobile per chiudere

### Messaggi

- **User**: Blu (destra)
- **Assistant**: Bianco (sinistra)
- **Typing**: Animazione puntini

---

## 🛠️ Struttura Progetto

```
switch-wrapper/
├── api/
│   └── chat.js              # API route per Claude
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx      # Componente chatbot
│   │   └── SwitchFrame.jsx  # Iframe Switch
│   ├── App.jsx              # App principale
│   ├── main.jsx             # Entry point
│   └── styles.css           # Stili globali
├── .env.local.example       # Template variabili ambiente
├── .gitignore               # File ignorati da Git
├── index.html               # HTML root
├── package.json             # Dipendenze
├── vite.config.js           # Config Vite
└── README.md                # Questo file
```

---

## 🧪 Test

### Test Locale

```bash
npm run dev
```

1. Apri `http://localhost:5173`
2. Clicca sul pulsante 💬
3. Scrivi un messaggio nel chat
4. Verifica che Claude risponda

### Test Produzione

Dopo il deploy su Vercel:

```
https://switch-wrapper.vercel.app
```

---

## ⚠️ Note Importanti

### API Key di Claude

- **NON committare** mai il file `.env.local`
- La chiave API è sensibile e personale
- Vercel la gestisce in modo sicuro tramite Environment Variables

### Costi

- Claude API ha un **free tier** limitato
- Controlla i costi su [console.anthropic.com](https://console.anthropic.com/)
- Ogni messaggio consuma token

### Iframe

- Switch Food Explorer deve permettere l'embedding
- Alcune funzionalità potrebbero non funzionare in iframe per policy CORS

---

## 🆘 Troubleshooting

### Problema: "API Key not found"

- Verifica che `.env.local` contenga `ANTHROPIC_API_KEY`
- Riavvia il server: `Ctrl+C` poi `npm run dev`
- Su Vercel: Controlla Environment Variables

### Problema: Chat non risponde

- Apri Developer Tools (F12)
- Controlla la console per errori
- Verifica che l'API key sia valida

### Problema: Iframe non carica

- Verifica la connessione internet
- Controlla che l'URL di Switch sia corretto
- Alcuni siti bloccano l'embedding in iframe

---

## 📊 Statistiche API

Per monitorare l'uso dell'API Claude:

1. Vai su [console.anthropic.com](https://console.anthropic.com/)
2. Sezione **Usage**
3. Monitora token usati e costi

---

## 🎯 Prossimi Sviluppi

- [ ] Salvataggio conversazioni su database
- [ ] Export chat in PDF
- [ ] Supporto multilingua
- [ ] Suggerimenti ricette personalizzati
- [ ] Integrazione con API Switch (se disponibile)

---

## 📞 Supporto

Per problemi o domande:
- Apri una issue su GitHub
- Controlla la documentazione di [Claude API](https://docs.anthropic.com/)
- Verifica [Vite docs](https://vitejs.dev/)

---

**Buon utilizzo! 🚀**
