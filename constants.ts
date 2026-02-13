import { FenceColor, TrellisType, FenceShape } from './types';

// Visual representation colors (CSS hex values)
export const COLOR_MAP: Record<FenceColor, string> = {
  [FenceColor.GREEN]: '#2F4F2F',
  [FenceColor.BROWN]: '#5D4037',
  [FenceColor.GREY]: '#616161',
};

// Available Heights in mm
export const AVAILABLE_HEIGHTS = [1200, 1800];

export const AVAILABLE_COLORS = [
  { label: 'Green', value: FenceColor.GREEN, hex: COLOR_MAP[FenceColor.GREEN] },
  { label: 'Brown', value: FenceColor.BROWN, hex: COLOR_MAP[FenceColor.BROWN] },
  { label: 'Grey', value: FenceColor.GREY, hex: COLOR_MAP[FenceColor.GREY] },
];

export const SHAPE_OPTIONS = [
  { label: 'Straight', value: FenceShape.STRAIGHT },
  { label: 'L-Shape', value: FenceShape.L_SHAPE },
  { label: 'U-Shape', value: FenceShape.U_SHAPE },
  { label: 'Rectangle', value: FenceShape.RECTANGLE },
];

export const TRELLIS_OPTIONS = [
  { label: 'No Trellis', value: TrellisType.NONE },
  { label: 'Square Lattice', value: TrellisType.SQUARE },
  { label: 'Diamond Lattice', value: TrellisType.DIAMOND },
  { label: 'Loop Top', value: TrellisType.LOOP },
];

// Costs (Mock data for estimation)
export const PRICE_PER_PANEL = 120; // Base price
export const PRICE_TRELLIS = 45;
export const PRICE_POST = 30;