import { callArchitect } from '../services/architect.js';
import { renderWorld } from '../renderer/world_renderer.js';
import { startGameLoop, setIAEnabled, getIAEnabled } from '../game/game_loop.js';
import { logToTerminal } from '../utils/logger.js';

export function initUI() {
    const generateBtn = document.getElementById("generateBtn");
    const promptInput = document.getElementById("promptInput");
    const status = document.getElementById("status");
    const toggleIABtn = document.getElementById('toggleIABtn');

    generateBtn.addEventListener("click", async () => {
        const userInput = promptInput.value;
        if (!userInput) return alert("Écris une description !");

        status.innerText = "Génération du monde en cours...";
        generateBtn.disabled = true;

        const generatedWorldJSON = await callArchitect(userInput);

        if (generatedWorldJSON) {
            console.log("Monde généré avec succès !", generatedWorldJSON);
            window.world_state = generatedWorldJSON;

            renderWorld(generatedWorldJSON); 
            
            status.innerText = "Monde généré ! Les bots sont prêts.";
            generateBtn.disabled = false;
            
            startGameLoop();
        } else {
            status.innerText = "Erreur lors de la génération.";
            status.style.color = "red";
            generateBtn.disabled = false;
        }
    });

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
