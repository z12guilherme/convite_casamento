import * as h from "three";
import { OrbitControls as i } from "three/addons/controls/OrbitControls.js";
import { OBJLoader as p } from "three/addons/loaders/OBJLoader.js";
import { RGBELoader as e } from "three/addons/loaders/RGBELoader.js";
import * as g from "three/addons/utils/BufferGeometryUtils.js";

// Configuração de Cores do Tema (Verdes e Dourado)
const themeColors = ["#40B5A0", "#2D8B7A", "#D4AF37", "#A0D8C9"];

{
  let t, d, n, o, l, c, m, r, u, w;
  const container = document.getElementById('hero-canvas-container');

  function a() {
    if (!container) return;
    t.aspect = container.clientWidth / container.clientHeight;
    t.updateProjectionMatrix();
    n.setSize(container.clientWidth, container.clientHeight);
  }

  function s() {
    requestAnimationFrame(s);
    // Otimização: Atualizar física no loop de renderização para suavidade
    if (m && m.step) m.step();
    o.update();
    n.render(d, t);
  }

  if (container) {
    new e().load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/quarry_01_1k.hdr",
      (e) => {
        e.mapping = h.EquirectangularReflectionMapping;
        c = e;
        (async function () {
          m = await AmmoPhysics();
          r = new h.Vector3();
          
          // Camera setup
          t = new h.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1e3
          );
          t.position.set(0, 0, 2);
          t.lookAt(0, 0, 0);

          // Scene setup
          d = new h.Scene();
          // Fundo transparente para ver o gradiente do site
          // d.background = new h.Color(2236962); 
          d.environment = c;
          
          d.add(new h.AmbientLight(16777215, 5));
          d.add(new h.HemisphereLight(16777215, 4473924, 5));

          // Renderer setup
          n = new h.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true // Importante para transparência
          });
          n.setPixelRatio(window.devicePixelRatio);
          n.setSize(container.clientWidth, container.clientHeight);
          container.appendChild(n.domElement);

          // Controls
          o = new i(t, n.domElement);
          o.target.y = 0;
          o.autoRotate = false;
          o.enableDamping = true;
          o.enablePan = false;
          o.enableZoom = false; // Desabilita zoom para não atrapalhar scroll
          o.minDistance = 1;
          o.minPolarAngle = 0;
          o.maxPolarAngle = Math.PI / 2;
          o.update();

          (function () {
            const r = new h.MeshPhongMaterial({
              envMap: c,
              reflectivity: 1,
              emissive: 0,
              specular: 16777215,
              shininess: 100
            });
            const i = new h.Matrix4();
            const a = new h.Color();
            const s = themeColors; // Usando cores do tema
            const e = new p();
            
            e.load(
              "https://happy358.github.io/misc/model/Heart/Heart.obj",
              function (e) {
                let t = e.children[0].geometry;
                t = t.index ? t : g.mergeVertices(t);
                t.computeVertexNormals();
                t.computeBoundingBox();
                t.computeBoundingSphere();
                
                // Material invisível para o colisor grande
                const matInvisible = new h.MeshLambertMaterial({
                  color: new h.Color("pink"),
                  side: h.DoubleSide,
                  wireframe: true,
                  visible: false
                });

                // Coração Grande (Colisor invisível)
                l = t.clone();
                l.scale(0.1, 0.1, 0.11);
                t.center();
                t.computeVertexNormals();
                t.computeBoundingBox();
                t.computeBoundingSphere();
                l.name = "terrain";
                
                w = new h.Mesh(l, matInvisible);
                w.visible = false;
                w.userData.physics = { mass: 0 };
                d.add(w);
                m.addMesh(w, 0);

                // Corações Pequenos (InstancedMesh)
                l = t.clone();
                l.scale(0.015, 0.015, 0.015);
                l.computeVertexNormals();
                l.computeBoundingBox();
                l.computeBoundingSphere();
                
                u = new h.InstancedMesh(l, r, 40); // Reduzi para 40 para melhorar performance
                u.instanceMatrix.setUsage(h.DynamicDrawUsage);
                u.userData.physics = { mass: 1 };

                for (let e = 0; e < u.count; e++) {
                  i.setPosition(
                    h.MathUtils.randFloat(-0.7, 0.7),
                    h.MathUtils.randFloat(-0.4, 0.2),
                    h.MathUtils.randFloat(-0.2, 0.2)
                  );
                  u.setMatrixAt(e, i);
                  u.setColorAt(e, a.set(s[e % s.length]));
                }
                
                d.add(u);
                m.addMesh(u, 1);
              }
            );
          })();
          
          s();
          window.addEventListener("resize", a);
        })();
      }
    );
  }
}

