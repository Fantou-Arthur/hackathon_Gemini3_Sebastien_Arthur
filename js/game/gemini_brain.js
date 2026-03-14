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

        // Vision spatiale détaillée (avec distances)
        const nearbyItems = this.getNearbyContext();
        
        const prompt = `Tu es Gemini, un agent IA curieux. 
        TA POSITION : X:${this.x.toFixed(1)}, Z:${this.z.toFixed(1)}.
        VISION : ${nearbyItems}
        
        INSTRUCTIONS : 
        1. NAVIGATION : Dirige-toi vers un objet ou un NPC intéressant.
        2. SOCIAL : Si un NPC est à moins de 2m, tu peux lui parler directement.
        3. PAROLE : Réagis à ce que tu vois ou adresse-toi à un bot (max 12 mots).
        
        JSON : { "action": "...", "speech": "..." }`;

        try {
            const data = await fetchGemini({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
            }, CONFIG.AGENT_MODEL);

            const response = JSON.parse(data.candidates[0].content.parts[0].text);
            this.updateSpeechBubble(response.speech);
            moveBot(this, response.action);
            
            // Synchronisation pour la Game Loop
            if (window.world_state) {
                window.world_state.gemini_agent = { x: this.x, z: this.z };
            }

            logToTerminal(`<span style="color: #4285f4; font-weight: bold;">Gemini :</span> ${response.speech}`);
        } catch (e) {
            console.error("Gemini Brain Error:", e);
        }
    }

    getNearbyContext() {
        const state = window.world_state || { scene_3d: [], bots: [] };
        const allItems = [...(state.scene_3d || []), ...(state.bots || [])];
        
        const detailedItems = allItems.map(item => {
            const dx = item.x - this.x;
            const dz = item.z - this.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            let dirH = dx > 0.5 ? "Droite" : (dx < -0.5 ? "Gauche" : "");
            let dirV = dz > 0.5 ? "Derrière" : (dz < -0.5 ? "Devant" : "");
            const direction = `${dirV} ${dirH}`.trim() || "Sur toi";

            return `${item.id} (${direction}, dist: ${dist.toFixed(1)}m)`;
        }).slice(0, 5).join(' | ');

        return detailedItems || "Rien à l'horizon.";
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
