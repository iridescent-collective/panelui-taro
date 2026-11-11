# PanelUI Taro Development Reference

Paths below are relative to the repository root.

Port PanelUI Native to Taro and WeChat Mini Programs.

## Upstream and coverage

- For component porting or behavior changes, inspect `/Users/iridescent/front_end/PanelUI`: `packages/panelui/` for implementation and public APIs, `apps/example/src/data/demos/` for variants, and `packages/panelui/blocks/` for compositions.
- Port the Native collection's parts, variants, tokens, and behavior. Web substitutes or capabilities absent from Native require an authorized scope change.
- Match the package version to the Native version used for sync. Preserve source commits, hashes, coverage and acceptance states in `source-manifest.json` and `UPSTREAM-SYNC.md`; a version bump does not establish source alignment or runtime acceptance.
- Retain MIT attribution, bundled notices and provenance. The npm package is configured for public publication. Run fresh-consumer compatibility checks before publishing; publish only when explicitly requested.

## Component and platform contracts

- Use `src/components/<PascalCaseName>/` and neighboring type, hook and constant conventions. Define variants outside render functions.
- Preserve compound-part identity and semantics, host props, handlers, accessibility state, `className` and styles. Reuse parts in demos and Blocks.
- Use `className` for call-site layout, variants or semantic `--panel-*` tokens for recurring appearance. Preserve Panel, Moon and Grass themes in light and dark modes.
- Adapt React Native/Expo behavior through Taro, WeChat APIs and existing adapters without adding an RN/Expo runtime. Map accessibility to supported WeChat semantics and keep templates aligned with runtime properties.
- Keep overlays mounted through exit animations; release interaction when closing starts. Preserve nested-modal isolation, focus restoration and rapid reopening.
- Use declared dependencies and package subpath exports. Avoid a root barrel that loads the library into the main package. Shared components must not import business pages, stores, routes or services.
- Follow [example setup](../../example/README.md) for Tailwind/WXSS and `designWidth: 750`; preserve WXSS class escaping. Keep motion in the existing CSS/JavaScript implementation, without claiming Reanimated UI-thread execution or native performance without device evidence.

## Canvas and SVG

- Use native Canvas 2D for changing plots, live drawing, waveforms, animated graphic fields, interactive dials and changing progress geometry. Preserve public APIs, theme tokens and visual styles.
- Keep static graphics as SVG images, including QR codes, color wheels, theme thumbnails, fixed background tiles and legend swatches. Layout, text and View/CSS animations retain their rendering.
- Use `CanvasGraphics` for declarative geometry and `useCanvasSurface` for imperative drawing. `Path`, `Circle`, `G` and related `static-svg` primitives describe geometry; they do not imply SVG image rendering. Do not serialize changing geometry to SVG/data URLs or update `Image.src` per frame.
- Reuse the Canvas lifecycle for DPR sizing, frame coalescing, bounded retries, app hide/show, portal occlusion and cleanup. Do not reset bitmap dimensions on content updates or restore animated SVG rendering for scrolling graphics.
- Preserve explicit SVG/PNG exports and static previews. Freeze existing SVG compatibility snapshots while Canvas is unavailable; do not resume continuous SVG rendering or add a public renderer-selection API.
- Inspect the visible drawing surface and composed components: Canvas for touch or export alone does not establish Canvas-drawn graphics. Keep geometry fixtures separate from native lifecycle tests; verify rendering changes on devices.

## Examples, docs and dependencies

- Preview in the isolated `example/` project; integrate device capabilities into business pages only when requested.
- Keep package documentation in English and the `docs/` Fumadocs guides in English and Simplified Chinese. Document supported APIs and WeChat picker, map, canvas, permission and export limits.
- Each component-library bug fix must update both `docs/content/docs/troubleshooting.mdx` and `docs/content/docs/troubleshooting.zh-CN.mdx`. Record symptom/trigger, confirmed cause, fix or workaround, and verification scope with pending simulator/device checks. Extend matching entries and keep both languages aligned.
- Generate component MDX and website catalogue from package/example metadata. Exclude generated component pages, catalogue JSON, `.next`, `.source`, caches and builds from commits; retain licenses, source manifest, fixtures and capture scripts.
- Use named `panelui-*` dependency catalogs with caret ranges and retain the lockfile. Keep Taro on compatible 4.2 unless a wider upgrade is authorized; do not change business directories to work around upgrades.
- Vendor the compatible variants runtime and declarations with license and provenance; consumers must not need workspace patches.
