export interface TourCardMeasurement {
  owner: object | undefined;
  height: number;
}
export const currentTourCardHeight = (
  owner: object | undefined,
  measurement: TourCardMeasurement | null
): number | null =>
  measurement && measurement.owner === owner ? measurement.height : null;
export const nextTourCardMeasurement = (
  owner: object | undefined,
  height: number,
  current: TourCardMeasurement | null
): TourCardMeasurement => {
  if (
    current &&
    current.owner === owner &&
    Math.abs(current.height - height) < 1
  ) {
    return current;
  }
  return { height, owner };
};
