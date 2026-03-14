import { fetchGemini } from './gemini_api.js';
import { logToTerminal } from '../utils/logger.js';

export async function callArchitect(userInput) {
    const systemPrompt = `Tu es un Architecte 3D Expert en A-Frame. L'utilisateur va te demander de créer ou d'ajouter des éléments au décor.
    RÈGLES D'EXCELLENCE VISUELLE ET COMPOSITION :
    1. SCULPTURE D'ENTITÉS (ANIMAUX/NPCs) : Si on te demande des entités vivantes (ex: vaches, humains), NE POSE PAS un seul bloc. SCULPTE-LES avec plusieurs primitives. 
       Ex pour une vache : 1 boîte large (corps), 1 boîte plus petite (tête), 4 cylindres fins (pattes), 2 cônes (cornes).
    2. FORMES AUTORISÉES : [a-box, a-sphere, a-cylinder, a-cone, a-torus, a-octahedron, a-tetrahedron, a-dodecahedron].
    3. PALETTES PREMIUN : Utilise des codes Hex élégants. Ex: #5D4037 (Dark Brown pour vaches), #F5F5DC (Beige), #BDBDBD (Gris).
    4. COORDINATION DU SOL : Propriété "environment_preset" au premier niveau (presets : [forest, volcano, desert, osiris, dream, tron, contact, egypt]).
    5. FORMAT JSON : Renvoie un objet { "environment_preset": "...", "scene_3d": [...], "bots": [...] }.
    6. Pour chaque objet : id, shape, color, x, y, z, et dimensions. Attention à la cohérence des positions Y pour que les objets ne flottent pas.
    7. NE RENVOIE QUE LE CODE JSON VALIDE.`;

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
