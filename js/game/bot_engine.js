import { CONFIG } from '../config.js';
import { updateDOMPosition } from '../renderer/world_renderer.js';

export function moveBot(bot, action) {
    const step = CONFIG.BOT_STEP;
    bot.x = Number(bot.x) || 0;
    bot.y = Number(bot.y) || 1;
    bot.z = Number(bot.z) || 0;
    
    switch (action) {
        case "MOVE_FORWARD": bot.z -= step; break;
        case "MOVE_BACKWARD": bot.z += step; break;
        case "MOVE_LEFT": bot.x -= step; break;
        case "MOVE_RIGHT": bot.x += step; break;
    }

    updateDOMPosition(bot.id, bot.x, bot.y, bot.z);
    
    if (action !== "WAIT") {
        console.log(`Bot ${bot.id} -> ${action}`);
    }
}
