# Analyse Technique — Modernisation de Synapse

**Projet** : Visualisation mémoire 3D (Next.js 16 + Three.js/R3F)
**Stack actuelle** : `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `three@0.184.0`
**Données** : ~112 nœuds (entrées mémoire) + ~200-300 arêtes

---

## 1. Amélioration des nœuds 3D

### État actuel
- Chaque nœud = 2 `Mesh` (`sphereGeometry` + glow sphere superposé)
- 2 `useFrame` par nœud (lerp position, scale glow, distance souris)
- **224 maillages** pour 112 nœuds — pas d'instancing

### Recommandation 1A : InstancedMesh (HAUTE PRIORITÉ)
Remplacer les maillages individuels par `InstancedMesh`. Gain massif en draw calls (de 224 → ~2-4).

```tsx
// InstancedMesh pour tous les nœuds
function InstancedNodes({ nodes }: { nodes: GraphNode[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const glowRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Mise à jour des positions/échelles/couleurs
  useEffect(() => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      dummy.position.set(...n.position);
      dummy.scale.setScalar(n.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, tempColor.set(n.color));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [nodes]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
    </instancedMesh>
  );
}
```

**Alternative : utiliser drei `<Instances>` / `<Instance>`** qui encapsule déjà tout ça proprement :
```tsx
import { Instances, Instance } from '@react-three/drei'

function Nodes({ nodes }) {
  return (
    <Instances limit={nodes.length}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
      {nodes.map((n) => (
        <Instance key={n.id} position={n.position} color={n.color} scale={n.size} />
      ))}
    </Instances>
  )
}
```

### Recommandation 1B : Géométries variées par type de nœud
Au lieu de sphères uniformes, utiliser des géométries différentes selon le type :

| Type | Géométrie | Raison |
|------|-----------|--------|
| `architecture` | `octahedronGeometry` | Structure technique |
| `bug` | `torusGeometry` (petit anneau) | Boucle/issue |
| `decision` | `icosahedronGeometry` | Équilatéral, forme noble |
| `learning` | `tetrahedronGeometry` | Pointe vers la connaissance |
| `preference` | `torusKnotGeometry` | Complexe, organique |
| `system` | `boxGeometry` | Bloc système |
| `note` / défaut | `sphereGeometry` | Neutre |

```tsx
const GEOMETRIES = {
  architecture: () => new THREE.OctahedronGeometry(0.8),
  bug: () => new THREE.TorusGeometry(0.7, 0.3, 8, 12),
  decision: () => new THREE.IcosahedronGeometry(0.8),
  learning: () => new THREE.TetrahedronGeometry(0.8),
  preference: () => new THREE.TorusKnotGeometry(0.7, 0.3, 32, 8),
  system: () => new THREE.BoxGeometry(1, 1, 1),
  note: () => new THREE.SphereGeometry(0.8, 16, 16),
};

// Attention : InstancedMesh nécessite une géométrie unique — utiliser un group par type
// ou un groupe par nœud si variété de géométries
```

### Recommandation 1C : Shaders personnalisés (MOYENNE PRIORITÉ)
Créer un `ShaderMaterial` pour les effets glow/pulsation/anneaux, remplaçant les deux maillages (mesh + glow) par un seul.

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const NodeMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(1, 1, 1), uIntensity: 0.3, uHover: 0 },
  // Vertex shader
  `varying vec3 vPosition;
   void main() {
     vPosition = position;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // Fragment shader — effet de glow interne + pulsation
  `uniform float uTime;
   uniform vec3 uColor;
   uniform float uIntensity;
   uniform float uHover;
   varying vec3 vPosition;

   void main() {
     float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + length(vPosition) * 3.0);
     float glow = 1.0 - length(vPosition) / 1.2;
     glow = max(0.0, glow) * 0.6 * uIntensity * (0.5 + 0.5 * uHover);
     vec3 col = uColor * (pulse + glow * 2.0);
     float alpha = 1.0;
     gl_FragColor = vec4(col, alpha);
   }`
);

extend({ NodeMaterial });
```

### Recommandation 1D : PointsMaterial pour halos lumineux (BASS PRIORITÉ)
Pour un effet nébuleux autour des clusters, utiliser `PointsMaterial` avec une texture circulaire dégradée :

```tsx
const haloTexture = new THREE.CanvasTexture(generateCircleTexture());

for (const node of nodes) {
  // Ajouter 20-30 particles autour de chaque nœud important
  const positions = new Float32Array(particleCount * 3);
  // distribution sphérique autour de node.position
}
```

---

## 2. Post-processing Three.js

### État actuel
Aucun post-processing. Aucun `@react-three/postprocessing` installé.

### Disponible dans le bundle Three.js (déjà présent dans node_modules)
Three.js `0.184.0` inclut déjà dans `examples/jsm/postprocessing/` :
- ✅ `UnrealBloomPass.js` — glow/bleed lumineux
- ✅ `OutlinePass.js` — contour des objets
- ✅ `SSAOPass.js` — ombres portées douces
- ✅ `EffectComposer.js` — pipeline de post-processing
- ✅ `RenderPass.js`, `OutputPass.js`, `ShaderPass.js`

### Recommandation 2A : Installation de @react-three/postprocessing
Cette librairie fournit des hooks React prêts à l'emploi.

```bash
npm install @react-three/postprocessing
```

Poids estimé : ~15-25 kB gzippé (inclut UnrealBloomPass + OutlinePass)

### Recommandation 2B : UnrealBloomPass (HAUTE PRIORITÉ)
Donne un aspect lumineux, « neural », aux nœuds émissifs déjà configurés.

```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function SceneContent() {
  return (
    <>
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}    // en dessous → pas de bloom
          luminanceSmoothing={0.9}    // transition douce
          intensity={0.8}             // force du glow
          mipmapBlur                  // meilleure qualité
        />
      </EffectComposer>
      {/* ... scène existante ... */}
    </>
  );
}
```

Sans `@react-three/postprocessing`, utiliser directement Three.js :
```tsx
import { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } from 'three/examples/jsm/postprocessing'

// Dans le composant :
useEffect(() => {
  const composer = new EffectComposer(gl);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  // remplacer render par composer.render()
}, []);
```

### Recommandation 2C : OutlinePass pour sélection (MOYENNE PRIORITÉ)
Quand un nœud est sélectionné, entoure-le d'un contour lumineux.

```tsx
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing'

// Sélectionner les objets 3D
<Outline
  selection={[selectedMeshRef]}
  edgeStrength={2.5}
  edgeGlow={1}
  edgeThickness={2}
/>
```

### Recommandation 2D : SSAOPass — NON recommandé
Pour une scène de particules/nœuds où il n'y a pas de géométrie solide, SSAO n'apporte rien. Économise les ressources.

---

## 3. Labels dans la scène 3D

### État actuel
Aucun label 3D. Les infos hover sont affichées en overlay CSS (tooltip en bas d'écran).

### Recommandation 3A : drei `<Text>` (composant SDF) — FORTEMENT RECOMMANDÉ
Déjà disponible dans `@react-three/drei`. Utilise Troika Three Text (rendu SDF, toujours face caméra si non pivoté).

```tsx
import { Text } from '@react-three/drei'

// Label flottant au-dessus d'un nœud
function NodeLabel({ node }: { node: GraphNode }) {
  return (
    <Text
      position={[node.position[0], node.position[1] + 0.8, node.position[2]]}
      fontSize={0.15}
      color={node.color}
      anchorX="center"
      anchorY="bottom"
      fontWeight={500}
      outlineWidth={0.02}
      outlineColor="#070708"
      maxWidth={2}
    >
      {node.entry.text.slice(0, 60)}...
    </Text>
  );
}
```

**Avantages** : intégré dans la scène 3D, pas de problème de z-index, suit la rotation de la caméra (ou pas, selon configuration).
**Inconvénients** : tous les labels chargent le font SDF au démarrage (taille unique, ~300kB une fois).

### Recommandation 3B : drei `<Html>` — pour labels riches
Permet d'incorporer du HTML/CSS React directement dans la scène 3D.

```tsx
import { Html } from '@react-three/drei'

<Html
  position={[0, 1.2, 0]}
  center
  distanceFactor={8}
  occlude={[ref]}  // cache si obstrué
>
  <div className="bg-[#0f1011] border border-[#23252a] rounded-lg px-2 py-1 text-xs shadow-lg">
    <p className="text-[#f7f8f8] line-clamp-1">{node.entry.text}</p>
  </div>
</Html>
```

**Idéal pour** : les labels au survol (tooltip 3D) ou les cartes d'information qui suivent un nœud.

### Recommandation 3C : Sprite avec canvas texture
Alternative plus légère que `<Text>` SDF. Dessiner le texte sur un canvas et l'utiliser comme texture Sprite.

```tsx
function createLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#070708';
  ctx.roundRect(0, 0, 512, 128, 16);
  ctx.fill();
  
  ctx.fillStyle = color;
  ctx.font = '24px Inter, sans-serif';
  ctx.fillText(text.slice(0, 40), 24, 64);
  
  return new THREE.CanvasTexture(canvas);
}

