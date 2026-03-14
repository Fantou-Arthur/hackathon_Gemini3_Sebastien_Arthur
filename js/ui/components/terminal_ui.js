export function getTerminalMarkup() {
    return `
        <div id="terminal-header">Agent Logs</div>
        <div id="architect-panel">
            <div style="margin-bottom: 8px; color: #fff; font-size: 0.9em;">Agent Architecte 3D</div>
            <textarea id="promptInput" rows="3" placeholder="Ex: Crée une scène..."></textarea>
            <button id="generateBtn">Générer le monde</button>
            <button id="toggleIABtn" style="margin-top: 5px; background: #333; color: #0f0; border: 1px solid #0f0; padding: 5px; width: 100%; font-family: monospace; cursor: pointer;">IA : ON</button>
            <div id="status">Chargement du système...</div>
        </div>
        <div id="agent-logs">
            <div class="log-entry"><span class="log-time">[SYS]</span> Initialisation des modules...</div>
        </div>
    `;
}
