import { fetchGemini } from '../services/gemini_api.js';
import { logToTerminal } from '../utils/logger.js';
import { moveBot } from './bot_engine.js';
import { CONFIG } from '../config.js';

class GeminiAgent {
    constructor() {
        this.id = 'gemini-agent';
        this.x = 0;
        this.y = 1.6;
        this.z = 2;
        this.active = false;      // Liaison à la génération du monde
        this.enabled = true;      // Interrupteur manuel utilisateur
        this.history = [];
    }

    async think(context) {
        if (!this.active || !this.enabled) return;

        // Vision détaillée
        const nearbyItems = this.getNearbyContext();
        
        const prompt = `Tu es Gemini, un agent IA vivant en VR. 
        POSITION : X:${this.x.toFixed(2)}, Y:${this.y.toFixed(2)}, Z:${this.z.toFixed(2)}.
        CE QUE TU VOIS : ${nearbyItems}
        HISTORIQUE CHAT : ${this.history.slice(-3).join(' | ')}
        
        INSTRUCTIONS : 
        1. MOUVEMENT : Choisis [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
        2. PAROLE : Réagis à un objet proche ou à l'utilisateur (max 10 mots).
        
        JSON : { "action": "...", "speech": "..." }`;

        try {
            const data = await fetchGemini({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
            }, CONFIG.AGENT_MODEL);

            const response = JSON.parse(data.candidates[0].content.parts[0].text);
            this.updateSpeechBubble(response.speech);
            moveBot(this, response.action);
            logToTerminal(`<span style="color: #4285f4; font-weight: bold;">Gemini :</span> ${response.speech}`);
        } catch (e) {
            console.error("Gemini Brain Error:", e);
        }
    }

    getNearbyContext() {
        const state = window.world_state || { scene_3d: [], bots: [] };
        const items = [...(state.scene_3d || []), ...(state.bots || [])]
            .map(i => `${i.id}(${i.shape}, ${i.color})`)
            .slice(0, 5)
            .join(', ');
        return items || "Un espace vide et mystérieux.";
    }

    updateSpeechBubble(text) {
        const bubble = document.getElementById('gemini-speech-bubble');
        if (bubble) {
            bubble.setAttribute('value', text);
            bubble.setAttribute('visible', 'true');
            setTimeout(() => {
                if (bubble.getAttribute('value') === text) bubble.setAttribute('visible', 'false');
            }, 5000);
        }
    }

    async chat(userMessage) {
        this.history.push(`Utilisateur: ${userMessage}`);
        const prompt = `Contexte de vision : ${this.getNearbyContext()}.
        L'utilisateur te dit : "${userMessage}".
        Réponds brièvement en tant qu'agent Gemini.
        JSON : { "speech": "..." }`;

        try {
            const data = await fetchGemini({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            }, CONFIG.AGENT_MODEL);
            const response = JSON.parse(data.candidates[0].content.parts[0].text);
            this.updateSpeechBubble(response.speech);
            this.history.push(`Gemini: ${response.speech}`);
            logToTerminal(`<span style="color: #4285f4; font-weight: bold;">Gemini :</span> ${response.speech}`);
        } catch (e) {
            logToTerminal("[ERREUR] Gemini ne peut pas répondre au chat.");
        }
    }
}

export const geminiAgent = new GeminiAgent();
