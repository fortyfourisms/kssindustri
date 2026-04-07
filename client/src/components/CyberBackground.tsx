import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const CyberBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!mountRef.current) return;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 40;
        camera.position.y = 12;
        camera.lookAt(0, 5, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // --- Create Binary Texture Atlas ---
        const createBinaryTexture = (text: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                ctx.fillRect(0, 0, 64, 64);
                ctx.font = 'bold 48px monospace';
                ctx.fillStyle = '#00aaff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 32, 32);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const tex0 = createBinaryTexture('0');
        const tex1 = createBinaryTexture('1');

        // --- Binary Drifting Bits ---
        const binaryCount = 40;
        const binaryGroup = new THREE.Group();
        const binaryBits: { mesh: THREE.Mesh; speed: number; rotSpeed: number; initialOpacity: number }[] = [];

        for (let i = 0; i < binaryCount; i++) {
            const geometry = new THREE.PlaneGeometry(1.5, 1.5);
            const opacity = 0.3 + Math.random() * 0.4;
            const material = new THREE.MeshBasicMaterial({
                map: Math.random() > 0.5 ? tex0 : tex1,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 50 - 10,
                (Math.random() - 0.5) * 60 - 20
            );

            binaryGroup.add(mesh);
            binaryBits.push({
                mesh,
                speed: 0.02 + Math.random() * 0.05,
                rotSpeed: (Math.random() - 0.5) * 0.01,
                initialOpacity: opacity
            });
        }
        scene.add(binaryGroup);

        // --- Curved Digital Horizon (Light Grid) ---
        const gridSize = 140;
        const gridDivisions = 40;
        const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize * 0.6, gridDivisions, gridDivisions);

        const vertices = gridGeometry.attributes.position.array as Float32Array;
        const updateGridCurve = (progress: number) => {
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                const xDist = Math.abs(x);
                const yDist = y + (gridSize * 0.3);
                // Base curve
                const baseZ = -(Math.pow(xDist, 1.8) * 0.05) - (Math.pow(yDist, 1.5) * 0.05);
                // "Breaking" effect
                const breakEffect = Math.sin(x * 0.5 + y * 0.5) * progress * 5;
                vertices[i + 2] = baseZ + breakEffect;
            }
            gridGeometry.attributes.position.needsUpdate = true;
        };
        updateGridCurve(0);

        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ccff,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        });

        const horizonMesh = new THREE.Mesh(gridGeometry, gridMaterial);
        horizonMesh.rotation.x = -Math.PI / 2.2;
        horizonMesh.position.y = -8;
        horizonMesh.scale.x = 2.0; // Melebarkan objek secara horizontal
        scene.add(horizonMesh);

        // --- Holographic Icons (Cyber Shield inside Grid) ---
        const createShieldShape = () => {
            const points = [];
            points.push(new THREE.Vector3(0, 1.2, 0));
            points.push(new THREE.Vector3(1, 0.8, 0));
            points.push(new THREE.Vector3(0.8, -0.8, 0));
            points.push(new THREE.Vector3(0, -1.2, 0));
            points.push(new THREE.Vector3(-0.8, -0.8, 0));
            points.push(new THREE.Vector3(-1, 0.8, 0));
            points.push(new THREE.Vector3(0, 1.2, 0));
            return new THREE.BufferGeometry().setFromPoints(points);
        };

        const iconMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const iconGroup = new THREE.Group();
        const icons: { mesh: THREE.Line; speed: number; floatOffset: number; initialOpacity: number }[] = [];
        const shieldGeo = createShieldShape();

        for (let i = 0; i < 8; i++) {
            const icon = new THREE.Line(shieldGeo, iconMaterial.clone());
            icon.position.set(
                (Math.random() - 0.5) * 110,
                Math.random() * 20 - 2,
                (Math.random() - 0.5) * 50 - 20
            );
            icon.scale.setScalar(3.0 + Math.random() * 2.5);
            iconGroup.add(icon);
            icons.push({
                mesh: icon,
                speed: 0.005 + Math.random() * 0.01,
                floatOffset: Math.random() * Math.PI * 2,
                initialOpacity: 0.4 + Math.random() * 0.2
            });
        }
        scene.add(iconGroup);


        // --- Particle System (Morphing) ---
        const particleCount = 1200;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        const heroPositions = new Float32Array(particleCount * 3);
        const fieldPositions = new Float32Array(particleCount * 3);
        const particleSpeeds = new Float32Array(particleCount);

        // Initialize state 0 and 1
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // -- State 0: Hero Positions --
            const rx = (Math.random() - 0.5) * gridSize * 2.0; // Kalikan dengan scale.x
            const ry = (Math.random() - 0.5) * (gridSize * 0.6);
            const xDist = Math.abs(rx / 2.0); // Normalisasi kembali untuk kalkulasi kurva Z agar tidak tembus pandang
            const yDist = ry + (gridSize * 0.3);
            const rz = -(Math.pow(xDist, 1.8) * 0.05) - (Math.pow(yDist, 1.5) * 0.05);
            const angle = -Math.PI / 2.2;
            heroPositions[i3] = rx;
            heroPositions[i3 + 1] = ry * Math.cos(angle) - rz * Math.sin(angle) - 8;
            heroPositions[i3 + 2] = ry * Math.sin(angle) + rz * Math.cos(angle) - 8;

            positions[i3] = heroPositions[i3];
            positions[i3 + 1] = heroPositions[i3 + 1];
            positions[i3 + 2] = heroPositions[i3 + 2];

            // -- State 1: Field Positions --
            const radius = 20 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            fieldPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            fieldPositions[i3 + 1] = (Math.random() - 0.5) * 60;
            fieldPositions[i3 + 2] = radius * Math.cos(phi) - 30;

            particleSpeeds[i] = 0.5 + Math.random() * 0.5;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // --- Create Radial Glow Texture ---
        const createGlowTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.2, 'rgba(0, 170, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 64, 64);
            }
            return new THREE.CanvasTexture(canvas);
        };
        const glowTexture = createGlowTexture();

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00ccff,
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            map: glowTexture,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // --- Wave Bubble Generation ---
        const bubbleCount = 12;
        const bubbleCenters: THREE.Vector3[] = [];
        for (let i = 0; i < bubbleCount; i++) {
            bubbleCenters.push(new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40 + 10,
                (Math.random() - 0.5) * 40 - 20
            ));
        }

        const bubbleBasePositions = new Float32Array(particleCount * 3);
        const bubbleMeta = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const center = bubbleCenters[i % bubbleCount];

            // Cluster particles around center in a soft oval
            const radius = 3 + Math.random() * 8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const rx = radius * Math.sin(phi) * Math.cos(theta) * 1.6;
            const ry = radius * Math.sin(phi) * Math.sin(theta);
            const rz = radius * Math.cos(phi) * 0.7;

            bubbleBasePositions[i3] = center.x + rx;
            bubbleBasePositions[i3 + 1] = center.y + ry;
            bubbleBasePositions[i3 + 2] = center.z + rz;

            // Random motion meta for each particle
            bubbleMeta[i3] = 0.4 + Math.random() * 0.8; // freq
            bubbleMeta[i3 + 1] = Math.random() * Math.PI * 2; // phase
            bubbleMeta[i3 + 2] = 0.8 + Math.random() * 2.0; // amp
        }

        // --- GSAP Proxy Object for Animation Properties ---
        const animProps = {
            morphHeroToField: 0,
            morphFieldToBubbles: 0,
            horizonOpacity: 0.12,
            horizonY: -8,
            horizonDistortion: 0,
            binaryOpacityMult: 1,
            iconOpacityMult: 1,
            cameraY: 12,
            cameraLookY: 5,
        };

        // --- IDLE ANIMATION LOOP ---
        let frame = 0;
        const render = () => {
            frame += 0.01;

            binaryBits.forEach(bit => {
                bit.mesh.position.y += bit.speed;
                bit.mesh.rotation.y += bit.rotSpeed;
                if (bit.mesh.position.y > 40) bit.mesh.position.y = -10;
                (bit.mesh.material as THREE.MeshBasicMaterial).opacity = bit.initialOpacity * animProps.binaryOpacityMult;
            });

            icons.forEach((icon) => {
                icon.mesh.position.y += Math.sin(frame + icon.floatOffset) * 0.01;
                icon.mesh.rotation.y += 0.005;
                (icon.mesh.material as THREE.LineBasicMaterial).opacity = icon.initialOpacity * animProps.iconOpacityMult;
            });

            gridMaterial.opacity = animProps.horizonOpacity;
            horizonMesh.position.y = animProps.horizonY;
            updateGridCurve(animProps.horizonDistortion);

            const posAttr = particlesGeometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                const noise = Math.sin(frame * 0.5 * particleSpeeds[i] + i) * 0.3;

                let bx = heroPositions[i3];
                let by = heroPositions[i3 + 1];
                let bz = heroPositions[i3 + 2];

                if (animProps.morphHeroToField > 0) {
                    const t = animProps.morphHeroToField;
                    bx += (fieldPositions[i3] - bx) * t;
                    by += (fieldPositions[i3 + 1] - by) * t;
                    bz += (fieldPositions[i3 + 2] - bz) * t;
                }

                if (animProps.morphFieldToBubbles > 0) {
                    const t = animProps.morphFieldToBubbles;

                    // Add wave motion to bubble target
                    const freq = bubbleMeta[i3];
                    const phase = bubbleMeta[i3 + 1];
                    const amp = bubbleMeta[i3 + 2];

                    const waveX = Math.sin(frame * freq * 0.5 + phase) * amp;
                    const waveY = Math.cos(frame * freq + phase) * amp * 1.5;
                    const waveZ = Math.sin(frame * freq * 0.3 + phase) * amp;

                    const tx = bubbleBasePositions[i3] + waveX;
                    const ty = bubbleBasePositions[i3 + 1] + waveY;
                    const tz = bubbleBasePositions[i3 + 2] + waveZ;

                    bx += (tx - bx) * t;
                    by += (ty - by) * t;
                    bz += (tz - bz) * t;
                } else {
                    // Normal hero/field floating
                    bx += noise;
                    by += Math.cos(frame * 0.3 * particleSpeeds[i] + i) * 0.3;
                    bz += Math.sin(frame * 0.4 * particleSpeeds[i] + i) * 0.3;
                }

                posArray[i3] = bx;
                posArray[i3 + 1] = by;
                posArray[i3 + 2] = bz;
            }
            posAttr.needsUpdate = true;

            camera.position.y = animProps.cameraY;
            camera.lookAt(0, animProps.cameraLookY, 0);

            renderer.render(scene, camera);
        };
        gsap.ticker.add(render);

        // --- GSAP SCROLLTRIGGERS ---
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "100vh top",
            scrub: 1,
            animation: gsap.timeline()
                .to(animProps, {
                    horizonOpacity: 0,
                    horizonY: -18,
                    horizonDistortion: 1,
                    binaryOpacityMult: 0,
                    iconOpacityMult: 0,
                    morphHeroToField: 1,
                    cameraY: 27,
                    cameraLookY: 0,
                    ease: "power2.inOut"
                })
                .to(particlesMaterial, {
                    size: 1.0,
                    opacity: 0.8,
                    ease: "power1.inOut"
                }, "<")
        });

        ScrollTrigger.create({
            trigger: document.body,
            start: "100vh top",
            end: "200vh top",
            scrub: 1,
            animation: gsap.timeline()
                .to(animProps, {
                    morphFieldToBubbles: 1,
                    cameraY: 15,
                    cameraLookY: 5,
                    ease: "power2.inOut"
                })
                .to(particlesMaterial, {
                    size: 0.6,
                    opacity: 1.0,
                    ease: "power1.inOut"
                }, "<")
                .to(particlesMaterial.color, {
                    r: 0,
                    g: 0.8,
                    b: 1,
                    ease: "power1.inOut"
                }, "<")
        });

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            gsap.ticker.remove(render);
            ScrollTrigger.getAll().forEach(t => t.kill());

            gridGeometry.dispose();
            gridMaterial.dispose();
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            glowTexture.dispose();
            tex0.dispose();
            tex1.dispose();
            shieldGeo.dispose();
            iconMaterial.dispose();
            renderer.dispose();

            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, { scope: mountRef, dependencies: [] });

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 50%, #e0f2fe 100%)',
            }}
        />
    );
};
