# Change Log

All notable changes to the "colorize-folder-tree" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.8] - 2026-09-05

### Added
- Rainbow styles are restored automatically if a VS Code update removes them
- The extension checks whether its styles are up to date and refreshes them when needed

### Changed
- Your enabled or disabled setting and selected mode are remembered after updates
- Messages now explain when an update requires a restart or administrator permission

## [0.0.7] - 2026-09-05
### Fixed
- Resolved an issue where Explorer tree view styles failed to load on startup when the Command Palette opened automatically ([Issue #1](https://github.com/Raj-Srikar/colorize-folder-tree/issues/1))

## [0.0.6] - 2026-03-28

### Removed
- Removed unnecessary sections from the README.

## [0.0.5] - 2026-03-28

### Fixed
- Updated README demo image paths to be relative, ensuring they display correctly on the VS Code Marketplace

## [0.0.4] - 2026-03-28

### Added
- Added GIF demos to the README showcasing both "On Hover" and "Always" modes in action
- Added extension logo

### Changed
- Updated the color palette in the README to use more vibrant, visually distinct colors inspired by popular bracket pair colorization themes, improving visibility and aesthetics

## [0.0.3] - 2026-03-28

### Added

- Added runtime VS Code version guard: warns and exits on versions below 1.113.0
- Added GIFs to README showcasing the extension in action

### Fixed
- Changing to "Always" from "On Hover" mode causing the extension to corrupt the workbench HTML, making it impossible to disable without manually restoring the backup file.

## [0.0.2] - 2026-03-28

### Fixed

- Updated CSS selectors to be compatible with the latest VS Code update (1.113+)

## [0.0.1] - 2026-03-13

- Initial release