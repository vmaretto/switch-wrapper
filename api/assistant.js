// Serverless function per Vercel
// Path: /api/assistant.js

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
    const { question, recipeId, recipeJson } = req.body || {};

    if (!question || (!recipeId && !recipeJson)) {
      return res.status(400).json({ 
        error: 'Missing question or recipe data',
        details: 'Fornisci una domanda e un recipeId o recipeJson'
      });
    }

    let recipe;

    // Se è fornito il JSON, usalo direttamente
    if (recipeJson) {
      recipe = recipeJson;
    } else {
      // Altrimenti fetch dall'API reale di Switch
      // Formato: https://api-gateway-switchproject.posti.world/api-refactoring/api/v1/bo/SWITCH_FOOD_EX_RECIPES/{tenant}/{recipeId}
      
      // Il recipeId dovrebbe essere nel formato: tenant/id
      // Es: "ae941ce8-efc6-49b0-baee-7f7b512a7c31/68b873ab7ebb28169394ff4d"
      const recipeUrl = `https://api-gateway-switchproject.posti.world/api-refactoring/api/v1/bo/SWITCH_FOOD_EX_RECIPES/${recipeId}`;

      console.log('Fetching recipe from:', recipeUrl);

      const recipeResponse = await fetch(recipeUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!recipeResponse.ok) {
        const errorText = await recipeResponse.text();
        console.error('Recipe fetch error:', recipeResponse.status, errorText);
        return res.status(502).json({ 
          error: 'Impossibile recuperare la ricetta',
          details: `Status ${recipeResponse.status}: ${recipeResponse.statusText}`,
          recipeUrl: recipeUrl
        });
      }

      recipe = await recipeResponse.json();
      console.log('Recipe fetched successfully:', recipe?.recipeName || recipe?.name || 'unnamed');
    }

    // System prompt per Switch Assistant
    const systemPrompt = `Sei Switch Assistant, un esperto di cucina sostenibile per Switch Food Explorer.

CONTESTO: Switch Food Explorer aiuta a:
- Creare ricette con focus sulla sostenibilità
- Calcolare impatto ambientale (CO2, impronta idrica)
- Suggerire alternative sostenibili agli ingredienti
- Fornire informazioni nutrizionali

FASCE AMBIENTALI (colori):
🟢 Verde = Basso impatto
🟡 Giallo = Medio impatto
🟠 Arancione = Alto impatto
🔴 Rosso = Impatto molto alto

COME RISPONDERE:
- Sii conciso e pratico
- Usa emoji quando appropriato (🌱 🥗 💧 ♻️)
- Dai consigli su ingredienti sostenibili
- Se la ricetta ha dati ambientali, commentali
- Suggerisci sostituzioni quando rilevante

LINGUA: Rispondi SEMPRE in italiano.`;

    const userPrompt = `Ecco i dettagli della ricetta:

${JSON.stringify(recipe, null, 2)}

Domanda dell'utente: ${question}

Fornisci una risposta utile, concisa e in italiano.`;

    // Chiamata a OpenAI GPT-4o
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('OpenAI API request failed');
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({ 
        error: 'No answer generated',
        details: 'OpenAI non ha generato una risposta'
      });
    }

    return res.status(200).json({
      success: true,
      answer: answer
    });

  } catch (error) {
    console.error('Assistant error:', error);
    return res.status(500).json({
      error: 'Assistant service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
