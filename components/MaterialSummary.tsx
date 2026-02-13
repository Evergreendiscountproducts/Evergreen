import React, { useMemo } from "react";
import { FenceConfig, FenceShape } from "../types";

interface Props {
  config: FenceConfig;
  notes: string;
  setNotes: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MaterialSummary({ config, notes, setNotes, onNext, onBack }: Props) {
  const summary = useMemo(() => {
    const PANEL_LENGTH = 2.5;
    let totalSegments = 0;
    const sides: number[] = [];

    if (config.shape === FenceShape.STRAIGHT) sides.push(config.width);
    else if (config.shape === FenceShape.L_SHAPE) sides.push(config.width, config.depth);
    else if (config.shape === FenceShape.U_SHAPE) sides.push(config.width, config.depth, config.width);
    else if (config.shape === FenceShape.RECTANGLE) sides.push(config.width, config.depth, config.width, config.depth);

    sides.forEach((sideLength) => {
      let filled = 0;
      while (filled < sideLength - 0.05) {
        const isGate = config.gates.find((g) => g.segmentIndex === totalSegments);
        const itemWidth = isGate ? isGate.type / 1000 : Math.min(PANEL_LENGTH, sideLength - filled);
        filled += itemWidth;
        totalSegments++;
      }
    });

    const gateCount = config.gates.length;
    const panelCount = totalSegments - gateCount;
    
    // ✅ CHANGED: Logic updated to strictly "Panel Count + 1 = Post Count" (unless Rectangle/Loop)
    // Previously calculated based on totalSegments which caused +2 when gates were present.
    const postCount = config.shape === FenceShape.RECTANGLE ? panelCount : panelCount + 1;
    
    const fixingsCount = totalSegments * 4;

    return { panelCount, gateCount, postCount, fixingsCount };
  }, [config]);

  return (
    <div className="flex flex-col h-full bg-[#F5F5DC]">
      <div className="p-6 border-b border-slate-200 bg-white/50">
        <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
          ← Back to Edit
        </button>
        <h2 className="text-xl font-bold text-slate-800">Material Summary</h2>
        <p className="text-sm text-slate-500">Review your material list before requesting a quote.</p>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        <SummaryItem label="Fence Panels" count={summary.panelCount} sub={`${config.height}mm height`} />
        <SummaryItem label="Fence Posts" count={summary.postCount} sub="Standard steel posts" />
        <SummaryItem label="Secure Fixings" count={summary.fixingsCount} sub="Anti-tamper bolts" />

        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-md">
          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider leading-none mb-2">
            Special Requests / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Need extra posts, clumps, or specific delivery instructions? Leave a note here."
            className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24 placeholder:text-slate-300"
          />
        </div>

        {summary.gateCount > 0 && (
          <SummaryItem label="Custom Gates" count={summary.gateCount} sub="As placed in 3D" isHighlight />
        )}

        <div className="mt-8 p-4 bg-white/40 border border-slate-200 rounded text-[11px] text-slate-500 leading-relaxed italic">
          * Materials are estimated based on your 3D configuration. A final audit will be performed by our sales team.
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white">
        <button
          onClick={onNext}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          Confirm & Get Quote →
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, count, sub, isHighlight = false }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isHighlight ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
      <div>
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{label}</div>
        <div className="text-xs text-slate-500">{sub}</div>
      </div>
      <div className="text-2xl font-black text-slate-800">{count}</div>
    </div>
  );
}