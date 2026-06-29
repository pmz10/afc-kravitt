"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
    Bounds,
    ContactShadows,
    Environment,
    Html,
    OrbitControls,
    useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/uniforme.glb?v=6";

function CargandoUniforme() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-orange-400" />

                <span className="whitespace-nowrap text-[11px] text-neutral-400">
                    Cargando uniforme
                </span>
            </div>
        </Html>
    );
}

function ModeloUniforme() {
    const { scene } = useGLTF(MODEL_URL);

    const modelo = useMemo(() => {
        const copia = scene.clone(true);

        copia.traverse((objeto) => {
            if (!(objeto instanceof THREE.Mesh)) {
                return;
            }

            objeto.castShadow = true;
            objeto.receiveShadow = true;

            const materialesOriginales = Array.isArray(objeto.material)
                ? objeto.material
                : [objeto.material];

            const materialesClonados = materialesOriginales.map((material) => {
                const materialClonado = material.clone();

                /*
                 * Permite observar correctamente el interior del cuello,
                 * mangas y otras partes delgadas del uniforme.
                 */
                materialClonado.side = THREE.DoubleSide;

                const materialConTextura = materialClonado as THREE.Material & {
                    map?: THREE.Texture | null;
                    normalMap?: THREE.Texture | null;
                    roughnessMap?: THREE.Texture | null;
                    metalnessMap?: THREE.Texture | null;
                };

                if (materialConTextura.map) {
                    materialConTextura.map.colorSpace = THREE.SRGBColorSpace;
                    materialConTextura.map.anisotropy = 8;
                    materialConTextura.map.needsUpdate = true;
                }

                if (materialConTextura.normalMap) {
                    materialConTextura.normalMap.anisotropy = 8;
                    materialConTextura.normalMap.needsUpdate = true;
                }

                if (materialConTextura.roughnessMap) {
                    materialConTextura.roughnessMap.anisotropy = 8;
                    materialConTextura.roughnessMap.needsUpdate = true;
                }

                if (materialConTextura.metalnessMap) {
                    materialConTextura.metalnessMap.anisotropy = 8;
                    materialConTextura.metalnessMap.needsUpdate = true;
                }

                materialClonado.needsUpdate = true;

                return materialClonado;
            });

            objeto.material = Array.isArray(objeto.material)
                ? materialesClonados
                : materialesClonados[0];
        });

        return copia;
    }, [scene]);

    return (
        <primitive
            object={modelo}
            rotation={[0, -0.2, 0]}
        />
    );
}

useGLTF.preload(MODEL_URL);

export default function UniformeCard() {
    return (
        <article className="h-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
            <div
                className="relative h-52 w-full cursor-grab overflow-hidden bg-neutral-950/70 active:cursor-grabbing"
                aria-label="Modelo tridimensional del uniforme"
            >
                <Canvas
                    shadows
                    dpr={[1, 1.5]}
                    camera={{
                        position: [0, 0.1, 4],
                        fov: 32,
                        near: 0.1,
                        far: 100,
                    }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: "high-performance",
                    }}
                    onCreated={({ gl }) => {
                        gl.outputColorSpace = THREE.SRGBColorSpace;
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.15;
                    }}
                >
                    <ambientLight intensity={0.85} />

                    <directionalLight
                        castShadow
                        position={[4, 5, 5]}
                        intensity={2.4}
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                    />

                    <directionalLight
                        position={[-4, 2, 3]}
                        intensity={1.25}
                    />

                    <directionalLight
                        position={[0, 1, -4]}
                        intensity={0.8}
                    />

                    <Suspense fallback={<CargandoUniforme />}>
                        <Bounds
                            fit
                            clip
                            observe
                            margin={1.18}
                        >
                            <ModeloUniforme />
                        </Bounds>

                        <Environment preset="studio" />

                        <ContactShadows
                            position={[0, -1.55, 0]}
                            opacity={0.45}
                            scale={5}
                            blur={2.5}
                            far={4}
                        />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        enablePan={false}
                        enableZoom
                        enableDamping
                        dampingFactor={0.075}
                        rotateSpeed={0.65}
                        zoomSpeed={0.7}
                        minDistance={2}
                        maxDistance={6}
                        minPolarAngle={Math.PI / 3.2}
                        maxPolarAngle={(Math.PI * 2.15) / 3}
                        autoRotate
                        autoRotateSpeed={0.7}
                    />
                </Canvas>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-neutral-950/60 to-transparent" />

                <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] text-neutral-400 backdrop-blur-sm">
                    Arrastra para girar
                </div>
            </div>

            <div className="border-t border-neutral-800 px-4 py-3 text-center">
                <p className="text-sm font-medium text-neutral-100">
                    Uniforme
                </p>
            </div>
        </article>
    );
}