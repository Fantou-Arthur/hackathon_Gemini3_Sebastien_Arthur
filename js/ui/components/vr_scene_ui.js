export function getVRSceneMarkup() {
    return `
        <a-scene embedded shadow="type: pcfsoft">
            <!-- Environnement procédural riche -->
            <a-entity environment="preset: contact; seed: 42; lighting: none; shadow: true; skyType: atmosphere; groundColor: #333; grid: dots"></a-entity>
            
            <a-entity id="dynamic-world"></a-entity>
            <a-entity position="0 1.6 4">
                <a-camera look-controls wasd-controls></a-camera>
            </a-entity>

            <!-- Éclairage optimisé pour les ombres -->
            <a-light type="ambient" color="#bbb"></a-light>
            <a-light type="directional" color="#ffffff" intensity="0.6" position="-1 10 3" castShadow="true" shadow-camera-left="-30" shadow-camera-bottom="-30" shadow-camera-right="30" shadow-camera-top="30"></a-light>
        </a-scene>
    `;
}
