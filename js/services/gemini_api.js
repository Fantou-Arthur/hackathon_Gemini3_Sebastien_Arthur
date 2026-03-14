import { CONFIG } from '../config.js';

export async function fetchGemini(payload, modelName = null) {
    const model = modelName || CONFIG.ARCHITECT_MODEL;
    const url = `${CONFIG.API_BASE_URL}/models/${model}:generateContent?key=${CONFIG.API_KEY}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Erreur API: ${response.status} - ${errorBody.error?.message || "Erreur inconnue"}`);
    }

    const data = await response.json();
    return data;
}
