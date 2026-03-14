import { logToTerminal } from '../utils/logger.js';

export function renderWorld(json, append = false) {
    logToTerminal(append ? "Expansion spatiale en cours..." : "Construction spatiale en cours...");
    const worldContainer = document.getElementById('dynamic-world');
    if (!worldContainer) return;

    // Nettoyage seulement si on ne fait pas un append
    if (!append) {
        while (worldContainer.firstChild) {
            worldContainer.removeChild(worldContainer.firstChild);
        }
    }

    const createAFrameEntity = (item, entityType) => {
        const el = document.createElement(item.shape || 'a-box');
        
        el.setAttribute('id', item.id);
        el.setAttribute('color', item.color || '#FFFFFF');
        el.setAttribute('shadow', 'cast: true; receive: true');
        el.setAttribute('material', 'roughness: 0.6; metalness: 0.3');
        
        const positionString = `${item.x || 0} ${item.y || 1} ${item.z || -2}`;
        el.setAttribute('position', positionString);

        // Gestion dynamique des dimensions par primitive
        if (item.radius) el.setAttribute('radius', item.radius);
        if (item.radiusOuter) el.setAttribute('radius-outer', item.radiusOuter);
        if (item.radiusInner) el.setAttribute('radius-inner', item.radiusInner);
        if (item.radiusTubular) el.setAttribute('radius-tubular', item.radiusTubular);
        if (item.height) el.setAttribute('height', item.height);
        if (item.width) el.setAttribute('width', item.width);
        if (item.depth) el.setAttribute('depth', item.depth);
        if (item.segments) el.setAttribute('segments', item.segments);

        worldContainer.appendChild(el);
        logToTerminal(`-> <span class="log-highlight">${entityType}</span> : [${item.id}] shape:${item.shape}`);
    };

    // Mise à jour de l'environnement si spécifié
    if (json.environment_preset) {
        const env = document.querySelector('[environment]');
        if (env) {
            env.setAttribute('environment', `preset: ${json.environment_preset}; seed: 42; lighting: none; shadow: true`);
            logToTerminal(`Ambiance mise à jour : <span class="log-highlight">${json.environment_preset}</span>`);
        }
    }

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
