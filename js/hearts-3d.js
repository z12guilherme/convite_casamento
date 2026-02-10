import * as h from "three";
import { OrbitControls as i } from "three/addons/controls/OrbitControls.js";
import { OBJLoader as p } from "three/addons/loaders/OBJLoader.js";
import { RGBELoader as e } from "three/addons/loaders/RGBELoader.js";

// Configuração de Cores do Tema (Verdes e Dourado)
const themeColors = ["#40B5A0", "#2D8B7A", "#37d4ad", "#A0D8C9"];

{
  let camera, scene, renderer, controls, instances;
  const container = document.getElementById('hero-canvas-container');
  const heartsData = []; // Dados leves para animação

  function onWindowResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    
    // Animação Simples (Sem Física Pesada)
    if (instances) {
        const dummy = new h.Object3D();
        
        for (let i = 0; i < heartsData.length; i++) {
            const data = heartsData[i];
            
            // Flutuar suavemente para cima
            data.y += data.speed * 0.005;
            data.rotationx += data.rotSpeed * 0.005;
            data.rotationy += data.rotSpeed * 0.005;
            
            // Resetar posição quando sair da tela
            if (data.y > 3.0) {
                data.y = -3.0;
                data.x = (Math.random() - 0.5) * 4;
                data.z = (Math.random() - 0.5) * 2;
            }

            dummy.position.set(data.x, data.y, data.z);
            dummy.rotation.set(data.rotationx, data.rotationy, 0);
            dummy.scale.setScalar(data.scale);
            dummy.updateMatrix();
            instances.setMatrixAt(i, dummy.matrix);
        }
        instances.instanceMatrix.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  if (container) {
    new e().load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/quarry_01_1k.hdr",
      (texture) => {
        texture.mapping = h.EquirectangularReflectionMapping;
        
        // Cena
        scene = new h.Scene();
        scene.environment = texture;
        scene.add(new h.AmbientLight(16777215, 3));
        scene.add(new h.HemisphereLight(16777215, 4473924, 3));

        // Câmera
        camera = new h.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 5);
        
        // Renderizador Otimizado
        renderer = new h.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        // Limita pixel ratio para evitar lentidão em telas 4k/Retina
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Controles
        controls = new i(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Carregar Modelo
        const loader = new p();
        loader.load(
            "https://happy358.github.io/misc/model/Heart/Heart.obj",
            (obj) => {
                let geometry = obj.children[0].geometry;
                geometry.computeVertexNormals();
                
                const material = new h.MeshPhongMaterial({
                    envMap: texture,
                    reflectivity: 0.9,
                    shininess: 90,
                    color: new h.Color("#ffffff")
                });

                const count = 35; // Quantidade equilibrada
                instances = new h.InstancedMesh(geometry, material, count);
                
                const dummy = new h.Object3D();
                const color = new h.Color();

                for (let i = 0; i < count; i++) {
                    const x = (Math.random() - 0.5) * 4;
                    const y = (Math.random() - 0.5) * 6;
                    const z = (Math.random() - 0.5) * 2;
                    const scale = 0.015 + Math.random() * 0.01;
                    
                    dummy.position.set(x, y, z);
                    dummy.updateMatrix();
                    instances.setMatrixAt(i, dummy.matrix);
                    instances.setColorAt(i, color.set(themeColors[i % themeColors.length]));
                    
                    heartsData.push({
                        x: x,
                        y: y,
                        z: z,
                        rotationx: Math.random() * Math.PI,
                        rotationy: Math.random() * Math.PI,
                        scale: scale,
                        speed: 0.2 + Math.random() * 0.5,
                        rotSpeed: 0.5 + Math.random()
                    });
                }
                
                scene.add(instances);
                animate();
            }
        );

        window.addEventListener("resize", onWindowResize);
      }
    );
  }
}