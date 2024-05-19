import { parseSourceToDep, parseSourceToDepPath } from './parseSource.ts';
import '../fetch/index.ts';
import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
} from '../utils/urls/index.ts';

import { PackageJson } from '../declarationfiles/types/index.ts';
import { resolvePackageTypesToURL } from '../declarationfiles/resolvePackageTypesSource.ts';

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

function createSourceDep(sourceContent: string, parentTypesPath = '') {
	const dep = parseSourceToDepPath(sourceContent.replace(commentRegex, ''));
	//TODO: <reference dependecies />
	const sourceDep = parseSourceToDep(dep, parentTypesPath);
	return sourceDep;
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
export async function depGraph(
	entrySourceContent: string,
	parentTypesPath = ''
) {
	//console.log(sourceContent);

	const sourceDep = createSourceDep(entrySourceContent, parentTypesPath);

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
			//child dependencies
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				modulePath.sourceDepPath
			);
			for (const childSourceDep of childSourceDependcies) {
				sourceDep.push(childSourceDep);
			}
		}
	}
	return sourceDep;
}
