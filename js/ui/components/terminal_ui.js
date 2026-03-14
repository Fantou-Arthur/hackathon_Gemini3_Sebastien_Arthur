export function getTerminalMarkup() {
    return `
        <div id="terminal-header">Agent Logs</div>
        <div id="architect-panel">
            <div style="margin-bottom: 8px; color: #fff; font-size: 0.9em;">Agent Architecte 3D</div>
            <textarea id="promptInput" rows="3" placeholder="Ex: Crée une scène..."></textarea>
            <button id="generateBtn">Nouveau Monde</button>
            <button id="addBtn" style="margin-top: 5px; background: #2c3e50; color: #ecf0f1; border: 1px solid #ecf0f1; padding: 10px; width: 100%; font-family: 'JetBrains Mono', monospace; cursor: pointer; border-radius: 4px; font-weight: bold; text-transform: uppercase; transition: all 0.2s;">Ajouter à la scène</button>
            <button id="toggleIABtn" style="margin-top: 5px; background: #333; color: #0f0; border: 1px solid #0f0; padding: 5px; width: 100%; font-family: monospace; cursor: pointer;">IA GENERATION : ON</button>
            <button id="toggleGeminiBtn" style="margin-top: 5px; background: #4285f4; color: #fff; border: 1px solid #fff; padding: 5px; width: 100%; font-family: monospace; cursor: pointer;">GEMINI AGENT : ON</button>
            <div id="status">Chargement du système...</div>
        </div>
        <div id="gemini-chat-panel" style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">
            <div style="color: #4285f4; font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Chat avec Gemini</div>
            <input id="chatInput" type="text" placeholder="Dis quelque chose..." style="width: 100%; background: #222; border: 1px solid #4285f4; color: #fff; padding: 5px; font-family: monospace;">
        </div>
        <div id="npc-panel" style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">
            <div style="color: #0f0; font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Gestionnaire de NPCs</div>
            <div id="npc-list" style="font-size: 0.8em; max-height: 100px; overflow-y: auto; background: #111; padding: 5px; border: 1px solid #333;">
                En attente de bots...
            </div>
            <button id="resetNPCsBtn" style="margin-top: 5px; background: #c0392b; color: #fff; border: none; padding: 5px; width: 100%; font-family: monospace; cursor: pointer; font-size: 0.8em;">Réinitialiser positions</button>
        </div>
        <div id="agent-logs">
            <div class="log-entry"><span class="log-time">[SYS]</span> Initialisation des modules...</div>
        </div>
    `;
}
