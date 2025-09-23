//TODO: add <reference path /> check
export function getSourceDepPathType(sourceDepPath: string) {
	if (
		sourceDepPath.startsWith('./') ||
		sourceDepPath.startsWith('../') ||
		sourceDepPath.endsWith('.d.ts')
	) {
		return 'relative'; // Path starts with './' or '../', so it's a relative path
	} else if (sourceDepPath.startsWith('/')) {
		return 'absolute'; // Path starts with '/', so it's an absolute path
	} else {
		return 'package'; // Otherwise, it's a bare module name
	}
}
