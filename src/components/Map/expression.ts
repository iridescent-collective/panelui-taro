import { hsvToRgb, parseColor } from "../../lib/color";
import { featureProperties, isRecord } from "./geojson";

export interface ExpressionEnvironment {
  feature: unknown;
  zoom: number;
}
interface EvaluationContext extends ExpressionEnvironment {
  evaluate: (value: unknown) => unknown;
}
const numeric = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("Map: expression expected a finite number");
  }
  return value;
};
export const rgbaColor = (value: string) => {
  const parsed = parseColor(value);
  if (!parsed) {
    throw new Error(`Map: unsupported color ${value}`);
  }
  const channels = hsvToRgb(parsed.h, parsed.s, parsed.v);
  return [channels.r, channels.g, channels.b, parsed.a] as const;
};
export const interpolateColor = (
  from: string,
  to: string,
  fraction: number
) => {
  const a = rgbaColor(from);
  const b = rgbaColor(to);
  return `rgba(${Math.round(a[0] + (b[0] - a[0]) * fraction)}, ${Math.round(a[1] + (b[1] - a[1]) * fraction)}, ${Math.round(a[2] + (b[2] - a[2]) * fraction)}, ${a[3] + (b[3] - a[3]) * fraction})`;
};
const expressionMatch = (args: unknown[], ctx: EvaluationContext) => {
  const input = ctx.evaluate(args[0]);
  for (let index = 1; index < args.length - 1; index += 2) {
    const labels = args[index];
    if (Array.isArray(labels) ? labels.includes(input) : labels === input) {
      return ctx.evaluate(args[index + 1]);
    }
  }
  return ctx.evaluate(args.at(-1));
};
const expressionCase = (args: unknown[], ctx: EvaluationContext) => {
  for (let index = 0; index < args.length - 1; index += 2) {
    if (ctx.evaluate(args[index])) {
      return ctx.evaluate(args[index + 1]);
    }
  }
  return ctx.evaluate(args.at(-1));
};
const expressionStep = (args: unknown[], ctx: EvaluationContext) => {
  const input = numeric(ctx.evaluate(args[0]));
  let result = ctx.evaluate(args[1]);
  for (let index = 2; index < args.length; index += 2) {
    if (input < numeric(args[index])) {
      break;
    }
    result = ctx.evaluate(args[index + 1]);
  }
  return result;
};
const expressionInterpolate = (args: unknown[], ctx: EvaluationContext) => {
  const [interpolation] = args;
  if (
    !Array.isArray(interpolation) ||
    (interpolation[0] !== "linear" && interpolation[0] !== "exponential")
  ) {
    throw new Error("Map: unsupported interpolate easing");
  }
  const input = numeric(ctx.evaluate(args[1]));
  if (input <= numeric(args[2])) {
    return ctx.evaluate(args[3]);
  }
  for (let index = 4; index < args.length; index += 2) {
    const upper = numeric(args[index]);
    if (input > upper) {
      continue;
    }
    const lower = numeric(args[index - 2]);
    const base =
      interpolation[0] === "exponential" ? numeric(interpolation[1]) : 1;
    const fraction =
      base === 1
        ? (input - lower) / (upper - lower)
        : (base ** (input - lower) - 1) / (base ** (upper - lower) - 1);
    const from = ctx.evaluate(args[index - 1]);
    const to = ctx.evaluate(args[index + 1]);
    if (typeof from === "number" && typeof to === "number") {
      return from + (to - from) * fraction;
    }
    if (typeof from === "string" && typeof to === "string") {
      return interpolateColor(from, to, fraction);
    }
    throw new Error("Map: interpolation requires numeric or color stops");
  }
  return ctx.evaluate(args.at(-1));
};
const EXPRESSIONS: Record<
  string,
  (args: unknown[], ctx: EvaluationContext) => unknown
> = {
  "!": (args, ctx) => !ctx.evaluate(args[0]),
  "!=": (args, ctx) => ctx.evaluate(args[0]) !== ctx.evaluate(args[1]),
  "<": (args, ctx) =>
    numeric(ctx.evaluate(args[0])) < numeric(ctx.evaluate(args[1])),
  "<=": (args, ctx) =>
    numeric(ctx.evaluate(args[0])) <= numeric(ctx.evaluate(args[1])),
  "==": (args, ctx) => ctx.evaluate(args[0]) === ctx.evaluate(args[1]),
  ">": (args, ctx) =>
    numeric(ctx.evaluate(args[0])) > numeric(ctx.evaluate(args[1])),
  ">=": (args, ctx) =>
    numeric(ctx.evaluate(args[0])) >= numeric(ctx.evaluate(args[1])),
  all: (args, ctx) => args.every((item) => Boolean(ctx.evaluate(item))),
  any: (args, ctx) => args.some((item) => Boolean(ctx.evaluate(item))),
  case: expressionCase,
  coalesce: (args, ctx) => {
    for (const argument of args) {
      const answer = ctx.evaluate(argument);
      if (answer !== null && answer !== undefined) {
        return answer;
      }
    }
    return null;
  },
  get: (args, ctx) => {
    const object =
      args.length > 1 ? ctx.evaluate(args[1]) : featureProperties(ctx.feature);
    return isRecord(object) ? object[String(args[0])] : undefined;
  },
  has: (args, ctx) => String(args[0]) in featureProperties(ctx.feature),
  id: (_, ctx) => (isRecord(ctx.feature) ? ctx.feature.id : undefined),
  interpolate: expressionInterpolate,
  literal: (args) => args[0],
  match: expressionMatch,
  step: expressionStep,
  "to-number": (args, ctx) => {
    for (const argument of args) {
      const answer = Number(ctx.evaluate(argument));
      if (Number.isFinite(answer)) {
        return answer;
      }
    }
    throw new Error("Map: to-number conversion failed");
  },
  "to-string": (args, ctx) => String(ctx.evaluate(args[0])),
  zoom: (_, ctx) => ctx.zoom,
};
export const evaluateMapExpression = (
  value: unknown,
  environment: ExpressionEnvironment
): unknown => {
  if (!Array.isArray(value)) {
    return value;
  }
  const [operator, ...args] = value;
  const handler =
    typeof operator === "string" ? EXPRESSIONS[operator] : undefined;
  if (!handler) {
    throw new Error(`Map: unsupported MapLibre expression ${String(operator)}`);
  }
  return handler(args, {
    ...environment,
    evaluate: (item) => evaluateMapExpression(item, environment),
  });
};
