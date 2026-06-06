'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { computeGraphLayout, GraphNode, GraphEdge, hashString } from '@/lib/graph-layout';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

// ---------------------------------------------------------------------------
// GlowNode — luminous 3D sphere with breathing animation, halo glow, and bloom
//   Replaces the old PointsMaterial-based node with an organic Mesh sphere
//   that pulses, glows, and looks like a star / neuron.
// ---------------------------------------------------------------------------
function GlowNode({
  node,
  isSelected,
  isHovered,
  isDimmed,
  isFiltered,
  seed,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  node: GraphNode;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  isFiltered: boolean;
  seed: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const spriteRef = useRef<THREE.Sprite>(null!);

  const baseSize = node.size || 0.3;

  // Per-node breathing parameters derived from deterministic seed
  const speed = useMemo(() => 1.5 + ((seed * 13) % 100) * 0.015, [seed]);
  const phaseOffset = useMemo(() => ((seed * 0.1) % (Math.PI * 2)), [seed]);
  const breatheAmplitude = useMemo(() => 0.12 + ((seed * 3) % 100) * 0.002, [seed]);

  // Hidden when filtered out
  if (isFiltered && !isSelected) return null;

  const sizeScale = isSelected ? 2.4 : isHovered ? 1.7 : 1.0;
  const opacity = isDimmed && !isSelected ? 0.15 : isSelected ? 1.0 : 0.85;
  const haloOpacity = isDimmed && !isSelected ? 0.04 : isSelected ? 0.40 : 0.12;

  // Generate a circular gradient texture once for the halo sprite
  const haloTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const center = 32;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.1, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.25)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.06)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Breathing + halo pulsing animation
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phaseOffset;
    const breathe = 1 + Math.sin(t) * breatheAmplitude;
    const scale = baseSize * sizeScale * breathe;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }

    if (spriteRef.current) {
      const spriteScale = scale * 3.5;
      spriteRef.current.scale.set(spriteScale, spriteScale, 1);
      // Halo opacity subtly pulses out of phase with the core
      spriteRef.current.material.opacity =
        haloOpacity * (0.7 + 0.3 * Math.sin(t * 0.6 + 1.5));
    }
  });

  const finalColor = isHovered ? '#f59e0b' : node.color;
  const emissiveIntensity = isSelected ? 2.5 : isHovered ? 1.8 : 1.0;

  return (
    <group position={node.position}>
      {/* Halo sprite — soft, glowing aureole with AdditiveBlending */}
      <sprite ref={spriteRef}>
        <spriteMaterial
          map={haloTexture}
          color={finalColor}
          transparent
          opacity={haloOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Core sphere — emissive Mesh, toneMapped=false for bloom pickup */}
      <mesh
        ref={meshRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={finalColor}
          emissive={finalColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      {/* 3D type label on hover/select */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, baseSize * sizeScale + 0.5, 0]}
          fontSize={0.28}
          color="#f7f8f8"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.type}
        </Text>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// EdgeLine — connection with animated dash + hover highlight
// ---------------------------------------------------------------------------
function EdgeLine({
  edge,
  nodesMap,
  hoveredId,
  selectedId,
}: {
  edge: GraphEdge;
  nodesMap: Map<string, GraphNode>;
  hoveredId: string | null;
  selectedId: string | null;
}) {
  const source = nodesMap.get(edge.source);
  const target = nodesMap.get(edge.target);
  if (!source || !target) return null;

  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  const isConnected =
    hoveredId !== null &&
    (edge.source === hoveredId || edge.target === hoveredId);

  const isSelectedEdge =
    selectedId !== null &&
    (edge.source === selectedId || edge.target === selectedId);

  const points = useMemo(
    () => [
      new THREE.Vector3(...source.position),
      new THREE.Vector3(...target.position),
    ],
    [source.position, target.position],
  );

  const start = points[0];
  const end = points[1];
  const mid = useMemo(
    () => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
    [],
  );
  const direction = useMemo(() => {
    const d = new THREE.Vector3().subVectors(end, start);
    d.normalize();
    return d;
  }, []);
  const length = start.distanceTo(end);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0]), 3),
    );
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.dashOffset = clock.elapsedTime * 0.25;
    }
  });

  const edgeOpacity = isSelectedEdge ? 0.7 : isConnected ? 0.5 : 0.25;
  const edgeColor = isConnected ? '#f59e0b' : '#23252a';

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
          color={edgeColor}
          opacity={edgeOpacity}
          transparent
          dashSize={0.12}
          gapSize={0.06}
        />
      </lineSegments>
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Particles — subtle background starfield
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
    ref.current.rotation.y = clock.elapsedTime * 0.008;
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
        size={0.025}
        color="#71717a"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// CameraController — fly-to on selection, autoRotate toggle
