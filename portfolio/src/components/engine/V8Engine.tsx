'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface V8EngineProps {
  onComplete: () => void
}

const SKILLS = ['React.js', 'FastAPI', 'Node.js', 'Python', 'RAG / LLM', 'AWS + Docker', 'MongoDB', 'TypeScript']
const NITROS = [
  { name: 'CURIOSITY',   color: 0x00d4aa, hex: '#00d4aa' },
  { name: 'HUSTLE',      color: 0x7c3aed, hex: '#7c3aed' },
  { name: 'INNOVATION',  color: 0xf97316, hex: '#f97316' },
  { name: 'PRECISION',   color: 0xfbbf24, hex: '#fbbf24' },
]

// V8 firing order: 1-8-4-3-6-5-7-2
const FIRING_ORDER = [0, 7, 3, 2, 5, 4, 6, 1]

export default function V8Engine({ onComplete }: V8EngineProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    animId: number
  } | null>(null)

  const [phase, setPhase] = useState<'heartbeat' | 'reveal' | 'idle' | 'revup' | 'nitro' | 'launch'>('reveal')
  const [rpm, setRpm] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [nitroName, setNitroName] = useState('')
  const [nitroColor, setNitroColor] = useState('#00d4aa')
  const [nitroVisible, setNitroVisible] = useState(false)
  const [launchPct, setLaunchPct] = useState(0)
  const [heartbeat, setHeartbeat] = useState(1)
  const [activeCyl, setActiveCyl] = useState(-1)

  const stateRef = useRef({
    phase: 'reveal',
    t: 0,
    phaseT: 0,
    rpm: 0,
    speed: 0,
    crankAngle: 0,
    isDragging: false,
    autoRotate: true,
    engineGroup: null as THREE.Group | null,
    pistons: [] as THREE.Mesh[],
    conrods: [] as THREE.Mesh[],
    crankPins: [] as THREE.Mesh[],
    cylinderFireLights: [] as THREE.PointLight[],
    exhaustParticles: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[],
    nitroIdx: 0,
    launchPct: 0,
    rings: null as THREE.Group | null,
  })

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── RENDERER ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020812)
    scene.fog = new THREE.FogExp2(0x020812, 0.018)

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    camera.position.set(0, 3, 14)
    camera.lookAt(0, 0, 0)

    // ── LIGHTS ────────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x0a1a2a, 3.5) // Increased ambient
    scene.add(ambient)

    const mainLight = new THREE.DirectionalLight(0x00d4aa, 2.5) // Increased main
    mainLight.position.set(5, 10, 5)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x7c3aed, 2.0) // Increased fill
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5) // Increased rim
    rimLight.position.set(0, -5, -8)
    scene.add(rimLight)

    // Holographic/Translucent Theme Match (Bright Clear Glass)
    const engineMetal = new THREE.MeshPhysicalMaterial({
      color: 0x002233,
      emissive: 0x00d4aa,
      emissiveIntensity: 0.15,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })

    // Bright Neon Outline Material
    const neonWireMat = new THREE.MeshBasicMaterial({ 
      color: 0x00d4aa, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.8 
    })

    const chromemat = new THREE.MeshStandardMaterial({
      color: 0xaaccdd,
      metalness: 1.0,
      roughness: 0.1,
    })

    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0xc0c8d0,
      metalness: 0.85,
      roughness: 0.2,
    })

    const crankMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.95,
      roughness: 0.15,
    })

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4aa,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.85,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })

    // ── ENGINE GROUP ─────────────────────────────────────────────────────────
    const engineGroup = new THREE.Group()
    scene.add(engineGroup)
    stateRef.current.engineGroup = engineGroup

    // ── ENGINE BLOCK ─────────────────────────────────────────────────────────
    const blockGeo = new THREE.BoxGeometry(8.5, 2.5, 3.5)
    const blockMesh = new THREE.Mesh(blockGeo, engineMetal)
    blockMesh.position.set(0, -0.5, 0)
    blockMesh.castShadow = true
    blockMesh.receiveShadow = true
    engineGroup.add(blockMesh)

    // Block edge glow (wireframe overlay)
    const blockWire = new THREE.Mesh(
      new THREE.BoxGeometry(8.55, 2.55, 3.55),
      neonWireMat
    )
    blockMesh.add(blockWire)

    // Translucent block cover
    const blockGlass = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 2.6, 3.6),
      glassMat
    )
    blockGlass.position.set(0, -0.5, 0)
    engineGroup.add(blockGlass)

    // ── CYLINDER HEADS (V-shape: left bank tilt + right bank tilt) ───────────
    const BANK_ANGLE = Math.PI / 5.5  // ~33 degrees V-angle each side
    const CYL_SPACING = 1.9
    const CYL_OFFSET = -3.3  // start x

    const headL = new THREE.Group()
    headL.rotation.z = BANK_ANGLE
    engineGroup.add(headL)

    const headR = new THREE.Group()
    headR.rotation.z = -BANK_ANGLE
    engineGroup.add(headR)

    // Head cover shapes
    const headGeo = new THREE.BoxGeometry(8.5, 0.5, 1.4)
    const headMeshL = new THREE.Mesh(headGeo, engineMetal)
    headMeshL.position.set(0, 2.2, -0.9)
    headMeshL.add(new THREE.Mesh(headGeo, neonWireMat))
    headL.add(headMeshL)

    const headMeshR = new THREE.Mesh(headGeo, engineMetal)
    headMeshR.position.set(0, 2.2, 0.9)
    headMeshR.add(new THREE.Mesh(headGeo, neonWireMat))
    headR.add(headMeshR)

    // ── CRANKSHAFT ────────────────────────────────────────────────────────────
    const crankGroup = new THREE.Group()
    crankGroup.position.set(0, -1.5, 0)
    engineGroup.add(crankGroup)

    // Main shaft
    const shaftGeo = new THREE.CylinderGeometry(0.18, 0.18, 9, 16)
    const shaftMesh = new THREE.Mesh(shaftGeo, crankMat)
    shaftMesh.rotation.z = Math.PI / 2
    crankGroup.add(shaftMesh)

    // Crank throws (8 of them, offset 90° pairs)
    const crankPins: THREE.Mesh[] = []
    const throwRadius = 0.75
    for (let i = 0; i < 8; i++) {
      const throwAngle = (i * Math.PI / 2) + (Math.floor(i / 2) % 2 === 0 ? 0 : Math.PI)
      const throwGroup = new THREE.Group()
      throwGroup.position.x = CYL_OFFSET + i * CYL_SPACING

      // crank web
      const webGeo = new THREE.BoxGeometry(0.2, throwRadius * 2 + 0.4, 0.5)
      const web1 = new THREE.Mesh(webGeo, crankMat)
      web1.position.y = throwRadius / 2
      web1.rotation.z = throwAngle
      throwGroup.add(web1)

      // crank pin
      const pinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 12)
      const pin = new THREE.Mesh(pinGeo, chromemat)
      pin.rotation.z = Math.PI / 2
      pin.position.set(0, Math.cos(throwAngle) * throwRadius, Math.sin(throwAngle) * throwRadius)
      throwGroup.add(pin)
      crankPins.push(pin)

      crankGroup.add(throwGroup)
    }
    stateRef.current.crankPins = crankPins

    // ── PISTONS + CONNECTING RODS ─────────────────────────────────────────────
    const pistons: THREE.Mesh[] = []
    const conrods: THREE.Mesh[] = []
    const cylinderFireLights: THREE.PointLight[] = []

    for (let i = 0; i < 8; i++) {
      const bank = i < 4 ? -1 : 1
      const cylIdx = i < 4 ? i : i - 4
      const xPos = CYL_OFFSET + (i < 4 ? i : cylIdx + 0.95) * CYL_SPACING

      // Cylinder bore (glass)
      const boreGeo = new THREE.CylinderGeometry(0.52, 0.52, 2.8, 20, 1, true)
      const bore = new THREE.Mesh(boreGeo, glassMat)
      bore.position.set(
        xPos,
        0.8 + Math.abs(Math.sin(BANK_ANGLE)) * 0.5,
        bank * 1.1
      )
      bore.rotation.x = bank === -1 ? -BANK_ANGLE : BANK_ANGLE
      engineGroup.add(bore)

      // Cylinder liner
      const linerGeo = new THREE.CylinderGeometry(0.54, 0.54, 2.8, 20, 1, true)
      const liner = new THREE.Mesh(
        linerGeo,
        new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.9, roughness: 0.3, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
      )
      bore.add(liner)

      // Piston
      const pistonGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.55, 20)
      const piston = new THREE.Mesh(pistonGeo, pistonMat)
      piston.position.set(xPos, 1.4, bank * 1.1)
      piston.castShadow = true
      engineGroup.add(piston)
      pistons.push(piston)

      // Connecting rod
      const rodGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.6, 8)
      const rod = new THREE.Mesh(rodGeo, crankMat)
      rod.position.set(xPos, 0.4, bank * 1.1)
      engineGroup.add(rod)
      conrods.push(rod)

      // Fire light per cylinder (off by default)
      const fireLight = new THREE.PointLight(0xff6600, 0, 2.5)
      fireLight.position.set(xPos, 2.2, bank * 1.1)
      engineGroup.add(fireLight)
      cylinderFireLights.push(fireLight)
    }

    stateRef.current.pistons = pistons
    stateRef.current.conrods = conrods
    stateRef.current.cylinderFireLights = cylinderFireLights

    // ── INTAKE MANIFOLD ───────────────────────────────────────────────────────
    const manifoldMat = new THREE.MeshStandardMaterial({ color: 0x0a1520, metalness: 0.7, roughness: 0.4 })
    for (let i = 0; i < 8; i++) {
      const bank = i < 4 ? -1 : 1
      const cylIdx = i < 4 ? i : i - 4
      const xPos = CYL_OFFSET + (i < 4 ? i : cylIdx + 0.95) * CYL_SPACING
      const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8)
      const tube = new THREE.Mesh(tubeGeo, manifoldMat)
      tube.position.set(xPos, 2.8, bank * 0.5)
      tube.rotation.z = bank * 0.3
      engineGroup.add(tube)
    }

    // ── EXHAUST HEADERS ───────────────────────────────────────────────────────
    const exMat = new THREE.MeshStandardMaterial({ color: 0x4a2000, metalness: 0.8, roughness: 0.5, emissive: 0x1a0800 })
    for (let i = 0; i < 8; i++) {
      const bank = i < 4 ? -1 : 1
      const cylIdx = i < 4 ? i : i - 4
      const xPos = CYL_OFFSET + (i < 4 ? i : cylIdx + 0.95) * CYL_SPACING
      const hdrGeo = new THREE.CylinderGeometry(0.1, 0.14, 1.0, 8)
      const hdr = new THREE.Mesh(hdrGeo, exMat)
      hdr.position.set(xPos, 1.0, bank * 1.8)
      hdr.rotation.x = bank * 0.4
      engineGroup.add(hdr)
    }

    // ── VALVE COVERS ──────────────────────────────────────────────────────────
    const vcMat = new THREE.MeshStandardMaterial({ color: 0x0d1a28, metalness: 0.8, roughness: 0.3 })
    const vcGeoL = new THREE.BoxGeometry(7.8, 0.3, 1.0)
    const vcL = new THREE.Mesh(vcGeoL, vcMat)
    vcL.position.set(0, 3.2, -1.1)
    engineGroup.add(vcL)
    const vcR = new THREE.Mesh(vcGeoL.clone(), vcMat)
    vcR.position.set(0, 3.2, 1.1)
    engineGroup.add(vcR)

    // Decorative fins on valve covers
    for (let i = 0; i < 14; i++) {
      const finGeo = new THREE.BoxGeometry(0.06, 0.25, 0.9)
      const fin = new THREE.Mesh(finGeo, new THREE.MeshStandardMaterial({ color: 0x1a3040, metalness: 0.9, roughness: 0.2 }))
      fin.position.set(-3.4 + i * 0.52, 3.35, -1.1)
      engineGroup.add(fin)
      const finR = fin.clone()
      finR.position.z = 1.1
      engineGroup.add(finR)
    }

    // ── OIL PAN ───────────────────────────────────────────────────────────────
    const panGeo = new THREE.BoxGeometry(8.0, 0.6, 2.8)
    const pan = new THREE.Mesh(panGeo, engineMetal)
    pan.position.set(0, -2.0, 0)
    pan.add(new THREE.Mesh(panGeo, neonWireMat))
    engineGroup.add(pan)

    // ── BELT DRIVE (front) ────────────────────────────────────────────────────
    const beltGroup = new THREE.Group()
    beltGroup.position.set(-4.6, 0, 0)
    beltGroup.rotation.y = Math.PI / 2
    engineGroup.add(beltGroup)

    const pulleyGeo = new THREE.TorusGeometry(0.6, 0.06, 8, 32)
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.9, roughness: 0.2 })
    const mainPulley = new THREE.Mesh(pulleyGeo, pulleyMat)
    beltGroup.add(mainPulley)

    const altPulley = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.05, 8, 24),
      pulleyMat
    )
    altPulley.position.set(0, 1.5, 0)
    beltGroup.add(altPulley)

    // ── GRID FLOOR ────────────────────────────────────────────────────────────
    const gridHelper = new THREE.GridHelper(30, 30, 0x0a1a2a, 0x0a1a2a)
    gridHelper.position.y = -4
    gridHelper.material = new THREE.LineBasicMaterial({ color: 0x0d2535, transparent: true, opacity: 0.6 })
    scene.add(gridHelper)

    // ── SKILL LABELS (CSS2D-style via canvas sprites) ──────────────────────────
    for (let i = 0; i < 8; i++) {
      const bank = i < 4 ? -1 : 1
      const cylIdx = i < 4 ? i : i - 4
      const xPos = CYL_OFFSET + (i < 4 ? i : cylIdx + 0.95) * CYL_SPACING

      const canvas2 = document.createElement('canvas')
      canvas2.width = 256; canvas2.height = 64
      const ctx2 = canvas2.getContext('2d')!
      ctx2.fillStyle = 'rgba(0,0,0,0)'
      ctx2.clearRect(0, 0, 256, 64)
      ctx2.fillStyle = '#00d4aa'
      ctx2.font = 'bold 22px Courier New'
      ctx2.textAlign = 'center'
      ctx2.shadowColor = '#00d4aa'
      ctx2.shadowBlur = 8
      ctx2.fillText(SKILLS[i], 128, 40)
      const tex = new THREE.CanvasTexture(canvas2)
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.set(xPos, 4.2, bank * 1.4)
      sprite.scale.set(2.5, 0.6, 1)
      engineGroup.add(sprite)
    }

    // ── GLOWING RINGS (More Detail) ───────────────────────────────────────────
    const ringsGroup = new THREE.Group()
    engineGroup.add(ringsGroup)
    stateRef.current.rings = ringsGroup

    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(6 + i * 0.8, 0.02, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? 0x00d4aa : 0x7c3aed, 
        transparent: true, 
        opacity: 0.3 
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ringsGroup.add(ring)
    }

    // ── PARTICLE SYSTEM GEOMETRY ──────────────────────────────────────────────
    // Pre-pool for exhaust/fire particles managed in update loop

    // ── MOUSE DRAG (Replaced with OrbitControls) ──────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 2.0
    controls.enablePan = false
    controls.minDistance = 5
    controls.maxDistance = 30
    
    // Stop auto-rotate when user interacts
    const onInteraction = () => { controls.autoRotate = false }
    controls.addEventListener('start', onInteraction)

    // ── RESIZE ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── ANIMATION LOOP ────────────────────────────────────────────────────────
    let lastTs = 0
    let phaseTimer = 0
    const PHASE_DURATIONS: Record<string, number> = {
      heartbeat: 3000, reveal: 3500, idle: 2500, revup: 3500, nitro: 4500, launch: 2200
    }
    const PHASE_ORDER = ['heartbeat', 'reveal', 'idle', 'revup', 'nitro', 'launch']

    const advancePhase = (current: string) => {
      const idx = PHASE_ORDER.indexOf(current)
      if (idx < PHASE_ORDER.length - 1) {
        const next = PHASE_ORDER[idx + 1]
        stateRef.current.phase = next
        setPhase(next as any)
        phaseTimer = 0
      } else {
        onComplete()
      }
    }

    const animate = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05)
      lastTs = ts
      const S = stateRef.current
      S.t += dt
      phaseTimer += dt * 1000

      const p = S.phase
      const dur = PHASE_DURATIONS[p] || 3000

      // ── TARGET RPM/SPEED by phase ──
      let targetRPM = 0
      if (p === 'idle') targetRPM = 850
      else if (p === 'revup') targetRPM = 850 + (phaseTimer / dur) * 5500
      else if (p === 'nitro') targetRPM = 7200
      else if (p === 'launch') targetRPM = 8200

      S.rpm += (targetRPM - S.rpm) * Math.min(1, dt * 2.5)
      const targetSpeed = p === 'revup' ? (phaseTimer / dur) * 140
        : p === 'nitro' ? 140 + (phaseTimer / dur) * 180
        : p === 'launch' ? 320
        : 0
      S.speed += (targetSpeed - S.speed) * Math.min(1, dt * 2)
      setRpm(Math.round(S.rpm))
      setSpeed(Math.round(S.speed))

      // ── CRANK ANGLE ──
      const rps = S.rpm / 60
      S.crankAngle += rps * dt * Math.PI * 2

      // ── PISTON / CONROD ANIMATION ──
      const throwR = 0.75
      const rodLen = 1.6
      const CYL_SPACING_VAL = 1.9
      const CYL_OFFSET_VAL = -3.3

      for (let i = 0; i < 8; i++) {
        const bank = i < 4 ? -1 : 1
        const cylIdx = i < 4 ? i : i - 4
        const xBase = CYL_OFFSET_VAL + (i < 4 ? i : cylIdx + 0.95) * CYL_SPACING_VAL
        const phaseOff = (FIRING_ORDER[i] / 8) * Math.PI * 4
        const angle = S.crankAngle + phaseOff
        const crankY = Math.sin(angle) * throwR
        const crankZ = Math.cos(angle) * throwR * bank
        const pistonY = crankY + Math.sqrt(rodLen * rodLen - crankZ * crankZ)

        if (S.pistons[i]) {
          S.pistons[i].position.y = 1.0 + pistonY * 0.7
          S.pistons[i].position.x = xBase
          S.pistons[i].position.z = bank * 1.1
        }

        if (S.conrods[i]) {
          S.conrods[i].position.y = 0.2 + pistonY * 0.35
          S.conrods[i].rotation.x = crankZ * 0.25
        }

        // Fire light intensity
        const firePhase = (angle % (Math.PI * 2)) / (Math.PI * 2)
        const isNearTDC = firePhase < 0.12 || firePhase > 0.92
        if (S.cylinderFireLights[i]) {
          const baseIntensity = p === 'idle' ? 0.8
            : p === 'revup' ? 1.5 * (phaseTimer / dur)
            : p === 'nitro' || p === 'launch' ? 3.5
            : 0
          S.cylinderFireLights[i].intensity = isNearTDC && p !== 'heartbeat' && p !== 'reveal'
            ? baseIntensity * (0.7 + Math.random() * 0.3)
            : 0
          if (isNearTDC && S.rpm > 500) setActiveCyl(i)
        }
      }

      // ── ENGINE GROUP ROTATION ──
      if (engineGroup) {
        const shake = p === 'launch' ? 0.008 : p === 'nitro' ? 0.004 : 0
        engineGroup.rotation.y = (Math.random() - 0.5) * shake
        engineGroup.rotation.x = (Math.random() - 0.5) * shake * 0.5
        // Reveal fade in
        if (p === 'reveal') {
          const prog = Math.min(1, phaseTimer / 1500)
          engineGroup.scale.setScalar(0.3 + prog * 0.7)
        } else if (engineGroup.scale.x < 1) {
          engineGroup.scale.setScalar(1)
        }
      }

      // Animate extra detail rings
      if (S.rings) {
        S.rings.rotation.y += dt * 0.5
        S.rings.rotation.x += dt * 0.2
        S.rings.children.forEach((child, i) => {
          child.rotation.x = Math.sin(S.t * 2 + i) * 0.2 + Math.PI / 2
        })
      }

      // ── NITRO STATE ──
      if (p === 'nitro') {
        const nIdx = Math.floor(phaseTimer / 1000) % NITROS.length
        if (nIdx !== S.nitroIdx) {
          S.nitroIdx = nIdx
          setNitroName(NITROS[nIdx].name)
          setNitroColor(NITROS[nIdx].hex)
        }
        setNitroVisible(true)
        // Tint fire lights with nitro color
        S.cylinderFireLights.forEach(l => { l.color.setHex(NITROS[nIdx].color) })
      } else {
        setNitroVisible(false)
        S.cylinderFireLights.forEach(l => { l.color.setHex(0xff6600) })
      }

      // ── LAUNCH PROGRESS ──
      if (p === 'launch') {
        const lp = Math.min(1, phaseTimer / dur)
        S.launchPct = lp
        setLaunchPct(lp)
        // white flash at end
        scene.background = new THREE.Color().lerpColors(
          new THREE.Color(0x020812),
          new THREE.Color(0xffffff),
          lp > 0.85 ? (lp - 0.85) / 0.15 : 0
        )
      }

      // ── HEARTBEAT: engine not visible yet ──
      if (p === 'heartbeat' && engineGroup) {
        engineGroup.visible = false
      } else if (engineGroup) {
        engineGroup.visible = true
      }

      // ── PHASE ADVANCE ──
      if (phaseTimer > dur) advancePhase(p)

      // OrbitControls update
      if (p !== 'heartbeat') {
        controls.update()
      }

      renderer.render(scene, camera)
      const id = requestAnimationFrame(animate)
      stateRef.current.t = S.t  // keep ref in sync
      ;(sceneRef as any).current = { ...sceneRef.current, animId: id }
    }

    const animId = requestAnimationFrame(animate)
    sceneRef.current = { renderer, scene, camera, animId }

    return () => {
      cancelAnimationFrame(animId)
      controls.removeEventListener('start', onInteraction)
      controls.dispose()
      renderer.dispose()
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
      {/* Three.js mount */}
      <div ref={mountRef} className="absolute inset-0" style={{ cursor: 'grab' }} />

      {/* HUD: Corner brackets */}
      {(['tl','tr','bl','br'] as const).map(c => (
        <div key={c} className="absolute w-10 h-10 pointer-events-none"
          style={{
            top: c.startsWith('t') ? 16 : undefined,
            bottom: c.startsWith('b') ? 16 : undefined,
            left: c.endsWith('l') ? 16 : undefined,
            right: c.endsWith('r') ? 16 : undefined,
            borderTop: c.startsWith('t') ? '2px solid #00d4aa' : undefined,
            borderBottom: c.startsWith('b') ? '2px solid #00d4aa' : undefined,
            borderLeft: c.endsWith('l') ? '2px solid #00d4aa' : undefined,
            borderRight: c.endsWith('r') ? '2px solid #00d4aa' : undefined,
          }} />
      ))}

      {/* HUD: Phase + Title */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div style={{ color: '#00d4aa', fontSize: 11, fontFamily: 'Courier New', letterSpacing: 3 }}>
          JAY WANI // PORTFOLIO ENGINE
        </div>
        <div style={{ color: '#334455', fontSize: 10, fontFamily: 'Courier New', marginTop: 2 }}>
          PHASE: {phase.toUpperCase()}
        </div>
      </div>

      {/* HUD: Heartbeat ECG canvas removed per user request */}

      {/* HUD: Drag hint */}
      {(phase === 'idle' || phase === 'revup') && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ color: 'rgba(0,212,170,0.4)', fontSize: 11, fontFamily: 'Courier New', letterSpacing: 2 }}>
          ↔ DRAG TO ROTATE ENGINE
        </div>
      )}

      {/* HUD: RPM Gauge */}
      {phase !== 'heartbeat' && (
        <RPMGauge rpm={rpm} />
      )}

      {/* HUD: Speedometer */}
      {phase !== 'heartbeat' && (
        <Speedometer speed={speed} />
      )}

      {/* NITRO DISPLAY */}
      {nitroVisible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ animation: 'nitropulse 0.3s ease infinite alternate' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Courier New', letterSpacing: 4, marginBottom: 8 }}>
              NITRO OVERRIDE
            </div>
            <div style={{
              fontSize: 52, fontWeight: 900, fontFamily: 'Courier New',
              color: nitroColor, textShadow: `0 0 40px ${nitroColor}, 0 0 80px ${nitroColor}88`,
              letterSpacing: 3,
            }}>
              {nitroName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Courier New', marginTop: 8, letterSpacing: 6 }}>
              SYSTEM OVERRIDE ENGAGED
            </div>
          </div>
        </div>
      )}

      {/* LAUNCH PROGRESS */}
      {phase === 'launch' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(0,212,170,0.6)', fontSize: 10, fontFamily: 'Courier New', letterSpacing: 2 }}>LOADING PORTFOLIO</span>
            <span style={{ color: '#00d4aa', fontSize: 10, fontFamily: 'Courier New' }}>{Math.round(launchPct * 100)}%</span>
          </div>
          <div style={{ height: 3, background: '#0a1a2a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, #7c3aed, #00d4aa)',
              width: `${launchPct * 100}%`,
              transition: 'width 0.1s linear',
              boxShadow: '0 0 10px #00d4aa88',
            }} />
          </div>
        </div>
      )}

      {/* SKIP */}
      <button onClick={onComplete}
        className="absolute bottom-6 right-6 z-10"
        style={{
          background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.3)',
          color: '#00d4aa', padding: '6px 18px', borderRadius: 4,
          fontSize: 11, fontFamily: 'Courier New', letterSpacing: 2, cursor: 'pointer'
        }}>
        SKIP INTRO ▶
      </button>

      <style>{`
        @keyframes nitropulse { from { transform: scale(1); } to { transform: scale(1.03); } }
      `}</style>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────



