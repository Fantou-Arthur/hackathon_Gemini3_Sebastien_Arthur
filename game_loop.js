// Utilisation de la clé fournie
const GAME_LOOP_API_KEY = "AIzaSyDCWti5L6qeQHM2PRCFaL_k4EzUGU5YaCc";
// Utilisation de gemini-flash-latest pour éviter la saturation du quota journalier
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GAME_LOOP_API_KEY}`;

let isIAEnabled = true; // Flag pour activer/désactiver l'IA manuellement

let isGameLoopRunning = false;
let gameLoopTimeout = null;

/**
 * Fonction qui résume l'environnement pour un bot donné.
 */
function buildEnvironmentContext(currentBot, state) {
    let contextText = `Tu es le bot ${currentBot.id}. Tu es en X:${Number(currentBot.x).toFixed(2)} Y:${Number(currentBot.y).toFixed(2)} Z:${Number(currentBot.z).toFixed(2)}. `;
    
    if (state.bots) {
        state.bots.forEach(otherBot => {
            if (otherBot.id !== currentBot.id) {
                contextText += `Le bot ${otherBot.id} est en X:${Number(otherBot.x).toFixed(2)} Y:${Number(otherBot.y).toFixed(2)} Z:${Number(otherBot.z).toFixed(2)}. `;
            }
        });
    }

    if (state.scene_3d) {
        state.scene_3d.forEach(obj => {
            contextText += `L'objet statique ${obj.id} est en X:${Number(obj.x).toFixed(2)} Y:${Number(obj.y).toFixed(2)} Z:${Number(obj.z).toFixed(2)}. `;
        });
    }

    return contextText.trim();
}

/**
 * Met à jour la position de l'élément dans le DOM A-Frame
 */
function updateDOMPosition(botId, newX, newY, newZ) {
    const el = document.getElementById(botId);
    if (el) {
        el.setAttribute('position', `${newX} ${newY} ${newZ}`);
    }
}

/**
 * Game Loop principale "Tick" asynchrone sécurisée
 */
function startGameLoop() {
    // Si on clique plusieurs fois sur "Générer le monde", on tue l'ancienne boucle
    if (isGameLoopRunning && gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
    }
    isGameLoopRunning = true;
    logToTerminal("Démarrage de la Game Loop IA (Toutes les 30 secondes)...");
    runGameTick();
}

async function runGameTick() {
    if (!window.world_state || !window.world_state.bots || window.world_state.bots.length === 0) {
        gameLoopTimeout = setTimeout(runGameTick, 30000);
        return;
    }

    if (!isIAEnabled) {
        logToTerminal("L'IA est en pause. Les bots sont figés.");
        gameLoopTimeout = setTimeout(runGameTick, 5000); // Check plus fréquent quand en pause
        return;
    }

    try {
        logToTerminal("Analyse de l'état global par l'IA (Batching)...");

        // Construction du contexte global
        let contextText = "ÉTAT DE LA SCÈNE :\n";
        window.world_state.bots.forEach(bot => {
            contextText += `- Bot [${bot.id}] en X:${Number(bot.x).toFixed(2)}, Y:${Number(bot.y).toFixed(2)}, Z:${Number(bot.z).toFixed(2)}. Règles: ${bot.rules || "Aléatoire"}.\n`;
        });
        
        if (window.world_state.scene_3d) {
            contextText += "OBSTACLES STATIQUES :\n";
            window.world_state.scene_3d.forEach(obj => {
                contextText += `- Objet [${obj.id}] en X:${Number(obj.x).toFixed(2)}, Y:${Number(obj.y).toFixed(2)}, Z:${Number(obj.z).toFixed(2)}.\n`;
            });
        }

        const mainPrompt = `${contextText}\n
        INSTRUCTION : Pour CHAQUE bot listé ci-dessus, choisis une action parmi [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
        RÉPONDS UNIQUEMENT avec un objet JSON valide où la clé est l'ID du bot et la valeur est l'action choisie.
        Exemple : { "bot1": "MOVE_FORWARD", "bot2": "WAIT" }
        NE RENVOIE RIEN D'AUTRE QUE LE JSON.`;

        const requestBody = {
            contents: [{ role: "user", parts: [{ text: mainPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        let botActions = {};

        try {
            const response = await fetch(GEMINI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                console.warn(`[WARN] Limite API atteinte GameLoop: ${response.status}`, errorBody.error?.message);
                throw new Error("Quota atteint");
            } 

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                let aiResponse = data.candidates[0].content.parts[0].text.trim();
                botActions = JSON.parse(aiResponse);
            }
        } catch (err) {
            // Fallback : Mouvements aléatoires si l'API échoue
            logToTerminal(`[WARN] API surchargée ou erreur. Passage en mode mouvement improvisé.`);
            window.world_state.bots.forEach(bot => {
                botActions[bot.id] = ["MOVE_FORWARD", "MOVE_BACKWARD", "MOVE_LEFT", "MOVE_RIGHT", "WAIT"][Math.floor(Math.random() * 5)];
            });
        }

        // Mise à jour de tous les bots
        const step = 0.5;
        window.world_state.bots.forEach(bot => {
            const action = botActions[bot.id] || "WAIT";
            
            bot.x = Number(bot.x) || 0;
            bot.y = Number(bot.y) || 1;
            bot.z = Number(bot.z) || 0;
            
            switch (action) {
                case "MOVE_FORWARD": bot.z -= step; break;
                case "MOVE_BACKWARD": bot.z += step; break;
                case "MOVE_LEFT": bot.x -= step; break;
                case "MOVE_RIGHT": bot.x += step; break;
            }

            updateDOMPosition(bot.id, bot.x, bot.y, bot.z);
            if (action !== "WAIT") {
                console.log(`Bot ${bot.id} -> ${action}`);
            }
        });

        logToTerminal("Mise à jour de la scène terminée.");

    } catch (e) {
        console.error("Erreur critique GameLoop:", e);
    }

    // On garde un intervalle de 30 secondes pour être ultra-sûr par rapport au quota de 20 RPM (incluant la génération)
    gameLoopTimeout = setTimeout(runGameTick, 30000);
}
