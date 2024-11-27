# Changelog

## [Unreleased]

## [2.0.2] - 2024-11-27
### Fixed
- Align the version number displayed by the CLI utility with the actual package release version.

## [2.0.1] - 2024-11-27
### Fixed
- Should now properly handle properties defined in the `oneOf`, `anyOf`, `allOf`, `if`, `then`, `else`  sections of a JSON Schema. \
  This also applies to the `getJSONPathsFromSchema` function.

## [2.0.0] - 2024-11-24
### Changed
- Add boolean parameter `leaves` to `getJSONPathsFromObject` and `getJSONPathsFromSchema` functions.
- The `getJSONPathsFromObject` function is now asynchronous.

## [1.0.1] - 2024-11-23
### Changed
- Adjust inconsistent naming in mentions of `JSON Schema` and `JSONPath`.

## [1.0.0] - 2024-11-20
### Added
- Initial release.

[Unreleased]: https://github.com/alex-massa/extract-jsonpaths/compare/2.0.2...HEAD
[2.0.2]: https://github.com/alex-massa/extract-jsonpaths/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/alex-massa/extract-jsonpaths/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/alex-massa/extract-jsonpaths/compare/1.0.1...2.0.0
[1.0.1]: https://github.com/alex-massa/extract-jsonpaths/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/alex-massa/extract-jsonpaths/commits/1.0.0
