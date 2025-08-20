// netlify/functions/update-dispos.js
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RE_TIME = /^\d{2}:\d{2}$/;

export async function handler(event) {
  const { getStore } = await import('@netlify/blobs');
  if (!['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Auth simple par clé d’admin
  if (event.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const store = getStore('global');

  // Charger l’état actuel depuis le store
  const dispos = (await store.get('dispos.json', { type: 'json' })) ?? {};

  const action = body.action || (event.httpMethod === 'PUT' ? 'replace' : 'patch');

  try {
    if (action === 'replace') {
      if (!isDisposMap(body.dispos)) throw new Error('dispos invalid');
      await writeDispos(store, body.dispos);
      return ok({ mode: 'replace', totalDays: Object.keys(body.dispos).length });

    } else if (action === 'merge') {
      if (!isDisposMap(body.dispos)) throw new Error('dispos invalid');
      for (const d of Object.keys(body.dispos)) {
        const next = uniqueSorted([...(dispos[d] || []), ...body.dispos[d]]);
        if (next.length) dispos[d] = next; else delete dispos[d];
      }
      await writeDispos(store, dispos);
      return ok({ mode: 'merge', totalDays: Object.keys(dispos).length });

    } else if (action === 'add') {
      const { date, heure } = body;
      if (!RE_DATE.test(date) || !RE_TIME.test(heure)) throw new Error('bad date/heure');
      const next = uniqueSorted([...(dispos[date] || []), heure]);
      dispos[date] = next;
      await writeDispos(store, dispos);
      return ok({ mode: 'add', date, heures: dispos[date] });

    } else if (action === 'remove') {
      const { date, heure } = body;
      if (!RE_DATE.test(date) || !RE_TIME.test(heure)) throw new Error('bad date/heure');
      const next = (dispos[date] || []).filter(h => h !== heure);
      if (next.length) dispos[date] = next; else delete dispos[date];
      await writeDispos(store, dispos);
      return ok({ mode: 'remove', date, heures: dispos[date] || [] });

    } else if (action === 'set') {
      const { date, heures } = body;
      if (!RE_DATE.test(date) || !Array.isArray(heures) || !heures.every(h => RE_TIME.test(h))) {
        throw new Error('bad date/heures');
      }
      const next = uniqueSorted(heures);
      if (next.length) dispos[date] = next; else delete dispos[date];
      await writeDispos(store, dispos);
      return ok({ mode: 'set', date, heures: dispos[date] || [] });

    } else {
      return { statusCode: 400, body: 'Unknown action' };
    }
  } catch (e) {
    return { statusCode: 400, body: String(e) };
  }
}

/* helpers */
function uniqueSorted(arr) {
  const set = new Set(arr);
  return [...set].sort((a, b) => a.localeCompare(b));
}
function safeObject(x) {
  return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {};
}
function isDisposMap(obj) {
  if (!safeObject(obj)) return false;
  for (const [d, hours] of Object.entries(obj)) {
    if (!RE_DATE.test(d) || !Array.isArray(hours) || !hours.every(h => RE_TIME.test(h))) return false;
  }
  return true;
}
async function writeDispos(store, obj) {
  await store.set('dispos.json', {
    value: JSON.stringify(obj),
    contentType: 'application/json'
  });
}
function ok(data) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, ...data })
  };
}
