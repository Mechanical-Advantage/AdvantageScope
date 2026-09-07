# Patches

This directory contains patches applied via `patch-package`.

## app-builder-lib+26.15.3.patch

Fixes a race condition with Azure Trusted Signing that corrupts binaries due to concurrent signing calls. This patch can likely be removed when upgrading to `electron-builder` `v27+`. See the [issue](https://github.com/electron-userland/electron-builder/issues/9076) and [patch source](https://github.com/electron-userland/electron-builder/issues/9076#issuecomment-3258244592).
