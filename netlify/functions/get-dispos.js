
export default async function handler(req, context) {
  const { getStore } = await import('@netlify/blobs');

  try {
    const store = getStore('global');
    const dispos = await store.get('dispo.json', {type: 'json'}) ?? {};
    console.log(dispos);
    return {
      statusCode : 200,
      body: JSON.stringify(dispos)
    };
  } catch (error) {
    return { statusCode : 500, body: 'Erreur interne: ' + error.message}
  }
}