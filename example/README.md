# PanelUI Example

An independent Taro + React WeChat mini program for the PanelUI Native port. Components, Blocks and Customization share a searchable directory, a variant picker, replay and theme controls. The preview does not import business pages, authentication, stores, services or environment configuration from `apps/mini`.

## Content and attribution

- 141 component pages and 784 upstream-derived variants, adapted from upstream `apps/example/src/data/demos/chunk-01.tsx` through `chunk-16.tsx`.
- Four official Blocks: Smart Home, Wallet, Activity and Boarding Pass, adapted from `packages/panelui/blocks`.
- Seven customization guides: Colors, Theming, Charts, Fonts, Icons, Styling and Sizing.
- Official example source baseline: `c4420017be024f390bafa5041876c789e5c11fbb`. `src/official/metadata.json` records source files and variant names. This is separate from the library's source inventory.

Retain `UPSTREAM-LICENSE` and `UPSTREAM-NOTICE.md` when copying adapted examples. The upstream Web collection is outside this port.

## Run

From the repository root:

```sh
pnpm install
pnpm dev:weapp:panelui
pnpm build:weapp:panelui
pnpm test:panelui-example
pnpm --filter panelui-example typecheck
```

Import `example/dist` into WeChat Developer Tools. Use the example's project configuration and a test AppID. The source defaults to tourist mode; do not reuse the business mini program's production AppID.

The example uses Taro 4.2 with React 18. Other dependencies use named `panelui-*` catalogs with caret ranges. The library owns the shared Vitest 5 / Vite 8 runner; the example's build stays on Taro's compatible Vite 4 toolchain.

## Navigation

`src/data/components.json` records every component route. For example, Button is `/components-a/button/index`; Blocks use `/blocks/<slug>/index`, and customization uses `/customization/<topic>/index`. Component variants support `?demo=<official variant id>`.

The four component subpackages, Blocks subpackage and customization subpackage are verified alongside the main package. The build check enforces the 2 MiB package limits.

Two local compositions retain their own deep links and are separate from official Blocks:

- Daily Life: `/showcases/daily-life/index`
- AI Assistant: `/showcases/ai/index`

Daily Life uses local demonstration state and performs no real device commands, payments or airline check-in. AI Assistant defaults to deterministic prepared replies and a labelled simulated voice preview. Its connected mode supports real provider streaming, a server-side documentation-link tool, WeChat recording, editable transcription and generated answer playback. Configuration and limits are documented in [the AI server guide](server/README.md).

## Themes and platform adapters

Panel, Moon and Grass provide light/dark modes. Customization also registers a Sunset pair. Selection persists across pages and app restarts. `src/services/native-theme.ts` synchronizes navigation/status bars, page background and pull-down text. Native system-bar text accepts black or white, while component accents use semantic tokens.

`src/runtime` adapts layout, scrolling, SVG, observable animation values and media playback. Native Liquid Glass and iOS platform buttons use styled Taro surfaces. Animations use CSS and JavaScript rather than Reanimated. Soundwave uses a labelled demo signal and does not record audio. External links are copied to the clipboard.

## Verification

Tests cover all official variants and Blocks in light/dark, layout measurements at 320/375/390/430 pixels, scroll targeting, safe-area conversion and customization interactions. A passing render test does not establish visual or device acceptance. Record Developer Tools observations and physical-device checks separately.

The Next.js documentation site is at [`../docs`](../docs/README.md). Its browser showcase is an illustration; this example is where the actual Taro components run.
