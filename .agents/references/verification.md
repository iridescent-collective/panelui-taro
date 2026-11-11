# PanelUI Verification

Select the checks affected by the change; this is not a mandatory full-suite sequence. Commands run from the repository root.

```sh
pnpm build
pnpm test:package
pnpm verify:package
pnpm --filter panelui-taro test
pnpm --filter panelui-taro typecheck
pnpm test:panelui-example
pnpm --filter panelui-example typecheck
pnpm build:weapp:panelui
```

For UI/runtime changes, inspect `example/dist` in WeChat Developer Tools. Record actions, visible results, and console changes; separate simulator and physical-device evidence from exports, tests, and builds.

For website changes, run `pnpm build:panelui-docs` and `pnpm typecheck:panelui-docs`; verify desktop/mobile navigation, search, and the production standalone artifact. Do not present the homepage illustration as an actual Taro browser runtime.

The library publishes compiled default/type entries and retains source for Tailwind. Internal tests and the example enable the `source` export condition; the packed-consumer check must use default compiled entries. Run the library build before typechecking a fresh checkout.
