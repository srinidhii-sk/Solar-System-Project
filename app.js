// ==========================================
// 1. DATA CENTER: SCIENTIFIC TELEMETRY DATA
// ==========================================
const celestialRegistry = {
    sun: { name: "The Sun", type: "Star", metric: "1,392,700 km", environment: "~15M °C", distance: 0, speed: 0, radius: 5.5, color: "#ff9900", surfaceType: 0, info: "The gravitational anchor of our system, containing 99.8% of its entire mass." },
    mercury: { name: "Mercury", type: "Terrestrial", metric: "4,879 km", environment: "-180°C / 430°C", distance: 10, speed: 0.035, radius: 0.6, color: "#7a7a7a", surfaceType: 1, info: "A heavily cratered rocky planet. It experiences wild temperature swings due to its lack of an atmosphere." },
    venus: { name: "Venus", type: "Terrestrial", metric: "12,104 km", environment: "~465 °C Constant", distance: 15, speed: 0.025, radius: 1.1, color: "#e8b06b", surfaceType: 2, info: "Wrapped in a runaway greenhouse effect with thick sulfuric acid clouds and high atmospheric pressure." },
    earth: { name: "Earth", type: "Terrestrial", metric: "12,756 km", environment: "-89°C / 58°C", distance: 21, speed: 0.018, radius: 1.2, color: "#1b63de", surfaceType: 3, info: "Our home world. It is the only known ecosystem containing active liquid oceans and complex biological organisms." },
    mars: { name: "Mars", type: "Terrestrial", metric: "6,792 km", environment: "-153°C / 20°C", distance: 28, speed: 0.014, radius: 0.8, color: "#c94614", surfaceType: 4, info: "The Red Planet. Iron oxide dust covers its landscape, which features polar ice caps and massive canyons." },
    jupiter: { name: "Jupiter", type: "Gas Giant", metric: "142,984 km", environment: "~ -110°C", distance: 38, speed: 0.009, radius: 2.4, color: "#cca072", surfaceType: 5, info: "The largest planet. A massive gas giant known for its dynamic storm bands and the historic Great Red Spot." },
    saturn: { name: "Saturn", type: "Gas Giant", metric: "120,536 km", environment: "~ -140°C", distance: 48, speed: 0.007, radius: 2.0, color: "#e5ca9a", surfaceType: 6, info: "Famous for its stunning, highly reflective planetary ring system composed of pure space dust and water ice." },
    uranus: { name: "Uranus", type: "Ice Giant", metric: "51,118 km", environment: "~ -195°C", distance: 58, speed: 0.004, radius: 1.5, color: "#a5e2f3", surfaceType: 7, info: "An ice giant with a unique orientation—it rotates completely on its side, practically rolling along its orbit." },
    neptune: { name: "Neptune", type: "Ice Giant", metric: "49,528 km", environment: "~ -200°C", distance: 66, speed: 0.003, radius: 1.4, color: "#274ee6", surfaceType: 8, info: "The most distant planet from the Sun. It experiences extreme supersonic winds reaching up to 2,100 km/h." }
};

// ==========================================
// 2. GLSL PROCEDURAL MATERIAL CUSTOM SHADERS
// ==========================================
const planetVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const planetFragmentShader = `
    uniform vec3 baseColor;
    uniform int surfaceType;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vec3 lightVector = normalize(vec3(1.0, 0.5, 1.0));
        float diffuseIntensity = max(dot(vNormal, lightVector), 0.15);
        vec3 surfaceTexture = baseColor;

        if (surfaceType == 0) {
            float pattern = sin(vUv.x * 40.0) * cos(vUv.y * 40.0) * 0.2;
            surfaceTexture += vec3(pattern, pattern * 0.5, 0.0);
        }
        else if (surfaceType == 1) {
            float crater = sin(vUv.x * 100.0) * sin(vUv.y * 100.0);
            if(crater > 0.7) surfaceTexture -= vec3(0.25);
        }
        else if (surfaceType == 2) {
            surfaceTexture += vec3(sin(vUv.y * 25.0) * 0.15, cos(vUv.x * 10.0) * 0.08, 0.0);
        }
        else if (surfaceType == 3) {
            float land = sin(vUv.x * 12.0) * cos(vUv.y * 12.0);
            if(land > 0.1) surfaceTexture = vec3(0.1, 0.5, 0.15);
            float clouds = sin(vUv.x * 50.0 + vUv.y * 30.0);
            if(clouds > 0.6) surfaceTexture += vec3(0.35);
        }
        else if (surfaceType == 4) {
            float canyons = cos(vUv.x * 30.0) * sin(vUv.y * 20.0);
            if(canyons > 0.4) surfaceTexture -= vec3(0.12, 0.08, 0.0);
            if(vUv.y > 0.9 || vUv.y < 0.1) surfaceTexture = vec3(0.95, 0.95, 0.95);
        }
        else if (surfaceType == 5 || surfaceType == 6) {
            float bands = sin(vUv.y * 55.0) * 0.18;
            surfaceTexture += vec3(bands, bands * 0.5, -bands * 0.2);
        }
        else if (surfaceType == 7 || surfaceType == 8) {
            float iceBands = cos(vUv.x * 15.0 + vUv.y * 20.0) * 0.08;
            surfaceTexture += vec3(iceBands);
        }

        gl_FragColor = vec4(surfaceTexture * diffuseIntensity, 1.0);
    }
`;

function createProceduralMaterial(hexColor, surfaceType) {
    return new THREE.ShaderMaterial({
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms: {
            baseColor: { value: new THREE.Color(hexColor) },
            surfaceType: { value: surfaceType }
        }
    });
}

