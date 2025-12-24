---
name: xcode-build
description: Build and test Apple platform projects using Xcode tooling. Use when working with Xcode projects, Swift packages, or Apple platform development.
compatibility: Requires macOS with Xcode; examples assume `xcodebuild` and optional `xcbeautify`.
---

# Xcode Build & Test

Build and test Apple platform projects using `xcodebuild` (pipe through `xcbeautify` if installed for readable output).

## Quick Start

```bash
# Optional: pipe through xcbeautify for readable output
set -o pipefail && xcodebuild [flags] | xcbeautify
```

## Common Commands

| Task | Command |
|------|---------|
| List schemes | `xcodebuild -list` |
| List simulators | `xcrun simctl list` |
| Build | `xcodebuild -scheme $SCHEME -configuration Debug build` |
| Test | `xcodebuild -scheme $SCHEME test` |
| Clean | `xcodebuild clean` |

## Build for iOS Simulator

```bash
set -o pipefail && xcodebuild \
    -workspace $PROJECT_NAME.xcodeproj/project.xcworkspace \
    -configuration Debug \
    -scheme $SCHEME \
    -sdk iphonesimulator \
    -destination "platform=iOS Simulator,name=iPhone 16" \
    | xcbeautify
```

## Test Swift Package

For Swift packages, append `-Package` to the scheme name:

```bash
set -o pipefail && xcodebuild \
    -configuration Debug \
    -scheme $SCHEME-Package \
    -sdk iphonesimulator \
    -destination "platform=iOS Simulator,name=iPhone 16" \
    test | xcbeautify
```

## Platform-Specific Guides

- [Platform destinations](platforms.md) - iOS, macOS, visionOS configurations
- [Swift Package Manager](swiftpm.md) - SwiftPM workspace integration
- [Profiling](profiling.md) - Performance profiling with Instruments
