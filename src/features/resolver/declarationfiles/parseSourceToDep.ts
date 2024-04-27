type sourceDepPath = string;
//type sourceDep =
//	| { type: 'package'; parentPath?: never; sourceDepPath: sourceDepPath }
//	| { type: 'relative'; parentPath: string; sourceDepPath: sourceDepPath };

const exportImportRegex =
	/(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;
export function parseSourceToDepPath(sourceContent: string): sourceDepPath[] {
	const dependencies: sourceDepPath[] = [];
	let match;
	while ((match = exportImportRegex.exec(sourceContent)) !== null) {
		dependencies.push(match[1]);
	}
	return dependencies;
}
//function parseSourceToDep(depPaths: sourceDepPath[]): sourceDep[] {}
