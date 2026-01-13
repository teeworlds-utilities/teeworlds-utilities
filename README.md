# Teeworlds assets utilities

[![check_then_build](https://github.com/teeworlds-utilities/teeworlds-utilities/actions/workflows/check_then_build.yml/badge.svg)](https://github.com/teeworlds-utilities/teeworlds-utilities/actions/workflows/check_then_build.yml)

[![built with nix](https://builtwithnix.org/badge.svg)](https://builtwithnix.org)

This GitHub repository is a project which contains a TypeScript package which exposes an API for manipulating Teeworlds game assets. It provides multiple functionalities, including assembly, rendering, coloring, emotes and skins emoticons.

## Getting started

To build the project you need [NodeJS](https://nodejs.org) version 18.x or 20.x and [libuuid](https://linux.die.net/man/3/libuuid). Then you can run the following command line to build the project.

``` shell
npm run ci && npm run build
```

## Tests

You can run the unitary tests with the following command:

```bash
npm run test
```

Optionally you can set the environment variable `DEBUG` to the value `true` if you want more details.

## Examples

If you want to see examples of how to use the library, you can check the **`**.test.ts`\*\* files, such as [asset](./lib/asset/asset.test.ts).

## Versioning strategy

[Semantic versioning](https://semver.org) has been adopted by the project using the Git tag `v1.2.16`.

## Contribute

If you want to help the project, you can follow the guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md).
