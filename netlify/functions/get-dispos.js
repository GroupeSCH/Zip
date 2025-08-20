export default async function handler(req, context) {
  const { getStore } = await import('@netlify/blobs');
  try {
    const store = getStore('global');
    const dispos = await store.get('dispo.json', { type: 'json' }) ?? {};

    return new Response(JSON.stringify(dispos), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erreur interne", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
