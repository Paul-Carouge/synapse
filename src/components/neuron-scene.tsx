'use client';

import { Component, useRef, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { computeGraphLayout, GraphNode, GraphEdge, hashString } from '@/lib/graph-layout';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

// ---------------------------------------------------------------------------
// GlowNode — luminous 3D sphere with breathing animation, halo glow, and bloom
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
  const ringRef = useRef<THREE.Mesh>(null!);

  const baseSize = node.size || 0.3;

  // Per-node breathing parameters from deterministic seed
  const speed = useMemo(() => 1.5 + ((seed * 13) % 100) * 0.015, [seed]);
  const phaseOffset = useMemo(() => ((seed * 0.1) % (Math.PI * 2)), [seed]);
  const breatheAmplitude = useMemo(() => 0.12 + ((seed * 3) % 100) * 0.002, [seed]);

  const isFilteredOut = isFiltered && !isSelected;

  const sizeScale = isSelected ? 2.6 : isHovered ? 1.8 : 1.0;
  const opacity = isFilteredOut ? 0.008 : isDimmed && !isSelected ? 0.15 : isSelected ? 1.0 : 0.85;
  const haloOpacity = isFilteredOut ? 0.001 : isDimmed && !isSelected ? 0.04 : isSelected ? 0.50 : 0.15;

  // Generate a circular gradient texture once for the halo sprite
  const haloTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const center = 32;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.08, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Breathing animation
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phaseOffset;
    const breathe = 1 + Math.sin(t) * breatheAmplitude;
    const scale = baseSize * sizeScale * breathe;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }

    if (spriteRef.current) {
      const spriteScale = scale * 4.0;
      spriteRef.current.scale.set(spriteScale, spriteScale, 1);
      spriteRef.current.material.opacity =
        haloOpacity * (0.7 + 0.3 * Math.sin(t * 0.6 + 1.5));
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(scale * 1.6);
      const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
      ringMat.opacity = isSelected ? 0.25 * (0.8 + 0.2 * Math.sin(t * 0.8)) : 0;
    }
  });

  const finalColor = isHovered ? '#f59e0b' : node.color;
  const emissiveIntensity = isSelected ? 3.0 : isHovered ? 2.0 : 1.0;

  return (
    <group position={node.position}>
      {/* Orbital ring — visible only when selected */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 48]} />
        <meshBasicMaterial
          color={finalColor}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Halo sprite */}
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

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={finalColor}
          emissive={finalColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          toneMapped={false}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* 3D type label on hover/select */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, baseSize * sizeScale + 0.6, 0]}
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
// EdgeLine — connection with animated dash + data-flow pulsation
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

  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  const isConnected =
    hoveredId !== null &&
    (edge.source === hoveredId || edge.target === hoveredId);

  const isSelectedEdge =
    selectedId !== null &&
    (edge.source === selectedId || edge.target === selectedId);

  // Highlight edges connected to selected node
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

  const pulseSpeed = useMemo(() => 0.6 + ((seed * 7) % 100) * 0.004, [seed]);
  const pulsePhase = useMemo(() => (seed * 0.15) % (Math.PI * 2), [seed]);

  // Visibility: hidden if showEdges is false and not related to selected/hovered
  const visible = showEdges || isConnected || isSelectedEdge || isRelatedToSelected;
  const baseOpacity = isSelectedEdge ? 0.8 : isConnected ? 0.6 : isRelatedToSelected ? 0.4 : 0.12;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.elapsedTime * pulseSpeed + pulsePhase;
      materialRef.current.dashOffset = clock.elapsedTime * (0.2 + ((seed * 3) % 100) * 0.002);
      const pulse = 0.6 + 0.4 * Math.sin(t);
      materialRef.current.opacity = baseOpacity * pulse;
    }
  });

  if (!visible) return null;

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
          color={isSelectedEdge || isRelatedToSelected ? '#f59e0b' : '#f59e0b'}
          opacity={baseOpacity}
          transparent
          dashSize={0.12}
          gapSize={0.06}
          linewidth={1}
        />
      </lineSegments>
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Particles — subtle background starfield with depth layers
// ---------------------------------------------------------------------------
function Particles({ count = 200 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = 0.015 + Math.random() * 0.04;
    }
    return s;
  }, [count]);

  // Second layer of distant particles
  const farPositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, [count]);

  const nearRef = useRef<THREE.Points>(null!);
  const farRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (nearRef.current) {
      nearRef.current.rotation.y = clock.elapsedTime * 0.005;
      nearRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.002) * 0.02;
    }
    if (farRef.current) {
      farRef.current.rotation.y = clock.elapsedTime * 0.002;
    }
  });

  return (
    <>
      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
            count={count}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#71717a"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[farPositions, 3]}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.012}
          color="#52525b"
          transparent
          opacity={0.15}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ---------------------------------------------------------------------------
// CameraController — fly-to on selection, autoRotate toggle
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

  // Update autoRotate on the controls
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
    // Calculate fly-to position based on node size
    const nodeSize = selectedNode.size || 0.3;
    const zoomDistance = 3 + nodeSize * 4;
    const flyPos = new THREE.Vector3(pos[0], pos[1], pos[2] + zoomDistance);
    const flyTarget = new THREE.Vector3(pos[0], pos[1], pos[2]);

    startPos.current.copy(camera.position);
    startTarget.current.copy(orbitControls.target);
    isAnimating.current = true;
    animProgress.current = 0;

    const animate = () => {
      if (!isAnimating.current) return;
      animProgress.current = Math.min(animProgress.current + 0.025, 1);

      // Ease-out cubic
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
// AmbientLighting — rim lights + subtle fill
// ---------------------------------------------------------------------------
function AmbientLighting() {
  return (
    <>
      <ambientLight intensity={0.25} color="#404060" />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#f59e0b" />
      <pointLight position={[-5, -3, -5]} intensity={0.2} color="#6366f1" />
      <pointLight position={[0, 0, 0]} intensity={0.15} color="#f59e0b" />
      <hemisphereLight args={['#404060', '#070708', 0.3]} />
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

  // Filter edges
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
      <fogExp2 attach="fog" args={['#070708', 0.035]} />

      <AmbientLighting />

      {/* Edges */}
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

      <CameraController selectedNode={selectedNode} autoRotate={autoRotate} />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={30}
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
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#070708', color: '#52525b', fontSize: '12px',
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
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={(state: RootState) => {
          const gl = state.gl as THREE.WebGLRenderer;
          gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
            e.preventDefault();
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            state.invalidate();
          });
        }}
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
          showEdges={showEdges}
          autoRotate={autoRotate}
          onSelect={onSelect}
          onHover={onHover}
        />

        <EffectComposer>
          <Bloom
            blendFunction={BlendFunction.ADD}
            intensity={0.6}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
