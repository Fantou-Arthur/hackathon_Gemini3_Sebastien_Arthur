import { fetchGemini } from './gemini_api.js';
import { logToTerminal } from '../utils/logger.js';

export async function callArchitect(userInput) {
    const systemPrompt = `Tu es un Architecte 3D Expert en A-Frame. L'utilisateur va te demander de créer un décor.
    RÈGLES STRICTES DE GÉNÉRATION :
    1. Génère un JSON valide contenant 'scene_3d' (tableau d'objets statiques du décor) et 'bots' (tableau d'entités mobiles).
    2. UTILISE DE GRANDES ÉCHELLES. Si on demande une "ville" ou un "bâtiment", génère des '<a-box>' ou '<a-cylinder>' massifs (ex: width: 10, height: 20, depth: 15).
    3. Ajoute beaucoup de détails : crée de multiples objets en combinant des primitives A-Frame (sols colorés, routes, nombreux murs, piliers) pour former le décor demandé.
    4. Éparpille les objets dans l'espace (positions X, Y, Z variées entre -30 et 30) pour remplir le champ de vision.
    5. Pour chaque objet, fournis : id, shape (ex: 'a-box', 'a-sphere'), color (code Hex), x, y, z, et les dimensions requises (width/height/depth pour a-box, radius pour a-sphere).
    6. Pour les 'bots', ajoute aussi une propriété 'rules' contenant un petit trait de personnalité. Les actions autorisées dans 'rules' sont [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
    7. NE RENVOIE QUE LE CODE JSON VALIDE, SANS AUCUN TEXTE AVANT NI APRÈS.`;

    const fullPrompt = `INSTRUCTION SYSTÈME STRICTE : ${systemPrompt}\n\nDEMANDE UTILISATEUR : ${userInput}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { 
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
