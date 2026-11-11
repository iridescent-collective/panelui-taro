export const AVATAR_SIZE_POINTS = { lg: 56, md: 40, sm: 32, xl: 80 } as const;

export type AvatarSizeName = keyof typeof AVATAR_SIZE_POINTS;

export const AVATAR_GROUP_OVERLAP_RATIO = 0.32;

export const avatarGroupOverlap = (
  size: AvatarSizeName,
  overlap?: number
): number => {
  const diameter = AVATAR_SIZE_POINTS[size] ?? AVATAR_SIZE_POINTS.md;
  if (overlap === undefined || !Number.isFinite(overlap)) {
    return Math.round(diameter * AVATAR_GROUP_OVERLAP_RATIO);
  }
  return Math.min(Math.max(overlap, 0), diameter);
};

export interface AvatarGroupCount {
  visible: number;

  overflow: number;
}

export const avatarGroupCount = (
  count: number,
  max?: number,
  total?: number
): AvatarGroupCount => {
  const people = Number.isFinite(count) ? Math.max(Math.trunc(count), 0) : 0;

  const capped =
    max !== undefined && Number.isFinite(max) && max >= 1
      ? Math.min(Math.trunc(max), people)
      : people;

  const population =
    total !== undefined && Number.isFinite(total)
      ? Math.max(Math.trunc(total), people)
      : people;

  return { overflow: Math.max(population - capped, 0), visible: capped };
};
