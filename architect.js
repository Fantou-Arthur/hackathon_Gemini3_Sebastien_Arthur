const ARCHITECT_API_KEY = "AIzaSyDCWti5L6qeQHM2PRCFaL_k4EzUGU5YaCc";

async function callArchitect(userInput) {
    // Le modèle recommandé est gemini-2.5-pro, mais le quota API gratuit est dépassé ou limité à 0 pour cette clé
    // Basculement sur gemini-flash-latest (permet de débloquer le quota journalier très limité de la 2.5)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${ARCHITECT_API_KEY}`;

    const systemPrompt = `Tu es un Architecte 3D Expert en A-Frame. L'utilisateur va te demander de créer un décor.
    RÈGLES STRICTES DE GÉNÉRATION :
    1. Génère un JSON valide contenant 'scene_3d' (tableau d'objets statiques du décor) et 'bots' (tableau d'entités mobiles).
    2. UTILISE DE GRANDES ÉCHELLES. Si on demande une "ville" ou un "bâtiment", génère des '<a-box>' ou '<a-cylinder>' massifs (ex: width: 10, height: 20, depth: 15).
    3. Ajoute beaucoup de détails : crée de multiples objets en combinant des primitives A-Frame (sols colorés, routes, nombreux murs, piliers) pour former le décor demandé.
    4. Éparpille les objets dans l'espace (positions X, Y, Z variées entre -30 et 30) pour remplir le champ de vision.
    5. Pour chaque objet, fournis : id, shape (ex: 'a-box', 'a-sphere'), color (code Hex), x, y, z, et les dimensions requises (width/height/depth pour a-box, radius pour a-sphere).
    6. Pour les 'bots', ajoute aussi une propriété 'rules' contenant un petit trait de personnalité. Les actions autorisées dans 'rules' sont [MOVE_FORWARD, MOVE_BACKWARD, MOVE_LEFT, MOVE_RIGHT, WAIT].
    7. NE RENVOIE QUE LE CODE JSON VALIDE, SANS AUCUN TEXTE AVANT NI APRÈS.`;

    // En v1, SystemInstruction et responseMimeType ne sont pas supportés tels quels pour tous les modèles.
    // On injecte le System Prompt directement comme un ordre initial FORT dans les contents.
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
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Détails de l'erreur API :", errorBody);
            throw new Error(`Erreur HTTP: ${response.status} - ${errorBody.error?.message || "Erreur inconnue"}`);
        }

        const data = await response.json();
        let jsonString = data.candidates[0].content.parts[0].text;
        
        // Nettoyage au cas où Gemini ajoute des balises Markdown (```json ... ```)
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

        const worldData = JSON.parse(jsonString);
        return worldData;

    } catch (error) {
        console.error("Erreur de l'Architecte :", error);
        logToTerminal(`[ERREUR] Architecte injoignable: ${error.message}`);
        return null;
    }
}

// 1. On écoute le clic sur le bouton "Générer le monde"
document.getElementById("generateBtn").addEventListener("click", async () => {
    const userInput = document.getElementById("promptInput").value;
    if (!userInput) return alert("Écris une description !");

    document.getElementById("status").innerText = "Génération du monde en cours...";
    document.getElementById("generateBtn").disabled = true;

    // 2. On appelle notre Agent Architecte
    const generatedWorldJSON = await callArchitect(userInput);

    if (generatedWorldJSON) {
        console.log("Monde généré avec succès !", generatedWorldJSON);
        
        // On sauvegarde l'état globalement pour la gameloop
        window.world_state = generatedWorldJSON;

        // 3. On passe le JSON au moteur 3D (A-Frame) pour l'afficher !
        renderWorld(generatedWorldJSON); 
        
        document.getElementById("status").innerText = "Monde généré ! Les bots sont prêts.";
        document.getElementById("generateBtn").disabled = false;
        
        // Démarrer la boucle des bots
        if (typeof startGameLoop === 'function') {
            startGameLoop();
        }
    } else {
        document.getElementById("status").innerText = "Erreur lors de la génération.";
        document.getElementById("status").style.color = "red";
        document.getElementById("generateBtn").disabled = false;
    }
});
