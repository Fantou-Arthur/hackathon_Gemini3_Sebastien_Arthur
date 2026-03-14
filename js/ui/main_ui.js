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

    generateBtn.addEventListener("click", () => handleGeneration(false));
    addBtn.addEventListener("click", () => handleGeneration(true));

    toggleIABtn.addEventListener('click', () => {
        const newState = !getIAEnabled();
        setIAEnabled(newState);
        toggleIABtn.innerText = newState ? "IA : ON" : "IA : OFF";
        toggleIABtn.style.color = newState ? "#0f0" : "#f00";
        toggleIABtn.style.borderColor = newState ? "#0f0" : "#f00";
        logToTerminal(`IA ${newState ? 'activée' : 'désactivée'}.`);
    });

    logToTerminal("Interface prête. En attente de génération.");
}
