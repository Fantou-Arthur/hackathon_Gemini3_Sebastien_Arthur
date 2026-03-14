export function getVRSceneMarkup() {
    return `
        <a-scene embedded shadow="type: pcfsoft">
            <!-- Environnement procédural riche -->
            <a-entity environment="preset: contact; seed: 42; lighting: none; shadow: true; skyType: atmosphere; groundColor: #333; grid: dots"></a-entity>
            
            <a-entity id="dynamic-world"></a-entity>
            
            <!-- Avatar Gemini Interactif -->
            <a-entity id="gemini-agent-avatar" position="0 1.6 2">
                <a-sphere radius="0.4" color="#4285f4" material="emissive: #4285f4; emissiveIntensity: 2; opacity: 0.8; transparent: true"></a-sphere>
                <a-entity position="0 0.8 0">
                    <a-text id="gemini-speech-bubble" value="Bonjour !" align="center" color="#fff" width="4" geometry="primitive: plane; height: 0.5; width: 2.2" material="color: #000; opacity: 0.7"></a-text>
                </a-entity>
                <a-light type="point" color="#4285f4" intensity="0.5" distance="5"></a-light>
            </a-entity>

            <a-entity position="0 1.6 4">
                <a-camera look-controls wasd-controls></a-camera>
            </a-entity>

            <!-- Éclairage optimisé pour les ombres -->
            <a-light type="ambient" color="#bbb"></a-light>
            <a-light type="directional" color="#ffffff" intensity="0.6" position="-1 10 3" castShadow="true" shadow-camera-left="-30" shadow-camera-bottom="-30" shadow-camera-right="30" shadow-camera-top="30"></a-light>
        </a-scene>
    `;
}
