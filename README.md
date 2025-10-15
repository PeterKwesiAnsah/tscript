# tscript

Run JavaScript/TypeScript without a build or compile step. Import and execute third-party libraries with TypeScript IntelliSense support

## Features

- [x] Auto play
- [x] Third-party libraries import
- [ ] Multiple Themes
- [ ] Theme builder
- [ ] Custom Typescript Compiler Options
- [ ] Efficient Type intellisnse(via Web Containers)
- [ ] Code Snapshot

## How it works

For running Javascript, tscript scans the user code for import statements and replaces the package names with their equivalent esm remote urls from a [cdn](https://esm.sh/). Since browsers support esm modules natively , no webpack,parcel etc is required.

## Demo

**_Coming Soon_**

## Challenges

Traditional package managers resolve dependency trees and write files to disk, including type definitions.In the browser, this process becomes non-trivial and inefficient because each module (and its dependencies) must be fetched individually via HTTP requests. Several technologies like Web Containers provide a virtual file system(VFS) in-memory, virtual processes inside the browser. What that means that we can install a package and have all of it files and dependents at one go all in the browser, eliminating our drawbacks.

## Next Steps

- Integrate WebContainers for full dependency resolution and IntelliSense
- Add support for custom TypeScript compiler options
- Implement theme switching and a theme builder
- Add a snapshot feature to save and share code examples
