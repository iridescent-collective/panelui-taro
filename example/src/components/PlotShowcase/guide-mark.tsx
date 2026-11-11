import {
  Circle,
  G,
  usePlotAnimatedLayer,
  yOf,
} from "panelui-taro/plot";

export const GuideMark = () => {
  usePlotAnimatedLayer((ctx) =>
    ctx.status === "loading" ? null : (
      <G opacity={0.8}>
        <Circle
          cx={ctx.plot.left + ctx.plot.width}
          cy={yOf(30, ctx.plot, ctx.domainMin.value, ctx.domainMax.value)}
          r={4}
          fill={ctx.palette[2]}
        />
      </G>
    )
  );
  return null;
};
