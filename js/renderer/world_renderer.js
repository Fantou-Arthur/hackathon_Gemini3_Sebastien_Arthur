import { logToTerminal } from '../utils/logger.js';

export function renderWorld(json) {
    logToTerminal("Construction spatiale en cours...");
    const worldContainer = document.getElementById('dynamic-world');
    if (!worldContainer) return;

    // Nettoyage
    while (worldContainer.firstChild) {
        worldContainer.removeChild(worldContainer.firstChild);
    }

    const createAFrameEntity = (item, entityType) => {
        const el = document.createElement(item.shape || 'a-box');
        
        el.setAttribute('id', item.id);
        el.setAttribute('color', item.color || '#FFFFFF');
        
        const positionString = `${item.x || 0} ${item.y || 1} ${item.z || -2}`;
        el.setAttribute('position', positionString);

        if ((item.shape === 'a-sphere' || item.shape === 'a-cylinder') && item.radius) {
            el.setAttribute('radius', item.radius);
        } 
        if ((item.shape === 'a-cylinder' || item.shape === 'a-box') && item.height) {
            el.setAttribute('height', item.height);
        }
        if (item.shape === 'a-box') {
            if (item.width) el.setAttribute('width', item.width);
            if (item.depth) el.setAttribute('depth', item.depth);
        }

        worldContainer.appendChild(el);
        logToTerminal(`-> <span class="log-highlight">${entityType}</span> : [${item.id}] @ (${positionString})`);
    };

    if (json.scene_3d && Array.isArray(json.scene_3d)) {
        logToTerminal(`Génération de ${json.scene_3d.length} éléments statiques...`);
        json.scene_3d.forEach(item => createAFrameEntity(item, 'Objet 3D'));
    }

    if (json.bots && Array.isArray(json.bots)) {
        logToTerminal(`Déploiement de ${json.bots.length} entités mobiles...`);
        json.bots.forEach(item => createAFrameEntity(item, 'Bot'));
    }

    logToTerminal("Environnement 3D prêt.");
}

export function updateDOMPosition(botId, newX, newY, newZ) {
    const el = document.getElementById(botId);
    if (el) {
        el.setAttribute('position', `${newX} ${newY} ${newZ}`);
    }
}
