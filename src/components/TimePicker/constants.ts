export const ROW_HEIGHT = 44;
export const COLUMN_HEIGHT = ROW_HEIGHT * 5;
export const TICK_SPACING = 12;
export const HAND_SPRING = { damping: 16, mass: 0.7, stiffness: 140 } as const;
export const FACE_SIZE = 132;
export const FACE_CENTRE = FACE_SIZE / 2;
export const DEFAULT_STEP = { clock: 30, ruler: 15, wheel: 1 } as const;
