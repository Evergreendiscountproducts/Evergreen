import React, { useRef, useState, useMemo, useEffect } from "react";
import { Environment, ContactShadows, OrbitControls, Html, Sky, Line, useGLTF } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import FenceBuilder from "./FenceBuilder";
import { FenceConfig, FenceShape } from "../types";

// 🌿 Optimized Instanced Grass (SAFE + FAST)
const GrassField = ({ config }: { config: FenceConfig }) => {
  const { scene } = useGLTF("/models/grass.glb");
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const STEP = 0.6;
  const BORDER = 1;

  // Safely extract first mesh
  const grassMesh = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    scene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh && !mesh) mesh = obj as THREE.Mesh;
    });
    return mesh;
  }, [scene]);

  const count = useMemo(() => {
    const width = config.width + BORDER * 2;
    const depth =
      config.shape === FenceShape.STRAIGHT
        ? 2 + BORDER * 2
        : config.depth + BORDER * 2;

    return Math.ceil(width / STEP) * Math.ceil(depth / STEP);
  }, [config]);

  useEffect(() => {
    if (!meshRef.current || !grassMesh) return;

    const dummy = new THREE.Object3D();

    const width = config.width + BORDER * 2;
    const depth =
      config.shape === FenceShape.STRAIGHT
        ? 2 + BORDER * 2
        : config.depth + BORDER * 2;

    const xStart = -width / 2;
    const zStart = -depth / 2;

    const tilesX = Math.ceil(width / STEP);
    const tilesZ = Math.ceil(depth / STEP);

    let i = 0;

    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        dummy.position.set(xStart + x * STEP, 0, zStart + z * STEP);
        dummy.rotation.y = (Math.random() - 0.5) * 0.25;
        const s = 0.9 + Math.random() * 0.1;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i++, dummy.matrix);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [config, grassMesh]);

  if (!grassMesh) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[grassMesh.geometry, grassMesh.material, count]}
      castShadow={false}
      receiveShadow={false}
    />
  );
};

useGLTF.preload("/models/grass.glb");


// --- Helper for Dragging Gates ---
const getSegmentIndex = (obj: THREE.Object3D | null): number | undefined => {
  if (!obj) return undefined;
  if ((obj as any).userData?.segmentIndex !== undefined) return (obj as any).userData.segmentIndex;
  return getSegmentIndex(obj.parent);
};


// --- Dimension Marker ---
const DimensionMarker = ({ start, end, label, offset = new THREE.Vector3(0, 0, 0), color = "#475569" }: any) => {
  const s = new THREE.Vector3(...start).add(offset);
  const e = new THREE.Vector3(...end).add(offset);
  const mid = s.clone().lerp(e, 0.5);

  return (
    <group>
      <Line points={[s, e]} color={color} lineWidth={1} transparent opacity={0.8} />
      <Html position={[mid.x, mid.y, mid.z]} center>
        <div className="bg-white/95 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 rounded shadow whitespace-nowrap select-none pointer-events-none">
          {label}
        </div>
      </Html>
    </group>
  );
};


const Scene3D: React.FC<{ config: FenceConfig; setConfig: any }> = ({ config, setConfig }) => {
  const [draggedGateId, setDraggedGateId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const centeringOffset = useMemo(() => {
    const xOffset = -config.width / 2;
    const zOffset = config.shape === FenceShape.STRAIGHT ? 0 : -config.depth / 2;
    return [xOffset, 0, zOffset] as [number, number, number];
  }, [config.width, config.depth, config.shape]);

  const floorSize = useMemo(() => Math.max(config.width, config.depth, 20) * 2.5, [config.width, config.depth]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    const segmentIndex = getSegmentIndex(e.object);
    const gate = config.gates.find(g => g.segmentIndex === segmentIndex);
    if (gate) {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDraggedGateId(gate.id);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggedGateId) return;
    e.stopPropagation();
    const now = Date.now();
    if (now - lastUpdateRef.current < 60) return;
    const hit = e.intersections.find(i => getSegmentIndex(i.object) !== undefined);
    if (hit) {
      const newIndex = getSegmentIndex(hit.object) ?? null;
      if (newIndex !== null && newIndex !== hoveredIndex) {
        lastUpdateRef.current = now;
        setHoveredIndex(newIndex);
        setConfig((prev: FenceConfig) => ({
          ...prev,
          gates: prev.gates.map(g => g.id === draggedGateId ? { ...g, segmentIndex: newIndex } : g)
        }));
      }
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (draggedGateId) {
      e.stopPropagation();
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      setDraggedGateId(null);
      setHoveredIndex(null);
    }
  };

  return (
    <>
      <OrbitControls makeDefault enableRotate={!config.rotationLock} enabled={!draggedGateId} maxPolarAngle={Math.PI / 2.1} minDistance={2} maxDistance={Math.max(30, floorSize / 2)} target={[0, 0, 0]} />
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <Environment preset="city" />

      <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        <group position={centeringOffset}>
          <FenceBuilder config={config} hoveredIndex={hoveredIndex} />
          <DimensionMarker start={[-0.2, 0, 0]} end={[-0.2, config.height / 1000, 0]} label={`${config.height / 1000}m`} />
          <DimensionMarker start={[0, 0, 0.3]} end={[config.width, 0, 0.3]} label={`${config.width}m`} />
          {config.shape !== FenceShape.STRAIGHT && (
            <DimensionMarker start={[config.width + 0.3, 0, 0]} end={[config.width + 0.3, 0, config.depth]} label={`${config.depth}m`} />
          )}
        </group>

        {/* GREEN GROUND BASE */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[floorSize, floorSize]} />
          <meshStandardMaterial color="#3b5e3a" roughness={1} metalness={0} />
        </mesh>

        {config.grassEnabled && <GrassField config={config} />}

        <ContactShadows position={[0, 0.01, 0]} opacity={0.25} scale={floorSize / 2} blur={2} far={1} />
      </group>
    </>
  );
};

export default Scene3D;