// Usage
<Sprite position={[...]}>
  <spriteMaterial map={texture} transparent />
</Sprite>
```

**Avantage** : toujours face caméra, léger.
**Inconvénient** : pas aussi net que le SDF text pour les petites tailles.

### Recommandation 3D : TextGeometry — NON recommandé
Nécessite un loader de font (JSON), complexe à mettre en œuvre dans un contexte Next.js statique.

---

## 4. Animations fluides

### État actuel
- Flottement sinusoïdal basique des nœuds (`Math.sin(t * 0.8)`)
- Lerp de position (0.05 par frame — trop lent)
- Auto-rotation d'OrbitControls
- Aucune transition de caméra

### Recommandation 4A : Camera animations (MOYENNE PRIORITÉ)
Quand un nœud est cliqué, animer la caméra pour zoomer vers lui.

```tsx
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function CameraController({ target, active }: { target: THREE.Vector3 | null; active: boolean }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!target || !active) return;
    const pos = new THREE.Vector3(target.x, target.y, target.z + 4);
    camera.position.lerp(pos, 0.03);
    camera.lookAt(target);
  });

  return null;
}
```

Alternative avec gsap (plus fluide) :
```bash
npm install gsap
```

```tsx
import gsap from 'gsap'

function focusOnNode(position: THREE.Vector3) {
  gsap.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z + 3,
    duration: 1.2,
    ease: 'power3.inOut',
  });
}
```

### Recommandation 4B : trois `<Float>` pour animation flottante améliorée
Déjà disponible dans `drei`. Remplace le `useFrame` manuel de `NodeSphere` :

```tsx
import { Float } from '@react-three/drei'

