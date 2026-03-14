export function getVRSceneMarkup() {
    return `
        <a-scene embedded>
            <a-sky color="#1a1a1a"></a-sky> 
            <a-plane position="0 0 -4" rotation="-90 0 0" width="100" height="100" color="#333" material="roughness: 1;"></a-plane>
            <a-entity id="dynamic-world"></a-entity>
            <a-entity position="0 1.6 4"><a-camera></a-camera></a-entity>
            <a-light type="ambient" color="#fff" intensity="0.5"></a-light>
            <a-light type="directional" color="#fff" intensity="0.7" position="-1 2 1"></a-light>
        </a-scene>
    `;
}
