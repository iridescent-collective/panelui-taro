# PanelUI Taro

A Taro and WeChat mini-program port of **PanelUI Native**, available as the npm package `panelui-taro`.

The port follows Native's compound components, semantic design tokens and six themes. It uses Taro components, WXSS, JavaScript motion and WeChat platform APIs. React and Taro are peer dependencies supplied by the host application.

## Scope and version

This package ports `panelui-native`. The upstream Web collection, `panelui-web`, is outside its scope.

| Item | Current state |
| --- | --- |
| Package version / aligned Native version | `1.0.0` |
| Source coverage baseline | Native `0.112.0`, 140 modules, including FileUpload |
| Pinned source commit | `3812a4509eb8b935b14a4f8f173a82d603030491` |
| Later fixes and additions | Press opacity, overlay exit interaction, ImageViewer thumbnail remeasurement and rapid reopen behavior; Tabs color overrides and Checkbox content/node labels/hitSlop through Native 0.116.0 |
| Native 1.0.0 additions | Public icon/createIcon factory and IconDefaults; Taro ViewRef, TextRef, TextInputRef and ScrollViewRef subpath |
| Completed additions | Camera and ImageViewer RTL; responsive, scroll-section and skeleton hooks; Glass fallback and primitive subpaths |

The package version identifies the upstream release used for alignment. It does not imply complete Native 1.0.0 coverage. See the [source inventory](./source-manifest.json) for baseline implementation and acceptance status, and [sync notes](./UPSTREAM-SYNC.md) for later source commits and hashes.

