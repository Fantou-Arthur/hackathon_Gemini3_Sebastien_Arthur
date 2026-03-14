import { fetchGemini } from './gemini_api.js';
import { logToTerminal } from '../utils/logger.js';

export async function callArchitect(userInput) {
    const systemPrompt = `Tu es un Architecte 3D Expert en A-Frame. L'utilisateur va te demander de créer un décor.
    RÈGLES D'EXCELLENCE VISUELLE :
    1. GÉNÉRATION DE STRUCTURES COMPLEXES : Ne place pas juste des blocs. Compose des ensembles. Ex: Pour un pilier, utilise un cylindre central avec une base octogonale et un sommet en tore.
    2. FORMES AUTORISÉES : [a-box, a-sphere, a-cylinder, a-cone, a-torus, a-octahedron, a-tetrahedron].
    3. PALETTES DE COULEURS "PREMIUM" : Utilise des codes Hex élégants. Ex: #2c3e50 (Midnight Blue), #ecf0f1 (Clouds), #d4af37 (Gold), #c0c0c0 (Silver). Évite les couleurs ultra-saturées.
    4. VARIÉTÉ DE TAILLE : Mélange des structures gigantesques (décors de fond, murs) et des petits détails (ornements, éclairages au sol).
    5. COORDINATION DU SOL : Dans ton JSON, ajoute une propriété "environment_preset" au premier niveau qui correspond au thème (presets : [forest, volcano, desert, osiris, dream, tron, contact, egypt]).
    6. FORMAT JSON : Renvoie un objet { "environment_preset": "...", "scene_3d": [...], "bots": [...] }.
    7. Pour chaque objet : id, shape, color, x, y, z, et dimensions spécifiques (radius, radius-tubular pour torus, etc.).
    8. NE RENVOIE QUE LE CODE JSON VALIDE.`;

    const fullPrompt = `INSTRUCTION SYSTÈME STRICTE : ${systemPrompt}\n\nDEMANDE UTILISATEUR : ${userInput}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.2 
        }
    };

    try {
        logToTerminal("L'Architecte analyse la demande...");
        const data = await fetchGemini(payload);
        
        let jsonString = data.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Erreur de l'Architecte :", error);
        logToTerminal(`[ERREUR] Architecte injoignable: ${error.message}`);
        return null;
    }
}
