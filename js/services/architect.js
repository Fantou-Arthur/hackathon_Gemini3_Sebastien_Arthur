import { fetchGemini } from './gemini_api.js';
import { logToTerminal } from '../utils/logger.js';

export async function callArchitect(userInput) {
    const systemPrompt = `Tu es un Architecte 3D Expert en A-Frame. L'utilisateur va te demander de créer un décor.
    RÈGLES STRICTES DE GÉNÉRATION ET ESTHÉTIQUE :
    1. Génère un JSON valide contenant 'scene_3d' (objets du décor) et 'bots' (entités mobiles).
    2. ESTHÉTIQUE PREMIUM : Utilise des palettes de couleurs harmonieuses (HSL ou codes Hex élégants, évite le pur rouge/bleu/vert).
    3. UTILISE DE GRANDES ÉCHELLES et des compositions complexes : ne te contente pas de simples cubes, crée des ensembles architecturaux avec des piliers, des dalles, des arches.
    4. VARIÉTÉ : Joue sur les tailles (massif vs fin) pour donner du rythme visuel.
    5. Éparpille les objets dans l'espace (positions X, Y, Z variées entre -40 et 40, Y majoritairement > 0).
    6. Pour chaque objet, fournis : id, shape (ex: 'a-box', 'a-sphere', 'a-cylinder'), color, x, y, z, et dimensions.
    7. Pour les 'bots', ajoute une propriété 'rules' décrivant leur personnalité.
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
