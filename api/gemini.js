// api/gemini.js
export default async function handler(req, res) {
  // 1. Verificamos que sea una petición POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Obtenemos la API KEY de las variables de entorno de Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ERROR: La API KEY no está configurada en Vercel.' });
  }

  // 3. Recibimos los datos del frontend (tu index.html)
  const { prompt, imageBase64, json } = req.body;

  // 4. Preparamos la URL de Google (¡Usando tu modelo específico!)
  const modelVersion = "gemini-2.5-flash-preview-09-2025";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`;

  // 5. Construimos el cuerpo del mensaje para Google
  const parts = [{ text: prompt }];
  
  // Si hay imagen, la agregamos
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  const payload = {
    contents: [{ parts: parts }]
  };

  // Si pediste JSON, forzamos el modo JSON de Gemini
  if (json) {
    payload.generationConfig = { responseMimeType: "application/json" };
  }

  try {
    // 6. Hacemos la llamada a Google desde el servidor (Nadie ve esto)
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Si Google da error, lo devolvemos al frontend
    if (data.error) {
      throw new Error(data.error.message || "Error en la API de Google");
    }

    // 7. Devolvemos la respuesta completa al frontend
    res.status(200).json(data);

  } catch (error) {
    console.error("Error en serverless function:", error);
    res.status(500).json({ error: error.message });
  }
}