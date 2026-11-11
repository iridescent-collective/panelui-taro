import { useCallback, useLayoutEffect, useRef, useState } from "react";

export type InputGroupDecoratorSide = "prefix" | "suffix";
export type InputGroupDecoratorOwner = symbol;
type Widths = Record<InputGroupDecoratorSide, number>;
type Registries = Record<
  InputGroupDecoratorSide,
  Map<InputGroupDecoratorOwner, number>
>;
export interface InputGroupMeasurements {
  prefixWidth: number;
  suffixWidth: number;
  measureDecorator: (
    side: InputGroupDecoratorSide,
    owner: InputGroupDecoratorOwner,
    width: number
  ) => void;
  removeDecorator: (
    side: InputGroupDecoratorSide,
    owner: InputGroupDecoratorOwner
  ) => void;
}
type MeasureDecorator = InputGroupMeasurements["measureDecorator"];
type RemoveDecorator = InputGroupMeasurements["removeDecorator"];
const emptyWidths = (): Widths => ({ prefix: 0, suffix: 0 });
const measuredWidth = (registry: Map<InputGroupDecoratorOwner, number>) => {
  let width = 0;
  for (const candidate of registry.values()) {
    width = Math.max(width, candidate);
  }
  return width;
};
export const useInputGroupMeasurements = (): InputGroupMeasurements => {
  const registries = useRef<Registries>({
    prefix: new Map(),
    suffix: new Map(),
  });
  const [widths, setWidths] = useState<Widths>(emptyWidths);
  const commitWidth = useCallback((side: InputGroupDecoratorSide) => {
    const width = measuredWidth(registries.current[side]);
    setWidths((current) =>
      current[side] === width ? current : { ...current, [side]: width }
    );
  }, []);
  const measureDecorator = useCallback(
    (
      side: InputGroupDecoratorSide,
      owner: InputGroupDecoratorOwner,
      width: number
    ) => {
      const registry = registries.current[side];
      if (Number.isFinite(width) && width > 0) {
        registry.set(owner, width);
      } else {
        registry.delete(owner);
      }
      commitWidth(side);
    },
    [commitWidth]
  );
  const removeDecorator = useCallback(
    (side: InputGroupDecoratorSide, owner: InputGroupDecoratorOwner) => {
      if (!registries.current[side].delete(owner)) {
        return;
      }
      commitWidth(side);
    },
    [commitWidth]
  );
  return {
    measureDecorator,
    prefixWidth: widths.prefix,
    removeDecorator,
    suffixWidth: widths.suffix,
  };
};
export const useInputGroupDecoratorMeasurement = (
  side: InputGroupDecoratorSide,
  measureDecorator: MeasureDecorator | undefined,
  removeDecorator: RemoveDecorator | undefined
) => {
  const owner = useRef<InputGroupDecoratorOwner>(Symbol(side));
  const width = useRef(0);
  useLayoutEffect(() => {
    if (width.current > 0) {
      measureDecorator?.(side, owner.current, width.current);
    }
    return () => removeDecorator?.(side, owner.current);
  }, [measureDecorator, removeDecorator, side]);
  return useCallback(
    (nextWidth: number) => {
      width.current = nextWidth;
      measureDecorator?.(side, owner.current, nextWidth);
    },
    [measureDecorator, side]
  );
};
