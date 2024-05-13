import { tsConfigOptions } from "@/features/editor/components/configs/types";

export const defaultCompilerTypeCheckingOptions: tsConfigOptions = [
  {
    name: 'noImplicitAny',
    value: true,
    description: 'Enable error reporting for expressions and declarations with an implied any type.',
  },
  {
    name: 'strictNullChecks',
    value: true,
    description: 'When type checking, take into account null and undefined.',
  },
  {
    name: 'strictFunctionTypes',
    value: true,
    description: 'When assigning functions, check to ensure parameters and the return values are subtype-compatible.',
  },
  {
    name: 'strictPropertyInitialization',
    value: true,
    description: 'Check for class properties that are declared but not set in the constructor.',
  },
  {
    name: 'noImplicitThis',
    value: true,
    description: 'Enable error reporting when this is given the type any.',
  },
  {
    name: 'noImplicitReturns',
    value: true,
    description: 'hello user',
  },
  {
    name: 'alwaysStrict',
    value: true,
    description: 'hello user',
  },
  {
    name: 'allowUnreachableCode',
    value: true,
    description: 'hello user',
  },
  {
    name: 'allowUnusedLabels',
    value: true,
    description: 'hello user',
  },
  {
    name: 'downlevelIteration',
    value: true,
    description: 'hello user',
  },
  {
    name: 'noEmitHelpers',
    value: true,
    description: 'hello user',
  },
  {
    name: 'noLib',
    value: true,
    description: 'hello user',
  },
  {
    name: 'noStrictGenericChecks',
    value: true,
    description: 'hello user',
  },
  {
    name: 'noUnusedLocals',
    value: true,
    description: 'Enable error reporting when local variables aren\'t read.',
  },
  {
    name: 'noUnusedParameters',
    value: true,
    description: 'Raise an error when a function parameter isn\'t read.',
  },
  {
    name: 'esModuleInterop',
    value: true,
    description: 'hello user',
  },
  {
    name: 'preserveConstEnums',
    value: true,
    description: 'hello user',
  },
  {
    name: 'removeComments',
    value: true,
    description: 'hello user',
  },
  {
    name: 'skipLibCheck',
    value: true,
    description: 'hello user',
  },
  {
    name: 'experimentalDecorators',
    value: false,
    description: 'hello user',
  },
  {
    name: 'emitDecoratorMetadata',
    value: false,
    description: 'hello user',
  },
  {
    name:'target',
    value: 'ES2017',
    description:'',
    options:['ES2015','ES2016','ES2017','ES2018','ES2019','ES2020','ESNext','Latest']
  },
  {
    name:'jsx',
    value: 'None',
    options:['None','Preserve','React','ReactNative','ReactJSX','ReactJSXDev']
  },
  {
    description:'Enable all strict type-checking options.',
    name:'strict',
    value: true
  }
]
