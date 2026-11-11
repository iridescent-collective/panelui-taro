import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const [sourcePath] = process.argv.slice(2);
if (!sourcePath) {
  throw new Error(
    "Provide the pinned Reanimated 4.5.1 springUtils source file"
  );
}
const input = fs.readFileSync(sourcePath, "utf-8");
const hash = crypto.createHash("sha256").update(input).digest("hex");
if (
  hash !== "88bcf5492caba123d5aeacc0fe0d6da3414ab4451c1648f8749760a826106ded"
) {
  throw new Error(
    "Upstream spring source differs from the pinned fixture input"
  );
}
const parsed = ts.createSourceFile(
  "springUtils.ts",
  input,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);
const clean = ts.factory.updateSourceFile(
  parsed,
  parsed.statements.filter((node) => !ts.isImportDeclaration(node))
);
const text = ts.createPrinter().printFile(clean);
const code = ts.transpileModule(text, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const output = {};
const context = vm.createContext({ exports: output });
vm.runInContext(code, context, { timeout: 1000 });
const scenarios = [
  { config: { mass: 3 }, from: -100, name: "toast-entry", to: 0 },
  {
    config: { dampingRatio: 0.9, duration: 350 },
    from: 0,
    name: "toast-stack",
    to: 2,
  },
  {
    config: { dampingRatio: 0.9, duration: 350 },
    from: 1.2,
    name: "toast-stack-interruption",
    to: 0,
    velocity: -4,
  },
  {
    config: { dampingRatio: 1, duration: 200 },
    from: 0,
    name: "duration-critical",
    to: 1,
  },
];
const samples = scenarios.map((s) => {
  const config = {
    damping: 120,
    dampingRatio: 1,
    duration: 550,
    energyThreshold: 6e-9,
    mass: 4,
    overshootClamping: false,
    skipAnimation: false,
    stiffness: 900,
    ...s.config,
    useDuration:
      s.config.duration !== undefined || s.config.dampingRatio !== undefined,
  };
  let { stiffness } = config;
  const x0 = s.from - s.to;
  const v0 = s.velocity ?? 0;
  if (config.useDuration) {
    stiffness = output.calculateNewStiffnessToMatchDuration(x0, config, v0);
  }
  config.stiffness = stiffness;
  const f = output.initialCalculations(stiffness, config);
  const model = {
    current: s.from,
    initialEnergy: output.getEnergy(x0, 0, stiffness, config.mass),
    startValue: x0,
    toValue: s.to,
    velocity: v0,
    ...f,
  };
  const frames = [];
  for (let elapsed = 16; elapsed <= 1000; elapsed += 16) {
    const args = {
      ...f,
      t: 0.016,
      v0: model.velocity,
      x0: model.current - model.toValue,
    };
    const frame =
      f.zeta < 1
        ? output.underDampedSpringCalculations(model, args)
        : output.criticallyDampedSpringCalculations(model, args);
    model.current = frame.position;
    model.velocity = frame.velocity;
    const done = output.isAnimationTerminatingCalculation(model, config);
    if (done) {
      model.current = s.to;
      model.velocity = 0;
    }
    frames.push({
      done,
      elapsed,
      position: model.current,
      velocity: model.velocity,
    });
    if (done) {
      break;
    }
  }
  return { ...s, frames, stiffness };
});
fs.writeFileSync(
  new URL("../test/fixtures/source-spring-4.5.1.json", import.meta.url),
  `${JSON.stringify({ samples, sourceHash: hash, sourceVersion: "4.5.1" }, null, 2)}\n`
);
console.log(
  samples.map((s) => ({
    frames: s.frames.length,
    name: s.name,
    stiffness: s.stiffness,
  }))
);