function RPMGauge({ rpm }: { rpm: number }) {
  const cRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = cRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    c.width = 160; c.height = 160
    ctx.clearRect(0, 0, 160, 160)
    const cx = 80, cy = 80, r = 65
    const start = -Math.PI * 0.8, end = start + Math.PI * 1.6
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(124,58,237,0.15)'; ctx.lineWidth = 2; ctx.stroke()
    const rpmAngle = start + (Math.min(rpm, 8000) / 8000) * Math.PI * 1.6
    ctx.beginPath(); ctx.arc(cx, cy, r, start, rpmAngle)
    ctx.strokeStyle = rpm > 6000 ? '#ef4444' : '#7c3aed'
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke()
    // Needle
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rpmAngle)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -r + 10); ctx.stroke()
    ctx.restore()
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 18px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText((rpm / 1000).toFixed(1) + 'k', cx, cy + 22)
    ctx.fillStyle = 'rgba(124,58,237,0.4)'; ctx.font = '9px Courier New'
    ctx.fillText('RPM', cx, cy + 35)
  }, [rpm])
  return <canvas ref={cRef} style={{ position: 'absolute', bottom: 24, left: 24, width: 130, height: 130 }} />
}

function Speedometer({ speed }: { speed: number }) {
  const cRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = cRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    c.width = 200; c.height = 200
    ctx.clearRect(0, 0, 200, 200)
    const cx = 100, cy = 100, r = 82
    const start = -Math.PI * 0.8, end = start + Math.PI * 1.6
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,212,170,0.12)'; ctx.lineWidth = 2; ctx.stroke()
    const maxSpeed = 320
    const sAngle = start + (Math.min(speed, maxSpeed) / maxSpeed) * Math.PI * 1.6
    ctx.beginPath(); ctx.arc(cx, cy, r, start, sAngle)
    ctx.strokeStyle = speed > 250 ? '#ef4444' : speed > 150 ? '#f97316' : '#00d4aa'
    ctx.lineWidth = 6; ctx.lineCap = 'round'
    ctx.shadowColor = '#00d4aa'; ctx.shadowBlur = 10
    ctx.stroke()
    // Needle
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(sAngle)
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8
    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -r + 12); ctx.stroke()
    ctx.restore()
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    // Tick marks
    for (let i = 0; i <= 16; i++) {
      const a = start + (i / 16) * Math.PI * 1.6
      const isMaj = i % 4 === 0
      const x1 = cx + Math.cos(a) * (r - (isMaj ? 12 : 6))
      const y1 = cy + Math.sin(a) * (r - (isMaj ? 12 : 6))
      const x2 = cx + Math.cos(a) * (r - 1)
      const y2 = cy + Math.sin(a) * (r - 1)
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
      ctx.strokeStyle = isMaj ? 'rgba(0,212,170,0.7)' : 'rgba(0,212,170,0.25)'
      ctx.lineWidth = isMaj ? 2 : 1; ctx.shadowBlur = 0; ctx.stroke()
      if (isMaj) {
        const lx = cx + Math.cos(a) * (r - 24)
        const ly = cy + Math.sin(a) * (r - 24)
        ctx.fillStyle = 'rgba(0,212,170,0.55)'; ctx.font = '9px Courier New'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(Math.round(i / 16 * maxSpeed)), lx, ly)
      }
    }
    ctx.fillStyle = '#00d4aa'; ctx.font = 'bold 26px Courier New'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.shadowColor = '#00d4aa'; ctx.shadowBlur = 12
    ctx.fillText(String(Math.round(speed)), cx, cy + 24)
    ctx.fillStyle = 'rgba(0,212,170,0.4)'; ctx.font = '10px Courier New'
    ctx.shadowBlur = 0; ctx.fillText('km/h', cx, cy + 42)
  }, [speed])
  return <canvas ref={cRef} style={{ position: 'absolute', bottom: 16, right: 20, width: 160, height: 160 }} />
}
