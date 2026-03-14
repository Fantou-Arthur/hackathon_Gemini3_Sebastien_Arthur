import { CONFIG } from '../config.js';
import { logToTerminal } from '../utils/logger.js';
import { fetchGemini } from '../services/gemini_api.js';
import { moveBot } from './bot_engine.js';

let isIAEnabled = true;
let gameLoopTimeout = null;

export function setIAEnabled(enabled) {
    isIAEnabled = enabled;
}

export function getIAEnabled() {
    return isIAEnabled;
}

export function startGameLoop() {
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
    }
    logToTerminal(`Démarrage de la Game Loop IA (${CONFIG.GAME_LOOP_INTERVAL / 1000}s)...`);
    runGameTick();
}

async function runGameTick() {
    const state = window.world_state;
    if (!state || !state.bots || state.bots.length === 0) {
        gameLoopTimeout = setTimeout(runGameTick, CONFIG.GAME_LOOP_INTERVAL);
        return;
    }

    if (!isIAEnabled) {
        logToTerminal("L'IA est en pause. Les bots sont figés.");
        gameLoopTimeout = setTimeout(runGameTick, CONFIG.GAME_LOOP_PAUSE_CHECK_INTERVAL);
        return;
    }

    try {
        logToTerminal("Analyse de l'état global par l'IA (Batching)...");

        let contextText = "ÉTAT DE LA SCÈNE :\n";
        state.bots.forEach(bot => {
            contextText += `- Bot [${bot.id}] en X:${Number(bot.x).toFixed(2)}, Y:${Number(bot.y).toFixed(2)}, Z:${Number(bot.z).toFixed(2)}. Règles: ${bot.rules || "Aléatoire"}.\n`;
        });
        
        if (state.scene_3d) {
            contextText += "OBSTACLES STATIQUES :\n";
            state.scene_3d.forEach(obj => {
                contextText += `- Objet [${obj.id}] en X:${Number(obj.x).toFixed(2)}, Y:${Number(obj.y).toFixed(2)}, Z:${Number(obj.z).toFixed(2)}.\n`;
            });
        }

        const mainPrompt = `${contextText}\n
        INSTRUCTION : Pour CHAQUE bot listé ci-dessus, choisis une action parmi [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
        RÉPONDS UNIQUEMENT avec un objet JSON valide où la clé est l'ID du bot et la valeur est l'action choisie.
        Exemple : { "bot1": "MOVE_FORWARD", "bot2": "WAIT" }
        NE RENVOIE RIEN D'AUTRE QUE LE JSON.`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: mainPrompt }] }],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.1 
            }
        };

        let botActions = {};

        try {
            const data = await fetchGemini(payload);
            if (data.candidates && data.candidates.length > 0) {
                let aiResponse = data.candidates[0].content.parts[0].text.trim();
                botActions = JSON.parse(aiResponse);
            }
        } catch (err) {
            logToTerminal(`[WARN] Erreur API GameLoop. Mode improvisation.`);
            state.bots.forEach(bot => {
                botActions[bot.id] = ["MOVE_FORWARD", "MOVE_BACKWARD", "MOVE_LEFT", "MOVE_RIGHT", "WAIT"][Math.floor(Math.random() * 5)];
            });
        }

        state.bots.forEach(bot => {
            const action = botActions[bot.id] || "WAIT";
            moveBot(bot, action);
        });

        logToTerminal("Mise à jour de la scène terminée.");

    } catch (e) {
        console.error("Erreur critique GameLoop:", e);
    }

    gameLoopTimeout = setTimeout(runGameTick, CONFIG.GAME_LOOP_INTERVAL);
}
