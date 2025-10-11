# BangScript
Run Javascript/Typescript without a build/compile step. Import, run third-party libraries with type intellisnse.

## Features

## How it works
For running Javascript, tscript scans the user code for `import` statements and replaces the package names with their equivalent `esm` remote urls from npm. Since browsers support `esm` modules natively , no webpack,parcel etc is required.

## Demo

## Challenges
When an npm process install a package, not only does it writes the source code and the `.d.ts` of the package to the file system it also includes the files the package depends on, but since we don't have access to the file system in the browser we don't have this luxury.


## Next Steps
