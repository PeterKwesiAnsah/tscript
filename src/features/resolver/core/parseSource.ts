/* eslint-disable no-mixed-spaces-and-tabs */
import { getSourceDepPathType } from './getSourceDepPathType.ts';

type sourceDepPath = string;
export type sourceDep =
	| {
			type: 'package';
			/**Describes in which directory the parent file is located */
			parentDir: string;
			sourceDepPath: sourceDepPath;
			/**Describes  where the parent file is located */
			parentFilePathname?: string;
			sourceContent: string;
	  }
	| {
			type: 'absolute';
			/**Describes in which directory the parent file is located */
			parentDir: string;
			sourceDepPath: sourceDepPath;
			/**Describes  where the parent file is located */
			parentFilePathname?: string;
			sourceContent: string;
	  }
	| {
			type: 'reference';
			/**Describes in which directory the parent file is located */
			parentDir: string;
			sourceDepPath: sourceDepPath;
			/**Describes  where the parent file is located */
			parentFilePathname?: string;
			sourceContent: string;
	  }
	| {
			type: 'relative';
			/**Describes in which directory the parent file is located */
			parentDir: string;
			sourceDepPath: sourceDepPath;
			/**Describes  where the parent file is located */
			parentFilePathname?: string;
			sourceContent: string;
	  };

export const exportImportRegex =
	/(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;

export function parseSourceToOriginalDep(sourceContent: string) {
	const dependencies: {
		importStatement: string;
		importResource: string;
	}[] = [];
	let match;
	while ((match = exportImportRegex.exec(sourceContent)) !== null) {
		dependencies.push({
			importStatement: match[0],
			importResource: match[1],
		});
	}
	return dependencies;
}
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
	parentDir: string = '',
	sourceContent: string = ''
): sourceDep[] {
	return depPaths.map((modulePath) => {
		return {
			type: getSourceDepPathType(modulePath),
			parentDir,
			sourceDepPath: modulePath,
			sourceContent,
		};
	});
}
