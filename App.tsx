import React, { Suspense, useState, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import ControlPanel from "./components/ControlPanel"
import MaterialSummary from "./components/MaterialSummary"
import QuoteForm from "./components/QuoteForm"
import Scene3D from "./components/Scene3D"
import { FenceConfig, FenceColor, TrellisType, FenceShape } from "./types"

const INITIAL_CONFIG: FenceConfig = {
  panelColor: FenceColor.GREEN,
  postColor: FenceColor.GREEN,
  trellisColor: FenceColor.GREEN,
  height: 1800,
  width: 6,
  depth: 2,
  trellisType: TrellisType.NONE,
  shape: FenceShape.STRAIGHT,
  gateMode: false,
  selectedGate: null,
  gates: [],
  rotationLock: false,
  grassEnabled: false,
}

const App: React.FC = () => {
  const [config, setConfig] = useState<FenceConfig>(INITIAL_CONFIG)
  const [view, setView] = useState<'config' | 'summary' | 'quote'>('config')
  
  // ✅ PERSISTENT STATE FOR NOTES
  const [specialRequests, setSpecialRequests] = useState("")

  const materials = useMemo(() => {
    const PANEL_LENGTH = 2.5
    let totalSegments = 0
    const sides: number[] = []

    if (config.shape === FenceShape.STRAIGHT) sides.push(config.width)
    else if (config.shape === FenceShape.L_SHAPE) sides.push(config.width, config.depth)
    else if (config.shape === FenceShape.U_SHAPE) sides.push(config.width, config.depth, config.width)
    else if (config.shape === FenceShape.RECTANGLE) sides.push(config.width, config.depth, config.width, config.depth)

    sides.forEach(side => {
      let filled = 0
      while (filled < side - 0.05) {
        const isGate = config.gates.find(g => g.segmentIndex === totalSegments)
        filled += isGate ? isGate.type / 1000 : Math.min(PANEL_LENGTH, side - filled)
        totalSegments++
      }
    })

    return {
      panels: totalSegments - config.gates.length,
      posts: config.shape === FenceShape.RECTANGLE ? totalSegments : totalSegments + 1,
      fixings: totalSegments * 4,
      gates: config.gates.length,
      totalSegments,
    }
  }, [config])

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden relative font-sans bg-gray-900">
      <main className="flex-1 relative w-full h-full bg-gradient-to-b from-blue-50 to-white">
        <Canvas shadows camera={{ position: [5, 5, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene3D config={config} setConfig={setConfig} />
          </Suspense>
        </Canvas>
      </main>

      <aside className="w-[400px] bg-[#F5F5DC] shadow-2xl h-full flex flex-col">
        {view === 'config' && (
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            onRequestQuote={() => setView('summary')} 
          />
        )}

        {view === 'summary' && (
          <MaterialSummary 
            config={config} 
            notes={specialRequests}           
            setNotes={setSpecialRequests}     
            onBack={() => setView('config')} 
            onNext={() => setView('quote')} 
          />
        )}

        {view === 'quote' && (
          <QuoteForm 
            config={config} 
            materials={materials}
            specialRequests={specialRequests} 
            onBack={() => setView('summary')} 
          />
        )}
      </aside>
    </div>
  )
}

export default App