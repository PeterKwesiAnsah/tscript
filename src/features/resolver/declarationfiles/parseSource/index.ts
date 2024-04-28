import { getSourceDepPathType } from '../getSourceDepPathType.ts';

type sourceDepPath = string;
export type sourceDep =
	| { type: 'package'; parentPath: string; sourceDepPath: sourceDepPath }
	| { type: 'absolute'; parentPath: string; sourceDepPath: sourceDepPath }
	| { type: 'relative'; parentPath: string; sourceDepPath: sourceDepPath };

const exportImportRegex =
	/(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;
/**Parses Source strings into an array of import paths */
export function parseSourceToDepPath(sourceContent: string): sourceDepPath[] {
	const dependencies: sourceDepPath[] = [];
	let match;
	while ((match = exportImportRegex.exec(sourceContent)) !== null) {
		dependencies.push(match[1]);
	}
	return dependencies;
}
export function parseSourceToDep(
	depPaths: sourceDepPath[],
	parentPath: string
): sourceDep[] {
	return depPaths.map((modulePath) => {
		return {
			type: getSourceDepPathType(modulePath),
			parentPath,
			sourceDepPath: modulePath,
		};
	});
}
