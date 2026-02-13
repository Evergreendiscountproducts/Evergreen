import React from "react"
import { FenceConfig, FenceColor, FenceShape, GateType } from "../types"

interface Props {
  config: FenceConfig
  setConfig: React.Dispatch<React.SetStateAction<FenceConfig>>
  onRequestQuote: () => void
}

const GateIcon = ({ type, isDouble }: { type: number, isDouble: boolean }) => {
  const strokeColor = "#475569"
  return (
    <div className="h-16 w-full flex items-center justify-center bg-slate-50 rounded-t border-b border-slate-100 overflow-hidden relative">
      <svg viewBox="0 0 100 80" className="w-full h-full p-2" preserveAspectRatio="xMidYMid meet">
        <line x1="0" y1="75" x2="100" y2="75" stroke="#cbd5e1" strokeWidth="2" />
        {isDouble ? (
          <g>
            <rect x="10" y="20" width="38" height="55" fill="none" stroke={strokeColor} strokeWidth="2" />
            <line x1="20" y1="20" x2="20" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="30" y1="20" x2="30" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="40" y1="20" x2="40" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="44" y1="45" x2="48" y2="45" stroke="black" strokeWidth="2" />
            <rect x="52" y="20" width="38" height="55" fill="none" stroke={strokeColor} strokeWidth="2" />
            <line x1="62" y1="20" x2="62" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="72" y1="20" x2="72" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="82" y1="20" x2="82" y2="75" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="52" y1="45" x2="56" y2="45" stroke="black" strokeWidth="2" />
          </g>
        ) : (
          <g>
            <rect
              x={type === 1200 ? "30" : "20"}
              y="20"
              width={type === 1200 ? "40" : "60"}
              height="55"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
            />
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1={(type === 1200 ? 30 : 20) + ((i + 1) * (type === 1200 ? 7 : 10))}
                y1="20"
                x2={(type === 1200 ? 30 : 20) + ((i + 1) * (type === 1200 ? 7 : 10))}
                y2="75"
                stroke={strokeColor}
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
            <line
              x1={type === 1200 ? "65" : "75"}
              y1="45"
              x2={type === 1200 ? "70" : "80"}
              y2="45"
              stroke="black"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  )
}

export default function ControlPanel({ config, setConfig, onRequestQuote }: Props) {
  const PANEL_ESTIMATE_WIDTH = 2.5;
  const MAX_LIMIT = 200;

  const setShape = (newShape: FenceShape) => {
    setConfig((prev) => ({
      ...prev,
      shape: newShape,
    }));
  };

  const minLengthRequired = config.gates.reduce((max, gate) => {
    const positionEnd = (gate.segmentIndex + 1) * PANEL_ESTIMATE_WIDTH;
    return Math.max(max, positionEnd);
  }, 0);

  const setLength = (val: number) => {
    let finalVal = isNaN(val) ? 0 : val;
    
    // Enforce Max Limit
    if (finalVal > MAX_LIMIT) finalVal = MAX_LIMIT;

    // Enforce Min Limit (if gates exist and input isn't zero)
    if (finalVal !== 0 && finalVal < minLengthRequired) {
      setConfig(prev => ({ ...prev, width: minLengthRequired }));
      return;
    }
    setConfig(prev => ({ ...prev, width: finalVal }));
  }

  const setDepth = (val: number) => {
    let finalVal = isNaN(val) ? 0 : val;
    if (finalVal > MAX_LIMIT) finalVal = MAX_LIMIT;
    setConfig(prev => ({ ...prev, depth: finalVal }));
  }

  const setHeight = (val: number) => setConfig(prev => ({ ...prev, height: val }))
  const setColor = (color: FenceColor) => setConfig(prev => ({ ...prev, panelColor: color }))
  const setRotationLock = (locked: boolean) => setConfig(prev => ({ ...prev, rotationLock: locked }))

  const removeGate = (id: string) => {
    setConfig(prev => ({
      ...prev,
      gates: prev.gates.filter(g => g.id !== id),
    }))
  }

  const addGateImmediately = (type: GateType) => {
    setConfig(prev => {
      let targetIndex = 0
      const existingIndices = prev.gates.map(g => g.segmentIndex)

      while (existingIndices.includes(targetIndex) && targetIndex < 200) {
        targetIndex++
      }

      const requiredLength = (targetIndex + 1) * PANEL_ESTIMATE_WIDTH;
      let newWidth = prev.width;

      if (requiredLength > prev.width) {
        newWidth = Math.min(MAX_LIMIT, Math.ceil(requiredLength * 2) / 2);
      }

      return {
        ...prev,
        width: newWidth,
        gateMode: false,
        gates: [...prev.gates, { id: crypto.randomUUID(), type, segmentIndex: targetIndex }],
      }
    })
  }

  const GATE_OPTIONS = [
    { size: 1200, label: "Small Single", isDouble: false, text: "Small Single\n1200(h) x 1200(w)" },
    { size: 1500, label: "Medium Single", isDouble: false, text: "Medium Single\n1200(h) x 1500(w)" },
    { size: 2400, label: "Double Gate", isDouble: true, text: "Double Gate\n1800(h) x 2400(w)" },
  ]

  return (
    <div className="flex flex-col h-full bg-[#F5F5DC]">
      <div className="pt-8 px-6 pb-6 space-y-6 overflow-y-auto flex-1 text-slate-800">

        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="Company Logo" className="h-32 object-contain" />
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">Fence Configurator</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Layout</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(FenceShape).map(shape => (
                <button
                  key={shape}
                  onClick={() => setShape(shape)}
                  className={`p-2 text-sm font-medium border rounded transition-all ${config.shape === shape ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:border-slate-400"}`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Dimensions (Max 200m)</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Length (m)</span>
                  {config.width > 0 && config.width === minLengthRequired && <span className="text-[10px] font-normal text-orange-500">(Min limit by Gates)</span>}
                </div>
                <input
                  type="number"
                  min={0}
                  max={MAX_LIMIT}
                  step={0.5}
                  value={config.width === 0 ? "" : config.width}
                  placeholder="0"
                  onChange={e => setLength(parseFloat(e.target.value))}
                  className="w-full border border-slate-300 rounded p-2 text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {config.shape !== FenceShape.STRAIGHT && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Width (m)</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={MAX_LIMIT}
                    step={0.5}
                    value={config.depth === 0 ? "" : config.depth}
                    placeholder="0"
                    onChange={e => setDepth(parseFloat(e.target.value))}
                    className="w-full border border-slate-300 rounded p-2 text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between text-sm mb-1"><span>Height</span><span>{config.height}mm</span></div>
                <select value={config.height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full border p-2 rounded text-sm bg-white">
                  <option value={1800}>1800mm (6ft)</option>
                  <option value={1200}>1200mm (4ft)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Color</h3>
            <div className="flex gap-3 items-center">
              <button onClick={() => setColor(FenceColor.GREEN)} className="w-8 h-8 rounded-full border-2 ring-1 ring-offset-2 border-white ring-slate-900" style={{ backgroundColor: "#1f5f2e" }} />
              <span className="text-sm font-medium text-slate-600">Standard Green</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">View Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfig(prev => ({ ...prev, grassEnabled: !prev.grassEnabled }))}
                className={`p-2 text-sm font-medium border rounded transition-all ${config.grassEnabled ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:border-slate-400"}`}
              >
                3D Grass {config.grassEnabled ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => setRotationLock(!config.rotationLock)}
                className={`p-2 text-sm font-medium border rounded transition-all ${config.rotationLock ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:border-slate-400"}`}
              >
                Rotation {config.rotationLock ? "Locked" : "Free"}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold mb-1">Gates</h3>
              <p className="text-xs text-slate-500">Click to add. Drag in 3D to move.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {GATE_OPTIONS.map(gate => (
              <button key={gate.size} onClick={() => addGateImmediately(gate.size as GateType)} className={`group relative flex flex-col items-center border rounded-lg bg-white hover:ring-2 hover:ring-slate-400 hover:shadow-md transition-all ${gate.size === 2400 ? "col-span-2" : "col-span-1"}`}>
                <GateIcon type={gate.size} isDouble={gate.isDouble} />
                <div className="py-2 px-3 w-full text-left whitespace-pre-line">
                  <div className="text-xs font-bold text-slate-700">{gate.text.split('\n')[0]}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{gate.text.split('\n')[1]}</div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm">+</div>
              </button>
            ))}
          </div>

          {config.gates.length > 0 && (
            <div className="bg-slate-50 p-3 rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-slate-400">{config.gates.length} Gates Active</span>
                <button onClick={() => setConfig(c => ({ ...c, gates: [] }))} className="text-xs text-red-600 hover:underline">Clear All</button>
              </div>

              <div className="text-xs text-slate-700">
                {config.gates.map(g => (
                  <div key={g.id} className="flex justify-between items-center text-sm py-1 border-t">
                    <div>
                      <div>Gate {g.segmentIndex}</div>
                      <div className="font-mono text-xs text-slate-500">{g.type}mm</div>
                    </div>

                    <button onClick={() => removeGate(g.id)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <button onClick={onRequestQuote} className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transform active:scale-95 transition-all flex items-center justify-center gap-2">
          <span>Get Quote</span>
          <span className="text-slate-400">→</span>
        </button>
      </div>
    </div>
  )
}