<Float
  speed={1.5}        // vitesse de flottement
  rotationIntensity={0.2}  // rotation légère
  floatIntensity={0.5}     // amplitude verticale
>
  <mesh geometry={...} material={...} />
</Float>
```

**Avantage** : supprime le `useFrame` par nœud, plus performant, animations plus naturelles.

### Recommandation 4C : Edge flow animations (particules le long des connexions)
Animer des points lumineux qui circulent le long des arêtes.

```tsx
function AnimatedEdge({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current += delta * 0.3;
    if (progress.current > 1) progress.current = 0;
    const pos = new THREE.Vector3().lerpVectors(start, end, progress.current);
    ref.current.position.copy(pos);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
    </mesh>
  );
}
```

Ou version avec drei `<Trail>` / `<Line>` animé :
```tsx
import { Line, QuadraticBezierLine } from '@react-three/drei'

// Ligne animée avec dash offset
<QuadraticBezierLine
  start={startPos}
  end={endPos}
  color="#f59e0b"
  lineWidth={1}
  dashed
  dashSize={0.5}
  gapSize={0.5}
/>
// Animer dashOffset dans useFrame pour effet de circulation
```

### Recommandation 4D : Node pulse animation
Le pulse actuel (basé sur distance souris) peut être amélioré :

```tsx
// Dans le shader custom (recommandé) ou dans useFrame
const pulse = Math.sin(clock.elapsedTime * 2 + floatOffset) * 0.15 + 0.85;
meshRef.current.scale.setScalar(baseSize * pulse * proximityEffect);
```

---

## 5. Contraintes et limites

### 5A : Performance
- **112 nœuds** → même avec 224 maillages individuels, Three.js gère ça sans problème (WebGL peut en gérer des milliers)
- **Vrai goulot : les `useFrame`** — 112 exécutions par frame pour le lerp + glow. Solution : passer à `InstancedMesh` + shader custom dans un seul `useFrame`
- **~300 arêtes** → avec `lineSegments`, c'est un unique draw call, très performant
- **Recommandation** : utiliser `dpr={[1, 1.5]}` (déjà fait), ajouter `AdaptiveDpr` de drei pour baisser le DPR en cas de baisse de FPS

```tsx
import { AdaptiveDpr } from '@react-three/drei'

