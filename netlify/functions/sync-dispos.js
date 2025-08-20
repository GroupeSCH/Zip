import { getStore } from "@netlify/blobs";

export async function handler() {
    try {

        // Load @netlify/blobs
        const store = getStore('global');
        

        // Chargement des disponibilités de la bd
        const res = await fetch('');
        if (!res.ok) {
            throw new Error(`Error from external api to fetch dispos : ${res.status}`);
        }

        // Parse data to JSON
        const dispos = await res.json();

        // Add to store
        await store.set("dispo.json", {
            value: JSON.stringify(dispos),
            contentType: "application/json"
        });

        return {
            statusCode : 200,
            body: JSON.stringify({
                ok: true,
                totalDays: Object.keys(dispos).length
            })
        }
    } catch (error) {

    }
}