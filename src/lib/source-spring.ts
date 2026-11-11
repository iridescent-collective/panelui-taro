export interface SourceSpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  duration?: number;
  dampingRatio?: number;
  energyThreshold?: number;
  overshootClamping?: boolean;
  velocity?: number;
}
export interface SourceSpringModel {
  position: number;
  target: number;
  velocity: number;
  stiffness: number;
  mass: number;
  zeta: number;
  omega: number;
  initialEnergy: number;
  threshold: number;
  overshootClamping: boolean;
  startDisplacement: number;
}
const energy = (
  displacement: number,
  velocity: number,
  stiffness: number,
  mass: number
) => 0.5 * stiffness * displacement ** 2 + 0.5 * mass * velocity ** 2;
const durationStiffness = (
  displacement: number,
  velocity: number,
  duration: number,
  zeta: number,
  mass: number,
  threshold: number
) => {
  const time = (duration * 1.5) / 1000;
  const difference = (stiffness: number) => {
    const omega = Math.sqrt(stiffness / mass) * zeta;
    const envelope = Math.exp(-omega * time);
    const position =
      (displacement + (velocity + displacement * omega) * time) * envelope;
    const speed =
      position * -omega + (velocity + displacement * omega) * envelope;
    return (
      energy(position, speed, stiffness, mass) /
        energy(displacement, velocity, stiffness, mass) -
      threshold
    );
  };
  let min = Number.EPSILON;
  let max = 8000;
  const direction = difference(max) >= difference(min) ? 1 : -1;
  let current = (min + max) / 2;
  let iterations = 100;
  while (Math.abs(difference(current)) > threshold * 0.001 && iterations > 0) {
    iterations -= 1;
    if (difference(current) * direction < 0) {
      min = current;
    } else {
      max = current;
    }
    current = (min + max) / 2;
  }
  return current;
};
export const startSourceSpring = (
  position: number,
  target: number,
  velocity: number,
  config: SourceSpringConfig
): SourceSpringModel => {
  const mass = config.mass ?? 4;
  const threshold = config.energyThreshold ?? 6e-9;
  const displacement = position - target;
  let speed = velocity;
  if ((target > position && speed < 0) || (target < position && speed > 0)) {
    speed = 0;
  }
  let stiffness = config.stiffness ?? 900;
  let zeta = (config.damping ?? 120) / (2 * Math.sqrt(stiffness * mass));
  if (config.duration !== undefined || config.dampingRatio !== undefined) {
    zeta = config.dampingRatio ?? 1;
    if (displacement !== 0 || speed !== 0) {
      stiffness = durationStiffness(
        displacement,
        speed,
        config.duration ?? 550,
        zeta,
        mass,
        threshold
      );
    }
  }
  return {
    initialEnergy: energy(displacement, config.velocity ?? 0, stiffness, mass),
    mass,
    omega: Math.sqrt(stiffness / mass),
    overshootClamping: config.overshootClamping ?? false,
    position,
    startDisplacement: displacement,
    stiffness,
    target,
    threshold,
    velocity: speed,
    zeta,
  };
};
export const stepSourceSpring = (model: SourceSpringModel, elapsed: number) => {
  const time = Math.min(64, Math.max(0, elapsed)) / 1000;
  const x = model.position - model.target;
  const { velocity } = model;
  const { omega } = model;
  if (model.zeta < 1) {
    const frequency = omega * Math.sqrt(1 - model.zeta ** 2);
    const envelope = Math.exp(-model.zeta * omega * time);
    const sin = Math.sin(frequency * time);
    const cos = Math.cos(frequency * time);
    const fragment =
      envelope *
      ((sin * (velocity + model.zeta * omega * x)) / frequency + x * cos);
    model.position = model.target + fragment;
    model.velocity =
      -model.zeta * omega * fragment +
      envelope *
        (cos * (velocity + model.zeta * omega * x) - frequency * x * sin);
  } else {
    const envelope = Math.exp(-omega * time);
    const expression = x + (velocity + omega * x) * time;
    model.position = model.target + envelope * expression;
    model.velocity =
      envelope * -omega * expression + envelope * (velocity + omega * x);
  }
  const lower =
    model.startDisplacement >= 0
      ? model.target
      : model.target + model.startDisplacement;
  const upper = lower + Math.abs(model.startDisplacement);
  const overshot =
    model.overshootClamping &&
    (model.position < lower || model.position > upper);
  const settled =
    overshot ||
    model.initialEnergy === 0 ||
    energy(
      model.position - model.target,
      model.velocity,
      model.stiffness,
      model.mass
    ) /
      model.initialEnergy <=
      model.threshold;
  if (settled) {
    model.position = model.target;
    model.velocity = 0;
  }
  return settled;
};
