import { getStore } from "@netlify/blobs";

export async function handler() {
    try {

        // Load @netlify/blobs
        const store = getStore('global');
        

        // Chargement des disponibilités de la bd
        const res = await fetch('https://script.google.com/macros/s/AKfycbxhQEwmB3vY8P5d04Ef0GBrjU_W9Uhv3IhQ-4nMy1u6Iz9aNn0o26LgvrauqVJl78Wv/exec');
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