The upstream project is [panel-ui/PanelUI](https://github.com/panel-ui/PanelUI). Native installation instructions and platform guarantees require adaptation for Taro.

## Documentation website

The Next.js + Fumadocs site lives in [`docs`](./docs/README.md). Run `pnpm dev:panelui-docs` to open it at http://localhost:3100. The site documents actual Taro exports and does not render the Taro runtime in the browser.

## Installation

Before the first npm release, run `pnpm pack` here and install the resulting archive in your Taro app. After publication, install with `pnpm add panelui-taro`. The local example uses `workspace:*`.

Import each component from its public subpath:

```tsx
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { PanelUIProvider } from "panelui-taro/provider";

export function Example() {
  return (
    <PanelUIProvider>
      <Card>
        <Card.Header>
          <Card.Title>Daily activity</Card.Title>
        </Card.Header>
        <Card.Content>
          <Button>View activity</Button>
        </Card.Content>
      </Card>
    </PanelUIProvider>
  );
}
```

The `exports` map in [package.json](./package.json) defines the available paths, including `button`, `map`, `flow`, `plot`, `icons` and `styles`. Subpath imports keep unrelated components out of the mini program's main package.

Load the theme stylesheet from the `panelui-taro/styles` export and include this package's source in Tailwind's `@source` scan. Resolve source paths relative to the stylesheet. Use `designWidth: 750`; the port expresses logical dimensions at twice their size in the 750-unit design space. The [example build configuration](./example/config/index.ts) and [Tailwind entry](./example/src/styles/tailwind.css) show the current setup.

Enable `mini.runtime.enableMutationObserver` in the host's Taro configuration. Collapsible content and decorative slots use it to remeasure after child layout changes. Keep the WeChat ARIA template aligned with the runtime attribute list.

## Themes and composition

Wrap component trees in `PanelUIProvider`. The default theme is Panel light. Panel, Moon and Grass each have light and dark variants; their colors, radii and surface levels live in [`src/styles/panel.scss`](./src/styles/panel.scss).

Use semantic `--panel-*` tokens for themed content. Compose widgets from their exported parts, and use `className` for the layout around them. Reuse component variants for recurring visual differences instead of restyling individual instances.

The provider accepts `reducedMotion`. The host must pass that setting; the port does not claim automatic system reduced-motion detection. Motion runs through CSS and JavaScript rather than RN worklets. Device performance and assistive-technology acceptance remain separate checks.

## Customization

The seven Native customization topics are implemented in the isolated example: Colors, Theming, Charts, Fonts, Icons, Styling and Sizing. Register custom token definitions and paired modes through `registerTheme` / `registerThemeFamily`; the provider, Portals and JavaScript-drawn graphics share their resolved values. Font configuration uses five weight/family tokens and the WeChat font loader.

See the [customization guides](./docs/content/docs/customization) for API examples, source mappings and platform limits. Open `/customization/colors/index` or use the example’s Customization tab. The icon gallery contains 123 existing exported names, including aliases. Camera icons are included.

## Independent example app

The [`example/`](./example/README.md) directory contains a standalone Taro / React WeChat mini program. It has Components / Blocks / Customization navigation, a searchable directory, one route per component and a variant picker. It includes 141 component pages with 784 upstream-derived variants, plus four official Blocks: Smart Home, Wallet, Activity and Boarding Pass.

The example supports the six built-in themes and a registered Sunset light/dark pair, and synchronizes the native navigation and status bars. It does not import business code, login state or environment configuration from `apps/mini`.

Run these commands from the repository root:

```sh
pnpm dev:weapp:panelui
pnpm build:weapp:panelui
```

After building, import `example/dist` into WeChat Developer Tools. The example uses its own project configuration; do not replace it with the business mini program's production AppID.

Official Blocks use the existing components. Two additional local compositions have separate deep links:

- Daily Life: `/showcases/daily-life/index`
- AI Assistant: `/showcases/ai/index`

These local compositions are separate from the four official Blocks. The business identity and onboarding progress components remain available through `profile-identity` and `setup-progress-header`.

## Platform notes

Keep platform differences explicit when integrating a component. The [platform guide](./docs/content/docs/platform.mdx) describes the supported contracts and limitations.

| Area | Taro / WeChat behavior |
| --- | --- |
| FileUpload | The caller supplies `upload`; the component does not connect to business OSS. WeChat adapters use session files, the photo library and the camera. Session file selection cannot browse arbitrary system directories. Native cropping supports seven aspect ratios and rejects unsupported ratios. Media entry points are wired in the isolated acceptance examples. |
| SearchBar | Focus restoration uses page-scoped input ownership. Panel Input and Textarea register themselves. Hosts using Taro Input can call `useInputFocusOwner` from `primitives/input-focus` on real focus / blur events. This is not a browser or RN global focus API. |
| ContextMenu | Long press uses 350 ms touch arbitration; short press uses `Trigger.onPress`. Trigger refs expose host adapters for named actions and keyboard rules. WeChat View does not emit RN keyboard or named accessibility actions. |
| Charts | Native Canvas 2D draws plot geometry. Existing shape primitives, layer APIs and touch semantics are retained. Animation runs on JavaScript rather than RN worklets. Static icons and legend swatches remain SVG images. |
| Map | Uses WeChat's native map. WGS84 input converts to GCJ02 at the platform boundary; the component does not request location. Base maps, clustering, heatmaps and MapLibre styling have platform differences. |
| Signature | Uses WeChat Canvas for drawing and PNG export, with SVG, save, undo and redo APIs. File handling and capture behavior differ from RN. |
| Drawer | Supports four logical edges, RTL, scrollable content and gesture dismissal through the Taro implementation. |

For chart geometry and layer contracts, see the [chart guide](./docs/content/docs/customization/charts.mdx). Map projection and drawing export limits are documented in the [platform guide](./docs/content/docs/platform.mdx).

## Verification

Run from the repository root:

```sh
pnpm --filter panelui-taro test
pnpm --filter panelui-taro typecheck
pnpm test:panelui-example
pnpm --filter panelui-example typecheck
pnpm build:weapp:panelui
```

For UI changes, open the built example in WeChat Developer Tools and exercise the affected states. Record console messages alongside visible results. Track source coverage, behavior tests, build output, simulator checks and physical-device acceptance separately. An entry file or passing render test does not establish complete component acceptance.

## Publishing

The npm package is public and the GitHub repository is private. Follow the [release guide](./docs/releasing.md) to configure npm Trusted Publishing and use the `Publish npm Package` GitHub Actions workflow. Manual runs default to checking and packing without publication; publishing a GitHub Release publishes its exact tag after validation. The workflow publishes the same tarball verified by an independent Taro consumer, using OIDC without an npm token.

Local publication remains available through `pnpm publish --access public`; its `prepublishOnly` hook runs types, tests and the independent consumer build. npm authentication and permission to publish `panelui-taro` are required. See the [documentation deployment guide](./docs/README.md#deployment) for website hosting.

## License and source notices

The upstream port follows the bundled [MIT license](./LICENSE). Retain attribution when copying or adapting source.

WXSS class merging understands weapp-tailwindcss's default escaped class names. It decodes names only to determine merge groups and preserves the encoded output. See [`LICENSE.weapp-core-escape`](./LICENSE.weapp-core-escape).

The spring solver in `src/lib/source-spring.ts` follows Reanimated 4.5.1's analytical spring, duration stiffness solver and energy threshold. The generator checks source SHA-256 values before running the pure mathematical functions to produce four sets of frame samples. It does not run the RN runtime. See the [Reanimated MIT notice](./LICENSES/react-native-reanimated-MIT.txt).