// ---------------------------------------------------------------------------
function CameraController({
  selectedNode,
}: {
  selectedNode: GraphNode | null;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const animProgress = useRef(0);

  useEffect(() => {
    if (!selectedNode) {
      isAnimating.current = false;
      animProgress.current = 1;
      return;
    }

    const pos = selectedNode.position;
    const flyPos = new THREE.Vector3(pos[0], pos[1], pos[2] + 5);
    const flyTarget = new THREE.Vector3(pos[0], pos[1], pos[2]);

    startPos.current.copy(camera.position);
    startTarget.current.copy(target.current);
    isAnimating.current = true;
    animProgress.current = 0;

    const animate = () => {
      if (!isAnimating.current) return;
      animProgress.current = Math.min(animProgress.current + 0.025, 1);

      // Ease-out cubic
      const t = 1 - Math.pow(1 - animProgress.current, 3);

      camera.position.lerpVectors(startPos.current, flyPos, t);
      target.current.lerpVectors(startTarget.current, flyTarget, t);

      if (animProgress.current < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    animate();
  }, [selectedNode, camera]);

  return null;
}

// ---------------------------------------------------------------------------
// SceneContent
// ---------------------------------------------------------------------------
function SceneContent({
  nodes,
  edges,
  selectedId,
  activeType,
  onSelect,
  onHover,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  activeType: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null!);
  const nodesMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId],
  );

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
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={0.35}
        />
      </EffectComposer>

      <ambientLight intensity={0.3} />

      {/* Edges */}
      {edges.map((edge, i) => (
        <EdgeLine
          key={i}
          edge={edge}
          nodesMap={nodesMap}
          hoveredId={hoveredId}
          selectedId={selectedId}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => {
        const isSelected = node.id === selectedId;
        const isHovered = node.id === hoveredId;
        const isDimmed = selectedId !== null && !isSelected;
        const isFiltered = activeType !== null && node.type !== activeType;

        return (
          <GlowNode
            key={node.id}
            node={node}
            seed={hashString(node.id)}
            isSelected={isSelected}
            isHovered={isHovered}
            isDimmed={isDimmed}
            isFiltered={isFiltered}
            onPointerOver={() => handlePointerOver(node.id)}
            onPointerOut={handlePointerOut}
            onClick={() => handleClick(node.id)}
          />
        );
      })}

      <Particles />
      <pointLight position={[0, 0, 0]} intensity={0.25} color="#f59e0b" />
      <CameraController selectedNode={selectedNode} />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={25}
        autoRotate={selectedId === null}
        autoRotateSpeed={0.2}
        rotateSpeed={0.6}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// NeuronScene — default export
// ---------------------------------------------------------------------------
export default function NeuronScene({
  entries,
  selectedId,
  activeType,
  onSelect,
  onHover,
}: {
  entries: MemoryEntry[];
  selectedId: string | null;
  activeType: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
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
        activeType={activeType}
        onSelect={onSelect}
        onHover={onHover}
      />
    </Canvas>
  );
}
