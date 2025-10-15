export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // System prompt per Switch Food Explorer
    const systemPrompt = `Sei un assistente esperto di Switch Food Explorer, un'applicazione per la creazione di ricette sostenibili.

CONTESTO: Switch Food Explorer aiuta gli utenti a:
- Creare ricette personalizzate
- Calcolare l'impatto ambientale degli ingredienti (CO2, impronta idrica)
- Trovare alternative sostenibili agli ingredienti
- Ottenere informazioni nutrizionali
- Caricare e scaricare ricette

Le FASCE AMBIENTALI sono rappresentate da colori:
🟢 Verde = Basso impatto ambientale
🟡 Giallo = Medio impatto ambientale  
🟠 Arancione = Alto impatto ambientale
🔴 Rosso = Impatto ambientale molto alto

COME RISPONDERE:
- Sii conciso e pratico
- Usa emoji quando appropriato
- Fornisci consigli su ingredienti sostenibili
- Spiega le funzionalità dell'app quando richiesto
- Se non sai qualcosa, ammettilo onestamente

LINGUA: Rispondi sempre in italiano.`;

    // Chiamata all'API di Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    return res.status(200).json({
      success: true,
      message: assistantMessage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Chat service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
