import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { age, gender, profession, fruitsVegetables, sessionId } = req.body;

    // Validazione dati
    if (!age || !gender || !profession || !fruitsVegetables) {
      return res.status(400).json({
        error: 'Missing required fields',
        success: false
      });
    }

    // Validazione età
    const ageNum = Number(age);
    if (ageNum < 1 || ageNum > 120) {
      return res.status(400).json({
        error: 'Invalid age value',
        success: false
      });
    }

    // Connessione a Neon
    const sql = neon(process.env.DATABASE_URL);

    // Crea la tabella se non esiste
    await sql`
      CREATE TABLE IF NOT EXISTS demographics (
        id SERIAL PRIMARY KEY,
        age INTEGER NOT NULL,
        gender VARCHAR(50) NOT NULL,
        profession VARCHAR(100) NOT NULL,
        fruits_vegetables VARCHAR(100) NOT NULL,
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Inserisci i dati
    const result = await sql`
      INSERT INTO demographics (age, gender, profession, fruits_vegetables, session_id)
      VALUES (${ageNum}, ${gender}, ${profession}, ${fruitsVegetables}, ${sessionId || null})
      RETURNING id
    `;

    return res.status(200).json({
      success: true,
      id: result[0].id,
      message: 'Demographics saved successfully'
    });

  } catch (error) {
    console.error('Demographics API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
