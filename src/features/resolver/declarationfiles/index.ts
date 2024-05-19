import { depGraph } from '../core/depGraph.ts';
import { parseSourceToDep, parseSourceToDepPath } from '../core/parseSource.ts';
import '../fetch/index.ts';
import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
} from '../utils/urls/index.ts';
import { resolvePackageTypesToURL } from './resolvePackageTypesSource.ts';
import { PackageJson } from './types/index.ts';
// const sample_test_source = `
// 	import react from "axios";
// `;

const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

function handleResponse(response: Response): Promise<PackageJson> {
	if (!response.ok) {
		return Promise.resolve({} as PackageJson);
	}
	return response.json();
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
export async function resolveDTFiles(
	sourceContent: string,
	parentTypesPath = ''
) {
	//console.log(sourceContent);
	const dep = parseSourceToDepPath(sourceContent.replace(commentRegex, ''));
	//TODO: <reference dependecies />
	const sourceDep = parseSourceToDep(dep, parentTypesPath);
	for (const modulePath of sourceDep) {
		if (modulePath.type === 'package') {
			const [pkgFromJsDeliv, pkgFromDT] = await Promise.all([
				(async () => {
					return handleResponse(
						await fetch(
							getJSDelivBaseURL() + `${modulePath.sourceDepPath}/package.json`
						)
					);
				})(),
				(async () => {
					return handleResponse(
						await fetch(
							getDefinitelyTypedBaseURL() +
								`${modulePath.sourceDepPath}/package.json`
						)
					);
				})(),
			]);
			const cdnURL = resolvePackageTypesToURL([pkgFromJsDeliv, pkgFromDT]);
			//console.log(cdnURL);
			const packageDeclarationFile = await fetch(cdnURL).then((res) =>
				res.text()
			);
			// //TODO: get graph dep first
			// sourceContent =
			// 	(await resolveDTFiles(packageDeclarationFile)) + sourceContent;
		}
	}
	return sourceContent;
}

depGraph(`import zustand from "zustand";`).then((deps) => {
	console.log(deps);
	//console.log(new Set(deps).size);
});
