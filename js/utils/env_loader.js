export async function loadEnv() {
    try {
        const response = await fetch(`/.env?t=${Date.now()}`);
        const text = await response.text();
        const env = {};
        
        text.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.join('=').trim();
            }
        });
        
        return env;
    } catch (e) {
        console.error("Impossible de charger le fichier .env", e);
        return {};
    }
}
