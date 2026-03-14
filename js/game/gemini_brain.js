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

        const prompt = `Tu es Gemini, un agent IA vivant dans ce monde VR. 
        TON ÉTAT : Position X:${this.x.toFixed(2)}, Y:${this.y.toFixed(2)}, Z:${this.z.toFixed(2)}.
        ENVIRONNEMENT PROCHE : ${context.nearbyObjects}
        DERNIER MESSAGE UTILISATEUR : ${context.lastUserMessage || "Aucun"}
        
        INSTRUCTIONS : 
        1. Choisis un mouvement parmi [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
        2. Rédige une courte phrase (max 10 mots) sur ce que tu vois ou fais.
        
        RÉPONDS UNIQUEMENT EN JSON : { "action": "...", "speech": "..." }`;

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

    updateSpeechBubble(text) {
        const bubble = document.getElementById('gemini-speech-bubble');
        if (bubble) {
            bubble.setAttribute('value', text);
            bubble.setAttribute('visible', 'true');
            // Cache la bulle après 5 secondes
            setTimeout(() => {
                if (bubble.getAttribute('value') === text) bubble.setAttribute('visible', 'false');
            }, 5000);
        }
    }

    async chat(userMessage) {
        const prompt = `L'utilisateur te parle : "${userMessage}".
        Réponds de manière amicale et concise en tant qu'agent Gemini présent dans cette scène.
        JSON : { "speech": "Ta réponse" }`;

        try {
            const data = await fetchGemini({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            }, CONFIG.AGENT_MODEL);
            const response = JSON.parse(data.candidates[0].content.parts[0].text);
            this.updateSpeechBubble(response.speech);
            logToTerminal(`<span style="color: #4285f4; font-weight: bold;">Gemini :</span> ${response.speech}`);
        } catch (e) {
            logToTerminal("[ERREUR] Gemini ne peut pas répondre au chat.");
        }
    }
}

export const geminiAgent = new GeminiAgent();
