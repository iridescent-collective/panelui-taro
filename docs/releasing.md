# Publishing panelui-taro to npm

The workflow is `.github/workflows/release-npm.yml`, named **Publish npm Package**. It accepts an existing GitHub Release or a manual run; it does not calculate versions or create releases. The repository can stay private while the npm package is public.

## One-time npm setup

The npm package must already exist before a Trusted Publisher can be configured. If this is the first release, publish the initial version locally using `mise exec -- npm login` followed by `mise exec -- pnpm publish --access public`. Do not publish the same version again from Actions; use a new version for the first OIDC release.

In the npm package's Settings → Trusted Publisher, configure:

| Field | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `iridescent-collective` |
| Repository | `panelui-taro` |
| Workflow filename | `release-npm.yml` |
| Environment | Leave empty |
| Allowed action | Allow direct publication with `npm publish` |

No `NPM_TOKEN` or GitHub App is required. Only the publish job has `id-token: write`; it downloads the checked tarball and never checks out source or runs package lifecycle scripts. The build uses `.mise.toml`; the publish job uses the matching Node version and npm 11.21.0. Provenance is disabled because the source repository is private.

See [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) and [npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/). npm currently requires a new trust configuration to complete its first successful publication within two days; configure it close to the next release.

## Check the workflow without publishing

Open Actions → Publish npm Package → Run workflow. Select the intended branch or tag, enter its exact `package.json` version, and leave **dry_run** enabled. This freezes the selected commit, installs from the lockfile, checks types, runs library and example tests, builds the WeChat example, packs once, then installs and builds that exact archive in an independent consumer. Download `npm-package` to inspect the archive and `release.json` source/integrity record. A successful dry run does not publish anything to npm.

## Publish a version

Commit the intended version in the root `package.json`; keep its version relationship with the Native source inventory explicit. Version changes remain a separate maintenance decision.

Either publish a GitHub Release with a tag matching `v<package.json version>`, or run the workflow manually at the intended branch/tag with that exact version and **dry_run** disabled. Release events resolve the tag to a full SHA and reject tags moved from the original event SHA; manual runs use the selected ref's SHA. Stable versions use `latest`; `-canary.N` and `-beta.N` use the corresponding npm channel. Mark prerelease GitHub Releases accordingly.

The publish job verifies the downloaded archive's SHA-512, checks whether the npm version exists, and publishes the checked file through OIDC. It then verifies the registry version, integrity and channel. Build success and saved artifacts are reported separately from verified npm delivery.

## Recover an interrupted publication

Re-run the original workflow run to preserve its source identity. Alternatively select the original tag and exact version manually. An existing version is reused only if its integrity matches the checked tarball; different bytes fail instead of overwriting. If the version exists but its channel points elsewhere, inspect subsequent releases before changing the channel. The workflow does not move an existing channel backwards during recovery.