<Canvas dpr={[1, 1.5]}>
  <AdaptiveDpr pixelated />
  {/* ... */}
</Canvas>
```

### 5B : Compatibilité build statique Vercel
- **Next.js static export** : déjà compatible (`next build`, `next.config.ts` sans `output: 'export'` pour l'instant — mais rien ne l'empêche)
- **Three.js / R3F** : fonctionne parfaitement en statique (pas de SSR, tout est côté client)
- **`@react-three/postprocessing`** : compatible statique
- **Fonts SDF (drei `<Text>`)** : chargées au runtime → compatible statique
- **gsap** : compatible statique

### 5C : Taille du bundle JS
| Package | Estimation (min+gzip) |
|---------|----------------------|
| Three.js actuel | ~50-60 kB de la scène (tree-shaké) |
| + `@react-three/postprocessing` | ~15-25 kB (Bloom + Outline) |
| + gsap (si ajouté) | ~8-12 kB |
| + Font SDF für `<Text>` | ~300 kB (chargé une fois au premier `<Text>`) |

**Total ajout estimé** : 25-40 kB gzippé, acceptable pour une appli outil.

**Astuce** : charger les fonts `<Text>` avec `characters` limité pour réduire le payload de la SDF.

### 5D : Limitations connues
- **OutlinePass** sur InstancedMesh : l'outline ne fonctionne pas bien avec les instances. Utiliser un groupe de maillages individuels POUR les nœuds sélectionnés si Outline est critique.
- **SSAO** : inutile sur des points lumineux, pas de géométrie à ombrer.
- **Mobile** : la scene Three.js est full-viewport fixe — pas de souci. Bloom peut être lourd sur GPU mobile. Utiliser `luminanceThreshold` plus haut pour réduire le bloom sur mobile.

---

## Résumé des recommandations

| Priorité | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P1** | `npm install @react-three/postprocessing` + Bloom | 30 min | Visuel spectaculaire, effet « neural » |
| **P1** | Remplacer les 112 `<NodeSphere>` par `<Instances>` de drei | 2h | -220 draw calls, plus de `useFrame` |
| **P1** | Ajouter `<AdaptiveDpr>` pour performance mobile | 5 min | Évite le lag sur GPU faible |
| **P2** | Ajouter drei `<Text>` pour les labels des nœuds (visibles au hover/zoom) | 1h | Lisibilité de la scène |
| **P2** | Remplacer `useFrame` flottant par drei `<Float>` | 30 min | Animations + fluides, moins de code |
| **P2** | Géométries variées par type de nœud | 1h | Différenciation visuelle immédiate |
| **P3** | Camera animation vers nœud sélectionné (gsap ou lerp) | 1h | Navigation immersive |
| **P3** | OutlinePass sur le nœud sélectionné | 1h | Feedback visuel de sélection |
| **P4** | Particules animées sur les arêtes | 2h | Effet « data flow » spectaculaire |
| **P4** | ShaderMaterial custom (remplace sphere + glow) | 3h | Unification, potentiel créatif |

### Ordre d'implémentation recommandé
1. Bloom pass (plus gros effet visuel pour le moins d'effort)
2. InstancedMesh + Float (performance + animations)
3. Labels Text (lisibilité)
4. Géométries variées (identité visuelle)
5. Camera animation + Outline (interaction)
6. Particules edges + shader custom (polissage)

---

*Analyse générée le 6 juin 2026 — baseline : 112 nœuds, ~300 arêtes, Three.js 0.184.0, R3F 9.6.1, drei 10.7.7*