// ==========================================
// 3. NAVIGATION VIEWPORT MANAGER
// ==========================================
function switchTab(targetTabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));

    const activeBtnIndex = ['home', 'facts', 'explore'].indexOf(targetTabId);
    if(activeBtnIndex !== -1) {
        document.querySelectorAll('.nav-btn')[activeBtnIndex].classList.add('active');
    }

    const targetSection = document.getElementById(`${targetTabId}-view`);
    if(targetSection) targetSection.classList.add('active');

    if(targetTabId === 'explore') {
        window.dispatchEvent(new Event('resize'));
    }
}

// ==========================================
// 4. MODULE: DATA VISUAL HUBS IMAGE GENERATOR
// ==========================================
function renderPlanetFactsGrid() {
    const gridContainer = document.getElementById('planet-grid-container');
    if(!gridContainer) return;
    gridContainer.innerHTML = ''; 

    Object.keys(celestialRegistry).forEach(key => {
        const body = celestialRegistry[key];
        
        // Capitalizes the first letter to match your files perfectly (e.g., "earth" -> "Earth")
        const capitalizedName = key.charAt(0).toUpperCase() + key.slice(1);
        
        // Sets up your direct relative file paths based on your assets folder structure
        const imageSrc = `assets/${capitalizedName}.png`;

        const card = document.createElement('div');
        card.className = 'planet-card';
        card.innerHTML = `
            <div class="micro-render-frame">
                <img src="${imageSrc}" 
                     alt="${body.name}" 
                     class="planet-hub-img">
            </div>
            <h3>${body.name}</h3>
            <div class="planet-badge">${body.type}</div>
            <div class="stat-row"><span class="stat-label">Diameter:</span><span class="stat-value">${body.metric}</span></div>
            <div class="stat-row"><span class="stat-label">Avg Temp:</span><span class="stat-value">${body.environment}</span></div>
            <p class="planet-desc">${body.info}</p>
        `;
        gridContainer.appendChild(card);
    });
}

// ==========================================
// 5. MAIN SYSTEM: 3D INTEGRATED INTERACTIVE ORRERY
// ==========================================
let scene, camera, renderer, controls;
let isOrbiting = true;
const targetFocus = { type: 'none', mesh: null };
const orreryMeshes = {};

function initMainOrreryEngine() {
    const container = document.getElementById('canvas-container');
    if(!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight - 70), 0.1, 2000);
    camera.position.set(0, 75, 140);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 70);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;

    // Starfield Particle Generation
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(3000 * 3);
    for(let i = 0; i < 3000 * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 1200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6 })));

    // Generate Orbit Track Rings
    function drawOrbitVectorLine(distance) {
        if(distance === 0) return;
        const ringMesh = new THREE.Mesh(
            new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128),
            new THREE.MeshBasicMaterial({ color: 0x1c244c, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
        );
        ringMesh.rotation.x = Math.PI / 2;
        scene.add(ringMesh);
    }

    // Assemble Orrery Vector Scales
    Object.keys(celestialRegistry).forEach(key => {
        const data = celestialRegistry[key];
        const material = createProceduralMaterial(data.color, data.surfaceType);
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.x = data.distance;
        scene.add(mesh);
        orreryMeshes[key] = mesh;

        if(key === 'saturn') {
            const saturnRings = new THREE.Mesh(
                new THREE.RingGeometry(data.radius + 0.5, data.radius + 3.0, 64),
                new THREE.MeshStandardMaterial({ color: 0xb59e72, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
            );
            saturnRings.rotation.x = Math.PI / 2;
            mesh.add(saturnRings);
            scene.add(new THREE.AmbientLight(0x222222));
        }

        data.currentAngle = Math.random() * Math.PI * 2; 
        drawOrbitVectorLine(data.distance);
    });

    // Event Interfaces UI Controllers
    document.getElementById('planet-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if(val === 'none') {
            targetFocus.type = 'none'; 
            targetFocus.mesh = null;
            document.getElementById('info-panel').innerHTML = "Select an object from the controller dropdown menu to engage tracking.";
        } else {
            targetFocus.type = val; 
            targetFocus.mesh = orreryMeshes[val];
            document.getElementById('info-panel').innerHTML = `<b>${celestialRegistry[val].name}</b><br>${celestialRegistry[val].info}`;
        }
    });

    document.getElementById('pause-btn').addEventListener('click', () => {
        isOrbiting = !isOrbiting;
        document.getElementById('pause-btn').textContent = isOrbiting ? "Pause Orbits" : "Resume Orbits";
    });

    runOrreryLoop();
}

// ==========================================
// 6. ANIMATION LOOP ENGINE & RESIZE HANDLERS
// ==========================================
function runOrreryLoop() {
    requestAnimationFrame(runOrreryLoop);
    
    Object.keys(celestialRegistry).forEach(key => {
        const data = celestialRegistry[key];
        const mesh = orreryMeshes[key];
        if(!mesh) return;

        mesh.rotation.y += 0.01;

        if (isOrbiting && data.speed > 0) {
            data.currentAngle += data.speed * 0.3;
            mesh.position.x = Math.cos(data.currentAngle) * data.distance;
            mesh.position.z = Math.sin(data.currentAngle) * data.distance;
        }
    });

    if (targetFocus.type !== 'none' && targetFocus.mesh) {
        controls.target.copy(targetFocus.mesh.position);
    }

    controls.update();
    if(renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    if(camera && renderer) {
        camera.aspect = window.innerWidth / (window.innerHeight - 70);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - 70);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    renderPlanetFactsGrid();
    initMainOrreryEngine();
});