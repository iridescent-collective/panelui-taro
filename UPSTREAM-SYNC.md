## PageHeader custom navigation integration — 2026-11-04

Reviewed Native `packages/panelui/src/components/page-header/index.tsx`, the former Mini app NavBar geometry, and [Vant Weapp NavBar lifecycle/placeholder behavior](https://github.com/youzan/vant-weapp/blob/dev/packages/nav-bar/index.ts). This is a behavioral reference, not a port of Vant styling or dependencies. Native PageHeader remains a compound profile header: its card/page variant definitions, theme tokens, cover/avatar semantics, row padding/gaps and title typography are retained.

Taro adds opt-in `navigation`, `fixed`, `placeholder` and `safeAreaInsetTop` options. The last three default to true to retain the existing Taro navigation behavior. A status-bar spacer and capsule-clearance content layer preserve root padding, background and borders; navigation rows use minimum height instead of a fixed height. Fixed navigation measures the complete root after render, content changes and window resize for its placeholder, including custom styles and additional compound parts. Only the navigation path mounts the measurement adapter. Geometry is in physical CSS pixels; the shared measurement adapter returns 375-wide logical units, expressed as twice that value in rpx for the placeholder. Until measurement is available, status-bar plus minimum row height provides an initial estimate.

Capsule measurements retry after mount and retain the last complete geometry for a matching window width/status-bar height during transient invalid reads. `readPageHeaderNavigationMetrics` shares the platform measurements with app overlays. Non-WeChat navigation does not reserve a WeChat capsule. Mini PageLayout uses the original public parts and theme, removing the previous NavBar-specific background, typography, spacing and back-button restyling.

These opt-in platform additions do not rewrite recorded Native source hashes or version alignment. Automated layout tests and builds do not establish simulator or physical-device acceptance. Use navigation mode on pages configured for custom navigation; native navigation pages must not add a second custom bar.

# Upstream sync history

This log records selected Native changes and source provenance. Usage and platform limits live in the [upgrade guide](./docs/content/docs/upgrading.mdx) and [platform guide](./docs/content/docs/platform.mdx).

The 140 baseline records in `source-manifest.json` remain pinned to Native 0.112.0 at `3812a4509eb8b935b14a4f8f173a82d603030491`. Camera has a supplemental record. Alignment versions do not replace their source hashes, implementation states or acceptance states.

## Taro feedback integration — 2026-11-04

Reviewed Native `src/primitives/portal.tsx`, `portal-store.ts`, and `src/components/toast/{index.tsx,toast-store.ts}`. Native `closable` only controls the close button; swipe dismissal remains enabled independently. The Taro-specific optional `swipeToDismiss` flag defaults to the existing behavior and lets persistent business loading feedback opt out explicitly.

Toast portals use a feedback priority above ordinary portal layers, including later nested modals. Layer order and native Canvas occlusion share the same effective order; toast content, timers and animations are retained when modal layers change. These are Taro integration additions, not changes to the recorded Native source hashes or version alignment. Automated coverage does not establish real-device compositor acceptance.

## Native 1.0.0 — 2026-11-03

Alignment checkout: `5bb8b8ec4c106a509937387dc9dd319221811a97`. Package version: `1.0.0`.

- Exported `icon`, `createIcon` and `IconDefaults` through the existing glyph factory; the gallery excludes factories and type-only exports.
- Added `primitives/refs` with Taro host aliases and the existing Input/Textarea handle. React Native host methods are not promised.
- Reviewed Expo SDK 58, RN 0.88, Reanimated and MapLibre changes; they target runtimes absent from Taro and introduce no RN/Expo dependency.
- Preserved baseline and Camera provenance when regenerating the source manifest; the `alignments` entry records reviewed source hashes.
- Validated library/example checks, documentation builds and a packed consumer outside the workspace. The selected icon controls and six themes passed Developer Tools checks; these do not establish physical-device or screen-reader acceptance.

## Native 0.116.0 — 2026-11-02

Alignment checkout: `98523ddb17f26402df7181e8a306e074d0113ece` (2026-10-31 release). Package version at this sync: `0.116.0`.

| Change | Source commit | Taro status |
| --- | --- | --- |
| Tabs colors | `2cf71cc787f60e643dd61abf739eb35a758fc304` | Ported `activeClassName`, `labelClassName`, `activeLabelClassName`; retained `indicatorClassName`. Overrides merge after variant defaults in all four variants. |
| Checkbox shared line and node labels | `d888d764b46cfbb6cc7476f302eb07752e55223e` | Ported `contentClassName`, ReactNode labels and explicit accessible names. Nested label nodes with `onClick` / `onPress` stop bubbling before running their handler, preserving plain-label toggling. |
| Checkbox host props | `d888d764b46cfbb6cc7476f302eb07752e55223e` | Retained Taro View props, events, id, style and ref. `hitSlop` uses the existing shared pressable in unstyled mode. RN-only host props are not promised as native WeChat APIs. |
| Keyboard dismissal | `9d9303ce5a2941e3b2b46cd27395e36b676817a1` | Reviewed; existing Taro cleanup already stops tracking, guards asynchronous measurements and resets translation on dismissal. Added a two-field regression with queued stale measurements; no RN worklet patch copied. |

### Portable APIs and fixes

- Added Camera's thirteen compound parts, four icons and three demonstrations, with WeChat permission, capture, recording and lifecycle adapters.
- Added ImageViewer RTL while preserving logical indices, captions and accessibility order. Replacement touches and pinch gestures settle an interrupted page drag before taking ownership.
- Exposed breakpoint, scroll-section, skeleton-handoff, back-handler and direction hooks; Glass/GlassContainer, portal, scrim and chart-accessibility primitives; cn/color utilities.
- Capped chart font scaling at 1.353. Heatmap's fixed-width grid and weekday gutter resist flex shrinking, and the weekday offset follows font scale.
- The completion catalogue contains 141 Native component pages, 784 upstream-derived variants and 123 icons. Example attribution remains in `example/UPSTREAM-NOTICE.md`.
- Library/example checks, type checks and WeChat/documentation builds passed. Developer Tools checks covered selected Camera controls, hooks, RTL paging and large-font layouts; physical camera capture and screen-reader acceptance were not established.

### Source SHA-256 at the alignment checkout

| Upstream file | SHA-256 |
| --- | --- |
| `packages/panelui/src/components/tabs/index.tsx` | `6d3fa13337de82bbe7aaf8eeddd793f5f2a5306779e300174930101540b3645f` |
| `packages/panelui/src/components/checkbox/index.tsx` | `a189f1513b0f105e85e4d74f2d1a0858b6564d5198262f24424a7f02a0e4dd4d` |
| `packages/panelui/src/hooks/use-keyboard-avoidance.ts` | `2d74a4f8f9eb7aaca60517fda16cbd8f434369b272a6310646ba20756a8941de` |
| `packages/panelui/src/components/camera/index.tsx` | `f69c99611bffa2dc186f035b2bd4460cd226439e31d95fd71aa2567fdd010567` |
| `packages/panelui/src/components/image-viewer/index.tsx` | `f0162e3c7015919559fc93a723758769f2700e368c4806484f626c4647a2baa3` |
| `packages/panelui/src/hooks/use-breakpoint.ts` | `ebfffab7ab5c687d37ec9f59d12d4b5bbe878e7ece4a6e77889fc9b453984300` |
| `packages/panelui/src/hooks/use-scroll-sections.ts` | `20132cd6ddf962dd4d8bc4ccbad831982afa835b24e9bcc289904c963461cf64` |
| `packages/panelui/src/hooks/use-skeleton-handoff.ts` | `30566914cd7ae1685c075ba270900ff3f7fb942dd03b11a0afad018a61df5188` |
| `packages/panelui/src/primitives/glass.tsx` | `b927c3b0908afd830066115efa5326903b2b406fd18d9aebdfd4225941f1c196` |

## AI beta application integration — 2026-11-04

Reviewed Native AI guides and application-owned voice recorder at `73e7e3ad9bd83c611108f86955238742f6560edd`. Exact source paths and SHA-256 hashes are in `example/server/ai-upstream.json`. Native explicitly keeps model integration outside UI components; this adaptation follows that boundary. Existing component baseline records and package version remain unchanged.

The standalone example retains prepared responses and adds a connected Taro chunked-request driver, ordered message/tool/source rendering, cancellation and update coalescing, real WeChat recording, optional transcription and labelled speech playback. A separate Node development server owns compatible provider HTTP calls and the fixed documentation-link tool. It uses an example-local NDJSON protocol, not the AI SDK UIMessage stream. No RN/Expo runtime or provider dependency is added to the component library. English and Simplified Chinese AI guides cover configuration and limitations.

Automated fixtures use a fake provider. Live provider compatibility, WeChat Developer Tools and physical-device microphone, audio, keyboard, scrolling and performance acceptance remain separate; no device performance claim is made. Microphone metering is not inferred from compressed MP3 bytes.
