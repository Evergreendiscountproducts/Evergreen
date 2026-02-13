import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

interface FenceSceneProps {
  width: number
  depth: number
  color: string
  shape: "straight" | "rectangle" | "lshape" | "ushape"
}

const PANEL_WIDTH = 2.5
const MODEL_SCALE = 0.001

const FenceScene: React.FC<FenceSceneProps> = ({ width, depth, color, shape }) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const panelModelRef = useRef<THREE.Group | null>(null)
  const fenceGroupRef = useRef(new THREE.Group())

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8f0e8)

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 2000)
    camera.position.set(10, 7, 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 20, 10)
    scene.add(light)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x7da87d })
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)
    scene.add(new THREE.GridHelper(50, 50))
    scene.add(fenceGroupRef.current)

    const loader = new GLTFLoader()
    loader.load("/models/fence_panel_full_1800.glb",
      gltf => {
        const model = gltf.scene
        model.scale.setScalar(MODEL_SCALE)

        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x -= center.x
        model.position.z -= center.z
        model.position.y -= box.min.y

        panelModelRef.current = model
        buildFence()
      },
      undefined,
      err => console.error("Model failed to load", err)
    )

    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (panelModelRef.current) buildFence()
  }, [width, depth, color, shape])

  function buildFence() {
    const group = fenceGroupRef.current
    group.clear()

    const segments: [THREE.Vector3, THREE.Vector3][] = []

    if (shape === "straight")
      segments.push([v(-width / 2, 0, 0), v(width / 2, 0, 0)])

    if (shape === "rectangle") {
      segments.push([v(-width / 2, 0, -depth / 2), v(width / 2, 0, -depth / 2)])
      segments.push([v(width / 2, 0, -depth / 2), v(width / 2, 0, depth / 2)])
      segments.push([v(width / 2, 0, depth / 2), v(-width / 2, 0, depth / 2)])
      segments.push([v(-width / 2, 0, depth / 2), v(-width / 2, 0, -depth / 2)])
    }

    segments.forEach(([start, end]) => buildRun(start, end))
    centerFence()
  }

  function buildRun(start: THREE.Vector3, end: THREE.Vector3) {
    const dir = new THREE.Vector3().subVectors(end, start)
    const length = dir.length()
    dir.normalize()
    const angle = Math.atan2(dir.x, dir.z)
    const count = Math.floor(length / PANEL_WIDTH)

    for (let i = 0; i < count; i++) {
      const pos = start.clone().add(dir.clone().multiplyScalar(i * PANEL_WIDTH))
      const panel = panelModelRef.current!.clone(true)

      panel.position.copy(pos)
      panel.rotation.y = angle

      panel.traverse(obj => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh
          mesh.material = (mesh.material as THREE.Material).clone()
            ; (mesh.material as THREE.MeshStandardMaterial).color.set(color)
        }
      })

      fenceGroupRef.current.add(panel)
    }
  }

  function centerFence() {
    const box = new THREE.Box3().setFromObject(fenceGroupRef.current)
    const center = box.getCenter(new THREE.Vector3())
    fenceGroupRef.current.position.sub(center)
  }

  function v(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z)
  }

  return <div ref={mountRef} className="w-full h-full" />
}

export default FenceScene
