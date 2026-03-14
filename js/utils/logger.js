export function logToTerminal(message) {
    const logsContainer = document.getElementById('agent-logs');
    if (!logsContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const now = new Date();
    const timeStr = now.toISOString().split('T')[1].substring(0, 8);
    
    logEntry.innerHTML = `<span class="log-time">[${timeStr}]</span> ${message}`;
    logsContainer.appendChild(logEntry);
    
    logsContainer.scrollTop = logsContainer.scrollHeight;
}
