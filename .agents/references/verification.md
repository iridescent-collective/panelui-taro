# PanelUI Verification

Select the checks affected by the change; this is not a mandatory full-suite sequence. Commands run from the repository root.

```sh
pnpm --filter panelui-taro test
pnpm --filter panelui-taro typecheck
pnpm test:panelui-example
pnpm --filter panelui-example typecheck
pnpm build:weapp:panelui
```

For UI/runtime changes, inspect `example/dist` in WeChat Developer Tools. Record actions, visible results, and console changes; separate simulator and physical-device evidence from exports, tests, and builds.

For website changes, run `pnpm build:panelui-docs` and `pnpm typecheck:panelui-docs`; verify desktop/mobile navigation, search, and the production standalone artifact. Do not present the homepage illustration as an actual Taro browser runtime.
