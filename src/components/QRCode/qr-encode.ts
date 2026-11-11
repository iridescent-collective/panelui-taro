export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
const FORMAT_BITS: Record<ErrorCorrectionLevel, number> = {
  H: 2,
  L: 1,
  M: 0,
  Q: 3,
};
const ECC_CODEWORDS_PER_BLOCK: Record<ErrorCorrectionLevel, Int16Array> = {
  H: Int16Array.from([
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ]),
  L: Int16Array.from([
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ]),
  M: Int16Array.from([
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28,
  ]),
  Q: Int16Array.from([
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ]),
};
const NUM_ERROR_CORRECTION_BLOCKS: Record<ErrorCorrectionLevel, Int16Array> = {
  H: Int16Array.from([
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81,
  ]),
  L: Int16Array.from([
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10,
    12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ]),
  M: Int16Array.from([
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ]),
  Q: Int16Array.from([
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23,
    23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ]),
};
const MIN_VERSION = 1;
const MAX_VERSION = 40;
function rawDataModules(version: number): number {
  let modules = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alignmentCount = Math.floor(version / 7) + 2;
    modules -= (25 * alignmentCount - 10) * alignmentCount - 55;
    if (version >= 7) {
      modules -= 36;
    }
  }
  return modules;
}
function dataCodewords(version: number, level: ErrorCorrectionLevel): number {
  return (
    Math.floor(rawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[level]![version]! *
      NUM_ERROR_CORRECTION_BLOCKS[level]![version]!
  );
}
function alignmentPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step =
    version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const positions: number[] = [];
  for (let pos = size - 7; positions.length < count - 1; pos -= step) {
    positions.unshift(pos);
  }
  positions.unshift(6);
  return positions;
}
function multiply(a: number, b: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i--) {
    result = (result << 1) ^ ((result >>> 7) * 0x1_1d);
    result ^= ((b >>> i) & 1) * a;
  }
  return result & 0xff;
}
function generatorPolynomial(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = multiply(result[j]!, root);
      if (j + 1 < degree) {
        result[j]! ^= result[j + 1]!;
      }
    }
    root = multiply(root, 0x02);
  }
  return result;
}
function remainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (const byte of data) {
    const factor = byte ^ result[0]!;
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < divisor.length; i += 1) {
      result[i]! ^= multiply(divisor[i]!, factor);
    }
  }
  return result;
}
class BitBuffer {
  readonly bits: number[] = [];
  append(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }
}
function toUtf8(text: string): number[] {
  const bytes: number[] = [];
  for (const character of text) {
    const point = character.codePointAt(0) as number;
    if (point < 0x80) {
      bytes.push(point);
    } else if (point < 0x8_00) {
      bytes.push(0xc0 | (point >> 6), 0x80 | (point & 0x3f));
    } else if (point < 0x1_00_00) {
      bytes.push(
        0xe0 | (point >> 12),
        0x80 | ((point >> 6) & 0x3f),
        0x80 | (point & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (point >> 18),
        0x80 | ((point >> 12) & 0x3f),
        0x80 | ((point >> 6) & 0x3f),
        0x80 | (point & 0x3f)
      );
    }
  }
  return bytes;
}
function characterCountBits(version: number): number {
  return version < 10 ? 8 : 16;
}
function smallestVersion(
  byteLength: number,
  level: ErrorCorrectionLevel
): number {
  for (let version = MIN_VERSION; version <= MAX_VERSION; version += 1) {
    const capacity = dataCodewords(version, level) * 8;
    const needed = 4 + characterCountBits(version) + byteLength * 8;
    if (needed <= capacity) {
      return version;
    }
  }
  throw new Error(
    `Too much data for a QR code: ${byteLength} bytes will not fit at error correction level ${level}.`
  );
}
function codewords(
  bytes: number[],
  version: number,
  level: ErrorCorrectionLevel
): Uint8Array {
  const capacity = dataCodewords(version, level) * 8;
  const buffer = new BitBuffer();
  buffer.append(0b0100, 4);
  buffer.append(bytes.length, characterCountBits(version));
  for (const byte of bytes) {
    buffer.append(byte, 8);
  }
  buffer.append(0, Math.min(4, capacity - buffer.bits.length));
  buffer.append(0, (8 - (buffer.bits.length % 8)) % 8);
  for (let pad = 0xec; buffer.bits.length < capacity; pad ^= 0xec ^ 0x11) {
    buffer.append(pad, 8);
  }
  const data = new Uint8Array(buffer.bits.length / 8);
  for (let i = 0; i < data.length; i += 1) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      byte = (byte << 1) | buffer.bits[i * 8 + bit]!;
    }
    data[i] = byte;
  }
  const blockCount = NUM_ERROR_CORRECTION_BLOCKS[level]![version]!;
  const eccPerBlock = ECC_CODEWORDS_PER_BLOCK[level]![version]!;
  const totalCodewords = Math.floor(rawDataModules(version) / 8);
  const shortBlockLength = Math.floor(totalCodewords / blockCount);
  const shortBlockCount = blockCount - (totalCodewords % blockCount);
  const divisor = generatorPolynomial(eccPerBlock);
  const blocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];
  for (let i = 0, offset = 0; i < blockCount; i += 1) {
    const length =
      shortBlockLength - eccPerBlock + (i < shortBlockCount ? 0 : 1);
    const block = data.slice(offset, offset + length);
    offset += length;
    blocks.push(block);
    eccBlocks.push(remainder(block, divisor));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks.at(-1)!.length; i += 1) {
    for (const block of blocks) {
      if (i < block.length) {
        result.push(block[i]!);
      }
    }
  }
  for (let i = 0; i < eccPerBlock; i += 1) {
    for (const block of eccBlocks) {
      result.push(block[i]!);
    }
  }
  return Uint8Array.from(result);
}
const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];
export interface QrMatrix {
  modules: boolean[][];
  size: number;
  version: number;
}
export function encodeQr(
  text: string,
  {
    errorCorrection = "M",
    version: requestedVersion,
  }: {
    errorCorrection?: ErrorCorrectionLevel;
    version?: number;
  } = {}
): QrMatrix {
  const bytes = toUtf8(text);
  const version =
    requestedVersion ?? smallestVersion(bytes.length, errorCorrection);
  if (version < MIN_VERSION || version > MAX_VERSION) {
    throw new Error(
      `QR version must be between ${MIN_VERSION} and ${MAX_VERSION}.`
    );
  }
  if (
    4 + characterCountBits(version) + bytes.length * 8 >
    dataCodewords(version, errorCorrection) * 8
  ) {
    throw new Error(
      `That data does not fit in QR version ${version} at level ${errorCorrection}.`
    );
  }
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false)
  );
  const set = (x: number, y: number, dark: boolean) => {
    modules[y]![x] = dark;
    reserved[y]![x] = true;
  };
  for (const [originX, originY] of [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ] as const) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const x = originX + dx;
        const y = originY + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) {
          continue;
        }
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        set(x, y, ring !== 2 && ring <= 3);
      }
    }
  }
  for (let i = 0; i < size; i += 1) {
    if (!reserved[6]![i]) {
      set(i, 6, i % 2 === 0);
    }
    if (!reserved[i]![6]) {
      set(6, i, i % 2 === 0);
    }
  }
  const positions = alignmentPositions(version);
  for (let i = 0; i < positions.length; i += 1) {
    for (let j = 0; j < positions.length; j += 1) {
      const corner =
        (i === 0 && j === 0) ||
        (i === 0 && j === positions.length - 1) ||
        (i === positions.length - 1 && j === 0);
      if (corner) {
        continue;
      }
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          set(
            positions[j]! + dx,
            positions[i]! + dy,
            Math.max(Math.abs(dx), Math.abs(dy)) !== 1
          );
        }
      }
    }
  }
  for (let i = 0; i < 9; i += 1) {
    if (!reserved[8]![i]) {
      set(i, 8, false);
    }
    if (!reserved[i]![8]) {
      set(8, i, false);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    if (!reserved[8]![size - 1 - i]) {
      set(size - 1 - i, 8, false);
    }
    if (!reserved[size - 1 - i]![8]) {
      set(8, size - 1 - i, false);
    }
  }
  set(8, size - 8, true);
  if (version >= 7) {
    let rest = version;
    for (let i = 0; i < 12; i += 1) {
      rest = (rest << 1) ^ ((rest >>> 11) * 0x1f_25);
    }
    const bits = ((version << 12) | rest) >>> 0;
    for (let i = 0; i < 18; i += 1) {
      const dark = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }
  const data = codewords(bytes, version, errorCorrection);
  let bit = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }
    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;
        if (reserved[y]![x]) {
          continue;
        }
        modules[y]![x] =
          bit < data.length * 8 &&
          ((data[bit >>> 3]! >>> (7 - (bit & 7))) & 1) === 1;
        bit += 1;
      }
    }
  }
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(modules, reserved, mask, size);
    writeFormat(modules, errorCorrection, mask, size);
    const penalty = penaltyScore(modules, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(modules, reserved, mask, size);
  }
  applyMask(modules, reserved, bestMask, size);
  writeFormat(modules, errorCorrection, bestMask, size);
  return { modules, size, version };
}
function applyMask(
  modules: boolean[][],
  reserved: boolean[][],
  mask: number,
  size: number
): void {
  const test = MASKS[mask]!;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!reserved[y]![x] && test!(x, y)) {
        modules[y]![x] = !modules[y]![x];
      }
    }
  }
}
function writeFormat(
  modules: boolean[][],
  level: ErrorCorrectionLevel,
  mask: number,
  size: number
): void {
  const data = (FORMAT_BITS[level] << 3) | mask;
  let rest = data;
  for (let i = 0; i < 10; i += 1) {
    rest = (rest << 1) ^ ((rest >>> 9) * 0x5_37);
  }
  const bits = (((data << 10) | rest) ^ 0x54_12) >>> 0;
  const at = (i: number) => ((bits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i += 1) {
    modules[i]![8] = at(i);
  }
  modules[7]![8] = at(6);
  modules[8]![8] = at(7);
  modules[8]![7] = at(8);
  for (let i = 9; i < 15; i += 1) {
    modules[8]![14 - i] = at(i);
  }
  for (let i = 0; i < 8; i += 1) {
    modules[8]![size - 1 - i] = at(i);
  }
  for (let i = 8; i < 15; i += 1) {
    modules[size - 15 + i]![8] = at(i);
  }
  modules[size - 8]![8] = true;
}
function penaltyScore(modules: boolean[][], size: number): number {
  let penalty = 0;
  for (let axis = 0; axis < 2; axis += 1) {
    for (let a = 0; a < size; a += 1) {
      let runColour = false;
      let runLength = 0;
      const history = [0, 0, 0, 0, 0, 0, 0];
      for (let b = 0; b < size; b += 1) {
        const dark = axis === 0 ? modules[a]![b]! : modules[b]![a]!;
        if (dark === runColour) {
          runLength += 1;
          if (runLength === 5) {
            penalty += 3;
          } else if (runLength > 5) {
            penalty += 1;
          }
        } else {
          history.pop();
          history.unshift(runLength);
          if (!runColour && hasFinderPattern(history)) {
            penalty += 40;
          }
          runColour = dark;
          runLength = 1;
        }
      }
      history.pop();
      history.unshift(runLength);
      if (runColour) {
        history.pop();
        history.unshift(0);
      }
      if (hasFinderPattern(history)) {
        penalty += 40;
      }
    }
  }
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const corner = modules[y]![x];
      if (
        corner === modules[y]![x + 1] &&
        corner === modules[y + 1]![x] &&
        corner === modules[y + 1]![x + 1]
      ) {
        penalty += 3;
      }
    }
  }
  let dark = 0;
  for (const row of modules) {
    for (const module of row) {
      if (module) {
        dark += 1;
      }
    }
  }
  const total = size * size;
  const deviation = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  penalty += deviation * 10;
  return penalty;
}
function hasFinderPattern(history: number[]): boolean {
  const middle = history[1]!;
  if (
    middle <= 0 ||
    history[2] !== middle ||
    history[4] !== middle ||
    history[5] !== middle
  ) {
    return false;
  }
  if (history[3] !== middle * 3) {
    return false;
  }
  return Math.max(history[0]!, history[6]!) >= middle * 4;
}
