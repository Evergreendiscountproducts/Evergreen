export enum FenceColor {
  GREEN = "Green",
  BROWN = "Brown",
  GREY = "Grey",
}

export enum FenceShape {
  STRAIGHT = "Straight",
  L_SHAPE = "L-Shape",
  U_SHAPE = "U-Shape",
  RECTANGLE = "Rectangle",
}

export enum TrellisType {
  NONE = "None",
  SQUARE = "Square",
  DIAMOND = "Diamond",
  LOOP = "Loop",
}

export type GateType = 1200 | 1500 | 2400;  // Changed from 1800 to 1500 for wide single gate

export interface PlacedGate {
  id: string
  type: GateType
  segmentIndex: number
}

export interface FenceConfig {
  panelColor: FenceColor;
  postColor: FenceColor;
  trellisColor: FenceColor;
  height: number;
  length: number;  // Changed from width
  width: number;   // Changed from depth
  trellisType: TrellisType;
  shape: FenceShape;
  gateMode: boolean;
  selectedGate: GateType | null;
  gates: Gate[];
  rotationLock: boolean;

  // 🌿 NEW — Grass toggle
  grassEnabled: boolean;
}
