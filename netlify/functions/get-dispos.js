// netlify/functions/get-dispos.js
export async function handler(event) {
  // Import dynamique pour forcer le support ESM
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('global');

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Si tu veux rendre la lecture publique, commente ce bloc
  if (event.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const data = await store.get('dispos.json', { type: 'json' });

    // Valeur par défaut si store vide
    const dispos = data && typeof data === 'object' ? data : {};

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // utile si app et API sont sur des domaines différents
      },
      body: JSON.stringify(dispos),
    };
  } catch (err) {
    console.error("Erreur dans get-dispos:", err);
    return { statusCode: 500, body: 'Erreur interne: ' + err.message };
  }
}
