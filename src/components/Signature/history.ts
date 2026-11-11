import { createObservableValue } from "../../primitives/observable-value";
import type { SignatureChangeKind } from "./accessibility";

export interface SignatureHistory {
  strokes: number[][];
  undone: number[][];
  kind: SignatureChangeKind;
}
export const createSignatureHistory = () => {
  const signal = createObservableValue<SignatureHistory>({
    kind: "draw",
    strokes: [],
    undone: [],
  });
  return {
    clear: () => {
      signal.value = { kind: "clear", strokes: [], undone: [] };
    },
    commit: (points: number[]) => {
      if (points.length) {
        signal.value = {
          kind: "draw",
          strokes: [...signal.value.strokes, [...points]],
          undone: [],
        };
      }
    },
    redo: () => {
      const { strokes, undone } = signal.value;
      const last = undone.at(-1);
      if (last) {
        signal.value = {
          kind: "redo",
          strokes: [...strokes, last],
          undone: undone.slice(0, -1),
        };
      }
    },
    signal,
    undo: () => {
      const { strokes, undone } = signal.value;
      const last = strokes.at(-1);
      if (last) {
        signal.value = {
          kind: "undo",
          strokes: strokes.slice(0, -1),
          undone: [...undone, last],
        };
      }
    },
  };
};
