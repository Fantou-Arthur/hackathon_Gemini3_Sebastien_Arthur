export function getTerminalMarkup() {
    return `
        <div id="terminal-header">Agent Logs</div>
        <div id="architect-panel">
            <div style="margin-bottom: 8px; color: #fff; font-size: 0.9em;">Agent Architecte 3D</div>
            <textarea id="promptInput" rows="3" placeholder="Ex: Crée une scène..."></textarea>
            <button id="generateBtn">Nouveau Monde</button>
            <button id="addBtn" style="margin-top: 5px; background: #2c3e50; color: #ecf0f1; border: 1px solid #ecf0f1; padding: 10px; width: 100%; font-family: 'JetBrains Mono', monospace; cursor: pointer; border-radius: 4px; font-weight: bold; text-transform: uppercase; transition: all 0.2s;">Ajouter à la scène</button>
            <button id="toggleIABtn" style="margin-top: 5px; background: #333; color: #0f0; border: 1px solid #0f0; padding: 5px; width: 100%; font-family: monospace; cursor: pointer;">IA : ON</button>
            <div id="status">Chargement du système...</div>
        </div>
        <div id="agent-logs">
            <div class="log-entry"><span class="log-time">[SYS]</span> Initialisation des modules...</div>
        </div>
    `;
}
