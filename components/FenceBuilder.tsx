import React, { useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { FenceConfig, FenceShape } from "../types";

const PANEL_LENGTH = 2.5;

// --- 1. New Component: Standalone Start Post ---
// Generates a procedural post to fill the gap at the start.
// If you have a specific 'post.glb', you can replace the <mesh> with <useGLTF> here.
const StandAlonePost = ({ height, color }: { height: number; color: string }) => {
  // Dimensions for a standard fence post (approx 8cm x 8cm)
  const width = 0.08;
  const h = height / 1000; // Convert mm to meters

  return (
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, h, width]} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
};

// --- Gate Dimension Label Component ---
const GateDimensionLabel = ({ width, height }: { width: number, height: number }) => (
  <Html position={[0, 2.2, 0]} center zIndexRange={[100, 0]}>
    <div className="px-2 py-1 bg-slate-900/90 text-white text-[10px] font-mono rounded border border-white/20 shadow-lg whitespace-nowrap pointer-events-none">
      {height} (h) x {width} (w)
    </div>
    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900/90 mx-auto"></div>
  </Html>
);

function Model({ path, color, segmentIndex, targetWidth, isHighlighted, isGate, gateDims }: any) {
  const { scene } = useGLTF(path);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const physicalWidth = box.max.x - box.min.x;
    const scaleFactor = targetWidth / (physicalWidth || 1);

    clone.scale.set(scaleFactor, 1, 1);
    clone.position.setX(-box.min.x * scaleFactor);

    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;

        m.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.6,
          metalness: 0.2,
          emissive: isHighlighted ? new THREE.Color("#4ade80") : new THREE.Color(0, 0, 0),
          emissiveIntensity: isHighlighted ? 0.4 : 0
        });
        m.userData.segmentIndex = segmentIndex;
      }
    });

    return clone;
  }, [scene, color, segmentIndex, targetWidth, isHighlighted]);

  return (
    <group>
      <primitive object={model} />
      {isGate && gateDims && (
        <GateDimensionLabel width={gateDims.width} height={gateDims.height} />
      )}
    </group>
  );
}

export default function FenceBuilder({ config, hoveredIndex }: { config: FenceConfig, hoveredIndex: number | null }) {
  const layout = useMemo(() => {
    const parts: any[] = [];
    const sides: number[] = [];

    if (config.shape === FenceShape.STRAIGHT) {
      sides.push(config.width);
    }
    else if (config.shape === FenceShape.L_SHAPE) {
      sides.push(config.width, config.depth);
    }
    else if (config.shape === FenceShape.U_SHAPE) {
      sides.push(config.width, config.depth, config.width);
    }
    else if (config.shape === FenceShape.RECTANGLE) {
      sides.push(config.width, config.depth, config.width, config.depth);
    }

    let currentPos = new THREE.Vector3(0, 0, 0);
    let currentDir = new THREE.Vector3(1, 0, 0);
    let globalIndex = 0;

    sides.forEach((sideTotalLength) => {
      let currentSideFilled = 0;

      while (currentSideFilled < sideTotalLength - 0.05) {
        const gate = config.gates.find((g) => g.segmentIndex === globalIndex);
        let itemWidth = PANEL_LENGTH;
        let modelPath = config.height === 1800 ? "/models/fence_panel_full_1800.glb" : "/models/fence_panel_1200.glb";
        let isGate = false;
        let gateDims = null;

        if (gate) {
          isGate = true;
          itemWidth = gate.type / 1000;
          modelPath = `/models/gate_${gate.type}.glb`;
          gateDims = { width: gate.type, height: config.height };
        } else {
          const remaining = sideTotalLength - currentSideFilled;
          if (remaining < PANEL_LENGTH) itemWidth = remaining;
        }

        parts.push({
          pos: [currentPos.x, currentPos.y, currentPos.z],
          rot: Math.atan2(currentDir.z, currentDir.x),
          index: globalIndex,
          modelPath,
          targetWidth: itemWidth,
          isGate,
          gateDims
        });

        currentPos.add(currentDir.clone().multiplyScalar(itemWidth));
        currentSideFilled += itemWidth;
        globalIndex++;
      }

      currentDir.set(-currentDir.z, 0, currentDir.x);
    });

    return parts;
  }, [config]);

  // Logic: Closed loops (Rectangle) naturally close themselves with the last post.
  // Open shapes (Straight, L, U) need a manual starting post at (0,0,0).
  const showStartPost = config.shape !== FenceShape.RECTANGLE;

  return (
    <group>
      {/* --- 2. Render the Start Post if needed --- */}
      {showStartPost && (
        <StandAlonePost height={config.height} color={config.panelColor} />
      )}

      {layout.map((part) => (
        <group key={part.index} position={part.pos} rotation={[0, -part.rot, 0]}>
          <Model
            path={part.modelPath}
            color={config.panelColor}
            segmentIndex={part.index}
            targetWidth={part.targetWidth}
            isHighlighted={hoveredIndex === part.index}
            isGate={part.isGate}
            gateDims={part.gateDims}
          />
        </group>
      ))}
    </group>
  );
}