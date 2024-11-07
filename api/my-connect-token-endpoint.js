// api/my-connect-token-endpoint.js

const fetch = require('node-fetch');
const cors = require('cors');

// Esta função serve como o ponto de entrada da API no Vercel
module.exports = async (req, res) => {
  // Configura o CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  console.log('Received request to /my-connect-token-endpoint endpoint');
  const { itemId, clientUserId } = req.body;

  try {
    const apiKeyResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: 'ae7753f6-5394-44c2-a3ad-8069c240efb9',
        clientSecret: '21ca5df1-fe83-4f6a-8db9-1f0f4af64e0e',
      }),
    }).then((res) => res.json());

    if (!apiKeyResponse.apiKey) {
      throw new Error('Falha ao obter a chave da API. Verifique suas credenciais.');
    }

    const data = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKeyResponse.apiKey,
      },
      body: JSON.stringify({
        itemId,
        ...(clientUserId ? { options: { clientUserId } } : {}),
      }),
    }).then((res) => res.json());

    if (!data.accessToken) {
      throw new Error('Falha ao gerar o token de conexão.');
    }

    res.status(200).json({
      accessToken: data.accessToken,
    });
  } catch (error) {
    console.error('Error in /my-connect-token-endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
