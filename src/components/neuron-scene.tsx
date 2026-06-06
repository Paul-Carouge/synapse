'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { computeGraphLayout, GraphNode, GraphEdge, hashString } from '@/lib/graph-layout';
import type { MemoryEntry } from '@/lib/memory-data';

// ---------------------------------------------------------------------------
// GlowNode — each brain node rendered as a luminous point (PointsMaterial)
// ---------------------------------------------------------------------------
function GlowNode({
  node,
  isSelected,
  isHovered,
  isDimmed,
  seed,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  node: GraphNode;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  seed: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const color = useMemo(() => new THREE.Color(node.color), [node.color]);
  const baseSize = node.size || 0.3;

  // Déterministe : seeds basés sur l'ID du nœud
  const speed = useMemo(() => 1.5 + ((seed * 13) % 100) * 0.01, [seed]);
  const floatIntensity = useMemo(() => 0.3 + ((seed * 7) % 100) * 0.002, [seed]);

  // Selection / hover scaling
  const sizeScale = isSelected ? 2.2 : isHovered ? 1.6 : 1.0;
  const starSize = baseSize * sizeScale;
  const starOpacity = isDimmed && !isSelected ? 0.2 : isSelected ? 1.0 : 0.9;
  const haloOpacity = isDimmed && !isSelected ? 0.04 : isSelected ? 0.3 : 0.12;

  // Single-point buffer reused across star + halo
  const pointPos = useMemo(() => new Float32Array([0, 0, 0]), []);

  return (
    <Float
      speed={speed}
      rotationIntensity={0.1}
      floatIntensity={floatIntensity}
      position={node.position}
    >
      {/* -- Core star point (AdditiveBlending) -- */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPos, 3]}
            count={1}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={starSize}
          color={color}
          transparent
          opacity={starOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* -- Halo glow around the star -- */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPos, 3]}
            count={1}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={starSize * 3.5}
          color={color}
          transparent
          opacity={haloOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* -- Invisible hitbox for pointer interaction -- */}
      <mesh
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <sphereGeometry args={[Math.max(baseSize * 2, 0.35), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* -- 3D label (visible on hover or permanent when selected) -- */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, starSize + 0.4, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.type}
        </Text>
      )}
    </Float>
  );
}

// ---------------------------------------------------------------------------
// EdgeLine — dashed connection between two nodes with animated dash offset
// ---------------------------------------------------------------------------
function EdgeLine({
  edge,
  nodesMap,
}: {
  edge: GraphEdge;
  nodesMap: Map<string, GraphNode>;
}) {
  const source = nodesMap.get(edge.source);
  const target = nodesMap.get(edge.target);
  if (!source || !target) return null;

  const meshRef = useRef<THREE.Mesh>(null!);

  const points = useMemo(
    () => [
      new THREE.Vector3(...source.position),
      new THREE.Vector3(...target.position),
    ],
    [source.position, target.position],
  );

  // Compute the length of the line for the dashed material
  const start = points[0];
  const end = points[1];
  const mid = useMemo(
    () => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
    [],
  );
  const direction = useMemo(
    () => new THREE.Vector3().subVectors(end, start),
    [],
  );
  const length = direction.length();
  direction.normalize();

  // Geometry: a horizontal segment centered at origin, 1 unit long
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array([-0.5, 0, 0, 0.5, 0, 0]);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  // Animate dash offset via useFrame on the material
  const materialRef = useRef<any>(null!);
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.dashOffset = clock.elapsedTime * 0.25;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={mid}
      quaternion={new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        direction,
      )}
      scale={[length, 1, 1]}
    >
      <lineSegments geometry={lineGeom}>
        <lineDashedMaterial
          ref={materialRef}
          color="#23252a"
          opacity={0.4}
          transparent
          dashSize={0.15}
          gapSize={0.08}
        />
      </lineSegments>
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Particles — subtle background starfield (kept from original)
// ---------------------------------------------------------------------------
function Particles({ count = 300 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#71717a"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// SceneContent — wires layout, lighting, effects
// ---------------------------------------------------------------------------
function SceneContent({
  nodes,
  edges,
  selectedId,
  onSelect,
  onHover,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const nodesMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const handlePointerOver = useCallback(
    (id: string) => {
      setHoveredId(id);
      onHover(id);
    },
    [onHover],
  );

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback(
    (id: string) => {
      onSelect(selectedId === id ? null : id);
    },
    [selectedId, onSelect],
  );

  return (
    <>
      {/* Bloom / post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={0.4}
        />
      </EffectComposer>

      {/* Soft ambient fill */}
      <ambientLight intensity={0.3} />

      {/* Edges */}
      {edges.map((edge, i) => (
        <EdgeLine key={i} edge={edge} nodesMap={nodesMap} />
      ))}

      {/* Nodes */}
      {nodes.map((node) => {
        const isSelected = node.id === selectedId;
        const isHovered = node.id === hoveredId;
        const isDimmed = selectedId !== null && !isSelected;

        return (
          <GlowNode
            key={node.id}
            node={node}
            seed={hashString(node.id)}
            isSelected={isSelected}
            isHovered={isHovered}
            isDimmed={isDimmed}
            onPointerOver={() => handlePointerOver(node.id)}
            onPointerOut={handlePointerOut}
            onClick={() => handleClick(node.id)}
          />
        );
      })}

      {/* Background particles */}
      <Particles />

      {/* Ambient accent light */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#f59e0b" />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// NeuronScene — default export, entry point
// ---------------------------------------------------------------------------
export default function NeuronScene({
  entries,
  selectedId,
  onSelect,
  onHover,
}: {
  entries: MemoryEntry[];
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const graph = useMemo(() => computeGraphLayout(entries), [entries]);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{
        background: '#070708',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <SceneContent
        nodes={graph.nodes}
        edges={graph.edges}
        selectedId={selectedId}
        onSelect={onSelect}
        onHover={onHover}
      />
    </Canvas>
  );
}
