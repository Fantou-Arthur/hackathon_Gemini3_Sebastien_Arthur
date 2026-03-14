import { getTerminalMarkup } from './components/terminal_ui.js';
import { getVRSceneMarkup } from './components/vr_scene_ui.js';
import { callArchitect } from '../services/architect.js';
import { renderWorld } from '../renderer/world_renderer.js';
import { startGameLoop, setIAEnabled, getIAEnabled } from '../game/game_loop.js';
import { logToTerminal } from '../utils/logger.js';
import { loadEnv } from '../utils/env_loader.js';
import { CONFIG } from '../config.js';

export async function initUI() {
    // Chargement de l'environnement
    const env = await loadEnv();
    if (env.GEMINI_API_KEY) {
        CONFIG.API_KEY = env.GEMINI_API_KEY;
    } else {
        logToTerminal("[ERREUR] GEMINI_API_KEY manquante dans le fichier .env");
    }

    // Injection du markup modularisé
    const vrContainer = document.getElementById('vr-container');
    const terminalContainer = document.getElementById('terminal-container');
    
    if (vrContainer) vrContainer.innerHTML = getVRSceneMarkup();
    if (terminalContainer) terminalContainer.innerHTML = getTerminalMarkup();

    const addBtn = document.getElementById("addBtn");
    const promptInput = document.getElementById("promptInput");
    const status = document.getElementById("status");
    const toggleIABtn = document.getElementById('toggleIABtn');

    const handleGeneration = async (append = false) => {
        const userInput = promptInput.value;
        if (!userInput) return alert("Écris une description !");

        status.innerText = append ? "Ajout d'éléments en cours..." : "Génération du monde en cours...";
        generateBtn.disabled = true;
        addBtn.disabled = true;

        // Préparation du contexte si append
        let finalInput = userInput;
        if (append && window.world_state) {
            const count = (window.world_state.scene_3d?.length || 0) + (window.world_state.bots?.length || 0);
            finalInput = `CONTEXTE (Monde actuel possède déjà ${count} objets). INSTRUCTION : Ajoute à ce monde : ${userInput}. Ne répète pas l'environnement_preset existant.`;
        }

        const generatedWorldJSON = await callArchitect(finalInput);

        if (generatedWorldJSON) {
            console.log("Données reçues :", generatedWorldJSON);
            
            if (append && window.world_state) {
                // Fusion des données
                window.world_state.scene_3d = [...(window.world_state.scene_3d || []), ...(generatedWorldJSON.scene_3d || [])];
                window.world_state.bots = [...(window.world_state.bots || []), ...(generatedWorldJSON.bots || [])];
                renderWorld(generatedWorldJSON, true); 
            } else {
                window.world_state = generatedWorldJSON;
                renderWorld(generatedWorldJSON, false); 
            }
            
            status.innerText = append ? "Éléments ajoutés !" : "Nouveau monde généré !";
            generateBtn.disabled = false;
            addBtn.disabled = false;
            
            startGameLoop();
        } else {
            status.innerText = "Erreur lors de la génération.";
            status.style.color = "red";
            generateBtn.disabled = false;
            addBtn.disabled = false;
        }
    };

    const chatInput = document.getElementById("chatInput");
    
    // Initialisation Gemini Agent
    const { geminiAgent } = await import('../game/gemini_brain.js');

    chatInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const msg = chatInput.value;
            chatInput.value = "";
            logToTerminal(`<span style="color: #aaa;">Vous :</span> ${msg}`);
            await geminiAgent.chat(msg);
        }
    });

    // Boucle de pensée autonome (chaque seconde)
    setInterval(() => {
        if (getIAEnabled() && geminiAgent.active) {
            const context = {
                nearbyObjects: window.world_state?.scene_3d?.length || 0,
                lastUserMessage: "" // Améliorable plus tard
            };
            geminiAgent.think(context);
        }
    }, 1000);

    generateBtn.addEventListener("click", () => {
        geminiAgent.active = true;
        handleGeneration(false);
    });
    addBtn.addEventListener("click", () => handleGeneration(true));

    const toggleGeminiBtn = document.getElementById('toggleGeminiBtn');

    toggleIABtn.addEventListener('click', () => {
        const newState = !getIAEnabled();
        setIAEnabled(newState);
        toggleIABtn.innerText = newState ? "IA GENERATION : ON" : "IA GENERATION : OFF";
        toggleIABtn.style.color = newState ? "#0f0" : "#f00";
        toggleIABtn.style.borderColor = newState ? "#0f0" : "#f00";
        logToTerminal(`IA de génération ${newState ? 'activée' : 'désactivée'}.`);
    });

    toggleGeminiBtn.addEventListener('click', () => {
        geminiAgent.enabled = !geminiAgent.enabled;
        toggleGeminiBtn.innerText = geminiAgent.enabled ? "GEMINI AGENT : ON" : "GEMINI AGENT : OFF";
        toggleGeminiBtn.style.background = geminiAgent.enabled ? "#4285f4" : "#333";
        toggleGeminiBtn.style.color = geminiAgent.enabled ? "#fff" : "#888";
        logToTerminal(`Agent Gemini ${geminiAgent.enabled ? 'activé' : 'désactivé'}.`);
        
        // Cacher l'avatar si désactivé
        const avatar = document.getElementById('gemini-agent-avatar');
        if (avatar) avatar.setAttribute('visible', geminiAgent.enabled);
    });

    // Gestion des NPCs
    const npcList = document.getElementById("npc-list");
    const resetBtn = document.getElementById("resetNPCsBtn");

    const updateNPCList = () => {
        if (!window.world_state || !window.world_state.bots) return;
        npcList.innerHTML = window.world_state.bots.map(bot => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px; border-bottom: 1px solid #222;">
                <span>${bot.id}</span>
                <span style="color: ${getIAEnabled() ? '#0f0' : '#f00'};">${getIAEnabled() ? 'Actif' : 'Fixé'}</span>
            </div>
        `).join('');
    };

    resetBtn.addEventListener('click', () => {
        if (!window.world_state || !window.world_state.bots) return;
        window.world_state.bots.forEach(bot => {
            bot.x = bot.originX || bot.x;
            bot.z = bot.originZ || bot.z;
            const el = document.getElementById(bot.id);
            if (el) el.setAttribute('position', `${bot.x} ${bot.y} ${bot.z}`);
        });
        logToTerminal("Positions des NPCs réinitialisées.");
    });

    // Mise à jour périodique de l'UI
    setInterval(updateNPCList, 2000);

    logToTerminal("Interface prête. En attente de génération.");
}
