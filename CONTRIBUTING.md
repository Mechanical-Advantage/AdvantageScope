# Contributing to AdvantageScope

Thank you for your interest in contributing to **AdvantageScope**! This project is maintained by **Littleton Robotics** and the community, and is distributed as part of the **WPILib** project. To ensure that AdvantageScope remains reliable for all teams, we have established a set of guidelines for contributions.

Please remember to behave with **Gracious Professionalism** in all interactions. Any questions or concerns can be directed to software@team6328.org.

## General Contribution Rules

- **Reliability is Paramount:** AdvantageScope is a critical tool for teams. Changes must not break existing visualization capabilities or log parsing.
- **Backward Compatibility:** Changes should support existing log formats and configurations where possible. AdvantageScope is expected to continue opening logs generated in prior years (within reason). We may occasionally allow breaking changes to support long-term maintainability, but this should be avoided in most cases.
- **Platform Parity:** AdvantageScope runs as a desktop application (Windows, macOS, and Linux) and a web application (AdvantageScope Lite). Most features should be supported in all environments unless prevented by technical limitations.
- **Documentation:** Most code changes require corresponding updates to the documentation. Please ask us for help if you're not sure where to start.
- **Broad Applicability:** Features should be useful to a wide range of teams. New logging formats should be broadly supported and useful to many users.

## What to Contribute

- **Bug Reports & Fixes:** We welcome fixes for bugs found during or after the season. Please submit a GitHub issue first to track the bug.
- **Feature Improvements:** Improvements to the AdvantageScope feature-set are welcome, but feature changes will generally not be merged until _after_ the competition season. For large changes, please open a GitHub issue or contact us at software@team6328.org before starting work.

## Development Setup

AdvantageScope is a Node.js application using Electron and TypeScript. It also uses C++ (via WebAssembly) for high-performance tasks, which requires Emscripten.

1. **Node.js Version:** Ensure you have Node.js installed (LTS version recommended).
2. **Emscripten:** Install _Emscripten 4.0.12_. This is required to compile the WebAssembly logic used in the application.
3. **Clone the Repository:**

```bash
git clone https://github.com/Mechanical-Advantage/AdvantageScope.git
cd AdvantageScope
```

4. **Install Dependencies:**

```bash
npm install
```

_Note: The `postinstall` script will automatically handle downloading supplemental resources, including Tesseract language support, Owlet binaries, and bundled assets for AdvantageScope Lite.._

## Building Distributions

AdvantageScope can be built in three different distribution modes: **FRC 6328** (default), **WPILib** (bundled with the WPILib installer), and **Lite** (web version). This is controlled by the `ASCOPE_DISTRIBUTION` environment variable.

To build a specific distribution, export the variable _before_ running the build command:

- **FRC 6328 (Default):**

```bash
export ASCOPE_DISTRIBUTION=FRC6328
```

- **WPILib Distribution:**

```bash
export ASCOPE_DISTRIBUTION=WPILIB
```

- **Lite (Web) Distribution:**

```bash
export ASCOPE_DISTRIBUTION=LITE
```

## Available NPM Tasks

The following tasks are defined in `package.json` to assist with development:

### Running and Building

- `npm start`: Runs the application in development mode.
- `npm run build`: Full production build. Compiles code, builds WebAssembly, builds documentation, and packages the Electron app.
- `npm run build-linux`: Full production build for Linux. Runs an alternative version of Electron that works correctly on Wayland (to be fixed in the future).
- `npm run fast-build`: Compiles and packages the application into a directory (unpacked) rather than an installer. Useful for quick local testing of the production build.
- `npm run compile`: Runs Rollup to compile the TypeScript source bundles.
- `npm run wasm:compile`: Compiles the C++ logic to WebAssembly (requires Emscripten).

### Documentation

- `npm run docs:start`: Starts the documentation development server (Docusaurus).
- `npm run docs:build`: Builds the static documentation site.

### Formatting

- `npm run format`: Automatically fixes formatting issues using Prettier and adds license headers.
- `npm run check-format`: Checks code for formatting errors without modifying files.

## Developing in Watch Mode

When developing, you can use `npm run watch` to automatically recompile bundles when files change. However, recompiling the entire application is often unnecessary and slow.

To speed up development, we recommend building only the subset of bundles you are actively working on by passing flags to the watch command.

**Usage:**

```bash
npm run watch -- [flags]
```

**Available Flags:**
Refer to `rollup.config.mjs` for the specific bundle configurations:

- `-- --configMain`: Rebuilds the main process and preload scripts.
- `-- --configLargeRenderers`: Rebuilds the Hub and Satellite renderers (the main UI).
- `-- --configSmallRenderers`: Rebuilds smaller pop-up windows (Preferences, Export, Unit Conversion, etc.).
- `-- --configWorkers`: Rebuilds web workers (Log parsers, export workers, etc.).
- `-- --configXR`: Rebuilds XR client scripts.

**Example:**
If you are only working on the main UI logic, run:

```bash
npm run watch -- --configLargeRenderers
```

## Building for Multiple Platforms

AdvantageScope uses `electron-builder` for packaging. You can build for specific platforms by passing flags to the build command.

- **Build for current platform:**

```bash
npm run build
```

- **Build for specific targets:**
  Append arguments for `electron-builder` after the `--` separator.

```bash
# Build for Windows (x64)
npm run build -- --win --x64

# Build for macOS (dmg)
npm run build -- --mac

# Build for Linux (AppImage, deb, etc.)
npm run build -- --linux
```

## Bundled Assets

AdvantageScope assets are stored in multiple locations:

- The `bundledAssets` folder includes assets bundled in all versions of AdvantageScope, for both desktop and web distributions.
- The [`AdvantageScopeAssets`](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) repository includes additional assets downloaded by the desktop version of AdvantageScope. Bundled assets are also available, which can be added to AdvantageScope Lite after installation.
- The `bundleLiteAssets.mjs` script defines specific assets from the remote repository (2) to be bundled in AdvantageScope Lite for offline use.

Please contact us at software@team6328.org if you are interested in contributing to the set of built-in AdvantageScope assets, including the files stored in the `AdvantageScopeAssets` repository.

## Coding Guidelines & Formatting

AdvantageScope enforces code formatting using **Prettier**.

### Checking Formatting

To check if your code meets the style guidelines without modifying files:

```bash
npm run check-format
```

### Applying Formatting

To automatically fix formatting issues and add missing license headers:

```bash
npm run format
```

It is highly recommended to run `npm run format` before every commit.

## Submitting Changes

### Pull Request Process

1. **Fork** the repository and push your changes to a branch on your fork.
2. **Open a Pull Request (PR)** against the `main` branch of AdvantageScope.
3. **Description:** Clearly explain _what_ you changed, _why_ you changed it, and _how_ you tested it.
4. **Documentation:** If your change adds a new feature or alters behavior, please indicate if documentation updates are needed.

### Review

Your code will be reviewed by maintainers, and we may request changes to ensure code style consistency, API stability, or performance. AdvantageScope is developed by volunteers, so code reviews may be delayed (especially during the competition season). Please reach out to us via GitHub or email (software@team6328.org) if you have any questions or concerns about an open pull request.

### Licensing

By contributing to AdvantageScope, you agree that your code will be distributed under the project's BSD license ([link](LICENSE)). You should not contribute code that you do not have permission to relicense in this manner, such as code that is licensed under GPL that you do not have permission to relicense.
