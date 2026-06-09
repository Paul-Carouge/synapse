'use client';

import { Component, useRef, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { computeGraphLayout, GraphNode, GraphEdge, hashString } from '@/lib/graph-layout';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

// ---------------------------------------------------------------------------
// Node — clean 3D sphere with subtle pulse
// ---------------------------------------------------------------------------
function GraphNode3D({
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

  const baseSize = node.size || 0.3;

  // Subtle breathing
  const speed = useMemo(() => 1.2 + ((seed * 13) % 100) * 0.01, [seed]);
  const phaseOffset = useMemo(() => ((seed * 0.1) % (Math.PI * 2)), [seed]);
  const breatheAmplitude = useMemo(() => 0.06 + ((seed * 3) % 100) * 0.001, [seed]);

  const isFilteredOut = isFiltered && !isSelected;

  const sizeScale = isSelected ? 2.2 : isHovered ? 1.6 : 1.0;
  const opacity = isFilteredOut ? 0.006 : isDimmed && !isSelected ? 0.12 : isSelected ? 1.0 : 0.8;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phaseOffset;
    const breathe = 1 + Math.sin(t) * breatheAmplitude;
    const scale = baseSize * sizeScale * breathe;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }
  });

  const finalColor = isHovered ? '#f59e0b' : node.color;
  const emissiveIntensity = isSelected ? 1.2 : isHovered ? 0.8 : 0.3;

  return (
    <group position={node.position}>
      {/* Core sphere — clean, subtle */}
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
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.25, 32]} />
          <meshBasicMaterial
            color={finalColor}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3D type label on hover/select */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, baseSize * sizeScale + 0.5, 0]}
          fontSize={0.24}
          color="#8a8f98"
          anchorX="center"
          anchorY="bottom"
        >
          {node.type}
        </Text>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// EdgeLine — clean connection line with subtle data flow
// ---------------------------------------------------------------------------
function EdgeLine({
  edge,
  nodesMap,
  hoveredId,
  selectedId,
  seed,
  showEdges,
}: {
  edge: GraphEdge;
  nodesMap: Map<string, GraphNode>;
  hoveredId: string | null;
  selectedId: string | null;
  seed: number;
  showEdges: boolean;
}) {
  const source = nodesMap.get(edge.source);
  const target = nodesMap.get(edge.target);
  if (!source || !target) return null;

  const materialRef = useRef<any>(null!);

  const isConnected =
    hoveredId !== null &&
    (edge.source === hoveredId || edge.target === hoveredId);

  const isSelectedEdge =
    selectedId !== null &&
    (edge.source === selectedId || edge.target === selectedId);

  const isRelatedToSelected =
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

  const pulseSpeed = useMemo(() => 0.5 + ((seed * 7) % 100) * 0.003, [seed]);
  const pulsePhase = useMemo(() => (seed * 0.15) % (Math.PI * 2), [seed]);

  const visible = showEdges || isConnected || isSelectedEdge || isRelatedToSelected;
  const baseOpacity = isSelectedEdge ? 0.6 : isConnected ? 0.4 : isRelatedToSelected ? 0.25 : 0.06;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.elapsedTime * pulseSpeed + pulsePhase;
      materialRef.current.dashOffset = clock.elapsedTime * 0.15;
      const pulse = 0.7 + 0.3 * Math.sin(t);
      materialRef.current.opacity = baseOpacity * pulse;
    }
  });

  if (!visible) return null;

  return (
    <mesh
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
          color="#a1a1aa"
          opacity={baseOpacity}
          transparent
          dashSize={0.08}
          gapSize={0.04}
        />
      </lineSegments>
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Particles — clean background dots
// ---------------------------------------------------------------------------
function Particles({ count = 80 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.003;
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
        size={0.02}
        color="#52525b"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// CameraController — fly-to on selection
// ---------------------------------------------------------------------------
function CameraController({
  selectedNode,
  autoRotate,
}: {
  selectedNode: GraphNode | null;
  autoRotate: boolean;
}) {
  const { camera, controls } = useThree();
  const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void; autoRotate: boolean } | null;
  const isAnimating = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const animProgress = useRef(0);

  useEffect(() => {
    if (orbitControls) {
      orbitControls.autoRotate = autoRotate;
    }
  }, [autoRotate, orbitControls]);

  useEffect(() => {
    if (!selectedNode || !orbitControls) {
      if (!selectedNode && orbitControls) {
        isAnimating.current = false;
        animProgress.current = 1;
      }
      return;
    }

    const pos = selectedNode.position;
    const zoomDistance = 3 + (selectedNode.size || 0.3) * 4;
    const flyPos = new THREE.Vector3(pos[0], pos[1], pos[2] + zoomDistance);
    const flyTarget = new THREE.Vector3(pos[0], pos[1], pos[2]);

    startPos.current.copy(camera.position);
    startTarget.current.copy(orbitControls.target);
    isAnimating.current = true;
    animProgress.current = 0;

    const animate = () => {
      if (!isAnimating.current) return;
      animProgress.current = Math.min(animProgress.current + 0.025, 1);
      const t = 1 - Math.pow(1 - animProgress.current, 3);
      camera.position.lerpVectors(startPos.current, flyPos, t);
      orbitControls.target.lerpVectors(startTarget.current, flyTarget, t);
      orbitControls.update();
      if (animProgress.current < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
      }
    };
    animate();
  }, [selectedNode, camera, controls]);

  return null;
}

// ---------------------------------------------------------------------------
// Lighting — clean, minimal
// ---------------------------------------------------------------------------
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={0.15} color="#f59e0b" />
    </>
  );
}