async function AmmoPhysics() {
  if ("Ammo" in window === false) {
    console.error("AmmoPhysics: Couldn't find Ammo.js");
    return;
  }
  
  const g = await Ammo();
  const o = new g.btDefaultCollisionConfiguration();
  const r = new g.btCollisionDispatcher(o);
  const i = new g.btDbvtBroadphase();
  const a = new g.btSequentialImpulseConstraintSolver();
  const v = new g.btDiscreteDynamicsWorld(r, i, a, o);
  
  v.setGravity(new g.btVector3(0, -9.8, 0));
  const M = new g.btTransform();
  let x = new g.btVector3(0, 0, 0);
  const V = [];
  const B = new WeakMap();

  // Objetos reutilizáveis para evitar Garbage Collection (causa de travamentos)
  const _transform = new g.btTransform();
  const _vec3 = new h.Vector3();
  const _quat = new h.Quaternion();
  const _scale = new h.Vector3(1, 1, 1);
  const _mat4 = new h.Matrix4();
  const _ammoVec = new g.btVector3(0, 0, 0);
  const _resetPos = new g.btVector3();

  function n(e, t = 0) {
    let n, o, r, i;
    
    // Geometria simplificada
    i = (function (e) {
      const t = e.parameters;
      let n;
      if (e.name === "terrain") {
         // Lógica específica para malha complexa (coração grande)
         // Simplificando para ConvexHull para performance ou usando BvhTriangleMeshShape se necessário
         // O código original usava btBvhTriangleMeshShape para "terrain"
         const a = e.attributes.position.array;
         const s = e.index.array;
         const d = new Ammo.btTriangleMesh();
         for (let i = 0; i < s.length; i += 3) {
            const v1 = new Ammo.btVector3(a[3 * s[i]], a[3 * s[i] + 1], a[3 * s[i] + 2]);
            const v2 = new Ammo.btVector3(a[3 * s[i + 1]], a[3 * s[i + 1] + 1], a[3 * s[i + 1] + 2]);
            const v3 = new Ammo.btVector3(a[3 * s[i + 2]], a[3 * s[i + 2] + 1], a[3 * s[i + 2] + 2]);
            d.addTriangle(v1, v2, v3);
         }
         n = new Ammo.btBvhTriangleMeshShape(d, true, true);
      } else {
        // Convex Hull para os corações pequenos
        const u = e.getAttribute("position");
        n = new Ammo.btConvexHullShape();
        for (let i = 0; i < u.count; i++) {
          const v = new Ammo.btVector3(u.getX(i), u.getY(i), u.getZ(i));
          n.addPoint(v, true);
        }
      }
      return n.setMargin(0.05), n;
    })(e.geometry);

    if (e.isInstancedMesh) {
      const l = e.instanceMatrix.array;
      const c = [];
      for (let k = 0; k < e.count; k++) {
        const idx = 16 * k;
        const u = new g.btTransform();
        u.setFromOpenGLMatrix(l.slice(idx, 16 + idx));
        const motionState = new g.btDefaultMotionState(u);
        const localInertia = new g.btVector3(0, 0, 0);
        i.calculateLocalInertia(t, localInertia);
        const rbInfo = new g.btRigidBodyConstructionInfo(t, motionState, i, localInertia);
        const body = new g.btRigidBody(rbInfo);
        body.setRestitution(0.5); // Um pouco de quique
        v.addRigidBody(body);
        c.push(body);
      }
      V.push(e);
      B.set(e, c);
    } else if (e.isMesh) {
      const pos = e.position;
      const quat = e.quaternion;
      const transform = new g.btTransform();
      transform.setIdentity();
      transform.setOrigin(new g.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(new g.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      const motionState = new g.btDefaultMotionState(transform);
      const localInertia = new g.btVector3(0, 0, 0);
      i.calculateLocalInertia(t, localInertia);
      const rbInfo = new g.btRigidBodyConstructionInfo(t, motionState, i, localInertia);
      const body = new g.btRigidBody(rbInfo);
      body.setRestitution(0);
      v.addRigidBody(body);
      if (t > 0) {
        V.push(e);
        B.set(e, body);
      }
    }
  }

  let lastTime = performance.now();

  // Função de passo de física otimizada
  function step() {
    const time = performance.now();
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    // Limita o delta para evitar saltos grandes se a aba ficar inativa
    if (delta > 0.1) return;

    v.stepSimulation(delta, 10);

    for (let i = 0; i < V.length; i++) {
      const mesh = V[i];
      if (mesh.isInstancedMesh) {
        const array = mesh.instanceMatrix.array;
        const bodies = B.get(mesh);
        
        for (let j = 0; j < bodies.length; j++) {
          const body = bodies[j];
          const ms = body.getMotionState();
          if (ms) {
             ms.getWorldTransform(_transform);
             const origin = _transform.getOrigin();
             const rotation = _transform.getRotation();
             
             if (origin.y() < -3) {
               // Reset otimizado
               _ammoVec.setValue(0, 0, 0);
               _transform.setIdentity();
               _resetPos.setValue((Math.random()-0.5)*1.5, 2 + Math.random(), (Math.random()-0.5)*0.5);
               _transform.setOrigin(_resetPos);
               
               body.setWorldTransform(_transform);
               body.setLinearVelocity(_ammoVec);
               body.setAngularVelocity(_ammoVec);
               body.clearForces();
             } else {
               // Atualiza matriz reutilizando objetos (Zero GC)
               _vec3.set(origin.x(), origin.y(), origin.z());
               _quat.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
               _mat4.compose(_vec3, _quat, _scale);
               
               const elements = _mat4.elements;
               for(let k=0; k<16; k++) {
                   array[16*j + k] = elements[k];
               }
             }
          }
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  return {
    addMesh: n,
    step: step
  };
}