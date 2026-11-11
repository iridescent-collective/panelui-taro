export const gridTracks = (value: number): number =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;

interface Placement {
  row: number;
  column: number;
  colSpan: number;
  rowSpan: number;
}
const findSpot = (
  occupied: boolean[][],
  columns: number,
  colSpan: number,
  rowSpan: number
): {
  row: number;
  column: number;
} => {
  for (let row = 0; ; row += 1) {
    for (let column = 0; column + colSpan <= columns; column += 1) {
      let free = true;
      for (let y = row; y < row + rowSpan && free; y += 1) {
        for (let x = column; x < column + colSpan; x += 1) {
          if (occupied[y]?.[x]) {
            free = false;
            break;
          }
        }
      }
      if (free) {
        return { column, row };
      }
    }
  }
};

export interface GridSpan {
  colSpan?: number;
  rowSpan?: number;
}
export const gridPlacements = (
  spans: readonly GridSpan[],
  requestedTracks: number
) => {
  const tracks = gridTracks(requestedTracks);
  const occupied: boolean[][] = [];
  const placements: Placement[] = [];
  let rows = 0;
  for (const span of spans) {
    const colSpan = Math.min(gridTracks(span.colSpan ?? 1), tracks);
    const rowSpan = gridTracks(span.rowSpan ?? 1);
    const { row, column } = findSpot(occupied, tracks, colSpan, rowSpan);
    for (let y = row; y < row + rowSpan; y += 1) {
      const line = occupied[y] ?? [];
      occupied[y] = line;
      for (let x = column; x < column + colSpan; x += 1) {
        line[x] = true;
      }
    }
    placements.push({ colSpan, column, row, rowSpan });
    rows = Math.max(rows, row + rowSpan);
  }
  return { placements, rows };
};
