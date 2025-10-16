import express from 'express';
import { OpenAI } from 'openai';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  return next();
});

const PORT = process.env.PORT || 3001;

const SWITCH_RECIPES_BASE_URL =
  'https://api-gateway-switchproject.posti.world/api-refactoring/api/v1/bo/SWITCH_FOOD_EX_RECIPES';

const buildRecipeUrl = (rawRecipeId) => {
  if (!rawRecipeId) {
    return null;
  }

  const trimmedId = String(rawRecipeId).trim().replace(/^\/+|\/+$/g, '');

  if (!trimmedId) {
    return null;
  }

  if (trimmedId.startsWith('http')) {
    return trimmedId;
  }

  const hasNestedPath = trimmedId.includes('/');
  const path = hasNestedPath ? trimmedId : `PUBLIC_RECIPES/${trimmedId}`;

  return `${SWITCH_RECIPES_BASE_URL}/${path}`;
};

app.post('/assistant', async (req, res) => {
  const { question, recipeId } = req.body || {};

  if (!question || !recipeId) {
    return res.status(400).json({ error: 'Missing question or recipeId' });
  }

  const recipeUrl = buildRecipeUrl(recipeId);

  if (!recipeUrl) {
    return res.status(400).json({ error: 'Invalid recipeId' });
  }

  try {
    const recipeResponse = await fetch(recipeUrl, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!recipeResponse.ok) {
      const statusText = recipeResponse.statusText || 'Unable to retrieve recipe data';
      return res.status(502).json({ error: statusText });
    }

    const recipe = await recipeResponse.json();

    const prompt = `Sei Switch Assistant, un assistente culinario sostenibile.
Ti fornisco i dettagli della ricetta seguente:
${JSON.stringify(recipe, null, 2)}

Domanda dell'utente: ${question}

Fornisci una risposta in italiano concisa e utile.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente esperto di ricette sostenibili per Switch Food Explorer. Rispondi in italiano.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({ error: 'No answer generated' });
    }

    return res.json({ answer });
  } catch (error) {
    console.error('Assistant error:', error);
    return res.status(500).json({ error: 'Assistant service unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Assistant server running on port ${PORT}`);
});

export default app;
