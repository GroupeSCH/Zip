// netlify/functions/get-dispos.js
export async function handler(event) {
  const { getStore } = await import('@netlify/blobs');
  
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Auth optionnelle : tu peux l’enlever si la lecture est publique
  if (event.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const store = getStore('global');
    const dispos = await store.get('dispos.json', { type: 'json' }) ?? {};

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispos),
    };
  } catch (err) {
    return { statusCode: 500, body: 'Erreur interne: ' + err.message };
  }
}
