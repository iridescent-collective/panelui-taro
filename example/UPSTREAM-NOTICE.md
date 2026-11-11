# Upstream examples

Component demonstrations under `src/official`, Blocks under `src/blocks`, and the map/panelside/screen-header support views under `src/extras` are adapted from PanelUI by Kareem Ali, under the MIT license in `UPSTREAM-LICENSE`.

Source checkout: `c4420017be024f390bafa5041876c789e5c11fbb`.

`src/assets/logo-light.png` and `logo-dark.png` are copied from upstream `apps/example/assets` and bundled through static imports.

Original locations: `apps/example/src/data/demos/chunk-01.tsx` through `chunk-16.tsx`, `apps/example/src/components`, and `packages/panelui/blocks`.

The Taro port replaces React Native imports, media/scroll/style adapters and API differences. The demonstration data, compositions, titles and variant lists are retained. `src/official/metadata.json` records source files and variants. The copied examples retain upstream structure and are excluded from application-specific lint refactoring; they remain included in TypeScript checks, preview tests and production builds.

React Native-only system materials and Reanimated layout transitions have platform differences on WeChat. Native controls use the component port's supported solid surfaces. Voice input demonstrations use a labeled, adjustable local signal; no microphone is recorded. External URL actions copy their target in the mini program.

## Native 0.116.0 additions

The baseline source checkout above is retained. The Tabs “Custom colours” variant is adapted from commit `2cf71cc787f60e643dd61abf739eb35a758fc304`, `apps/example/src/data/demos/chunk-12.tsx`. Checkbox “Sharing a line” and “A link inside the label” adapt the documentation examples from commit `d888d764b46cfbb6cc7476f302eb07752e55223e`, `apps/docs/content/docs/components/checkbox.mdx`. Their local status text demonstrates the link actions without opening an external page. These additions brought the catalogue to 780 upstream-derived variants.

The Taro acceptance example extends Custom colours with an expanding row (`activeClassName`) and green inactive labels (`labelClassName`), and Sharing a line with an 8-unit `hitSlop`. These exercise the ported public props without adding catalogue variants.


The completion sync adds Camera's Photo and video, Profile photo and Short clip compositions from `apps/example/src/data/demos/chunk-10.tsx` at checkout `98523ddb17f26402df7181e8a306e074d0113ece`, and adapts the ImageViewer RTL behavior from the same checkout into a local-image acceptance variant. The catalogue now has 141 components and 784 variants. The separate Native sync showcase is a Taro-specific acceptance page and is not counted as an upstream catalogue variant.