// ---------------------------------------------------------------------------
// SceneContent
// ---------------------------------------------------------------------------
function SceneContent({
  nodes,
  edges,
  selectedId,
  activeType,
  showEdges,
  autoRotate,
  onSelect,
  onHover,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  activeType: string | null;
  showEdges: boolean;
  autoRotate: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null!);
  const nodesMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const visibleNodeIds = useMemo(() => {
    if (!activeType) return new Set(nodes.map((n) => n.id));
    return new Set(nodes.filter((n) => n.type === activeType).map((n) => n.id));
  }, [nodes, activeType]);

  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)),
    [edges, visibleNodeIds],
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId],
  );

  const handlePointerOver = useCallback(
    (id: string) => { setHoveredId(id); onHover(id); },
    [onHover],
  );

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback(
    (id: string) => { onSelect(selectedId === id ? null : id); },
    [selectedId, onSelect],
  );

  return (
    <>
      <Lighting />

      {visibleEdges.map((edge, i) => (
        <EdgeLine
          key={i}
          edge={edge}
          nodesMap={nodesMap}
          hoveredId={hoveredId}
          selectedId={selectedId}
          seed={hashString(edge.source + edge.target)}
          showEdges={showEdges}
        />
      ))}

      {nodes.map((node) => (
        <GraphNode3D
          key={node.id}
          node={node}
          seed={hashString(node.id)}
          isSelected={node.id === selectedId}
          isHovered={node.id === hoveredId}
          isDimmed={selectedId !== null && node.id !== selectedId}
          isFiltered={activeType !== null && node.type !== activeType}
          onPointerOver={() => handlePointerOver(node.id)}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick(node.id)}
        />
      ))}

      <Particles />
      <CameraController selectedNode={selectedNode} autoRotate={autoRotate} />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
        autoRotate={autoRotate}
        autoRotateSpeed={0.15}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// CanvasErrorBoundary
// ---------------------------------------------------------------------------
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'transparent', color: '#52525b', fontSize: '12px',
        }}>
          Visualisation 3D indisponible
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// NeuronScene — default export
// ---------------------------------------------------------------------------
export default function NeuronScene({
  entries,
  selectedId,
  activeType,
  showEdges,
  autoRotate,
  onSelect,
  onHover,
}: {
  entries: MemoryEntry[];
  selectedId: string | null;
  activeType: string | null;
  showEdges: boolean;
  autoRotate: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const graph = useMemo(() => computeGraphLayout(entries), [entries]);

  return (
    <CanvasErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={(state: RootState) => {
          const gl = state.gl as THREE.WebGLRenderer;
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
            e.preventDefault();
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            state.invalidate();
          });
        }}
        style={{
          background: 'transparent',
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
          showEdges={showEdges}
          autoRotate={autoRotate}
          onSelect={onSelect}
          onHover={onHover}
        />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
