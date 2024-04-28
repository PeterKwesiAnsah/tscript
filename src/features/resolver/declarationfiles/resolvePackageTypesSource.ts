import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
} from '../utils/urls/index.ts';
import { PackageJson } from './types/index.ts';
import * as path from 'path';

//Takes in Package JSONs resolve the types path to a remote URL
export function resolvePackageTypesToURL(pkgs: [PackageJson, PackageJson]) {
	let resolvedTypesPathToSource = '';
	for (const packageJson of pkgs) {
		const pathToTypes = packageJson.types;
		if (!pathToTypes) {
			continue;
		}
		const packageName = packageJson.name;
		//package didn't ship with declaration files
		if (packageName.startsWith('@types')) {
			resolvedTypesPathToSource =
				getDefinitelyTypedBaseURL() +
				path.join(packageName.split('/')[1], pathToTypes);
		} else {
			resolvedTypesPathToSource =
				getJSDelivBaseURL() + path.join(packageName, pathToTypes);
		}
	}
	return resolvedTypesPathToSource;
}
