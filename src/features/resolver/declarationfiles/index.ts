import {
	parseSourceToDep,
	parseSourceToDepPath,
} from '../core/parseSource/index.ts';
import '../fetch/index.ts';
import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
} from '../utils/urls/index.ts';
import { resolvePackageTypesToURL } from './resolvePackageTypesSource.ts';
import { PackageJson } from './types/index.ts';
const sample_test_source = `
	import react from "react";
`;

const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

function handleResponse(response: Response): Promise<PackageJson> {
	if (!response.ok) {
		return Promise.resolve({} as PackageJson);
	}
	return response.json();
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
async function resolveDTFiles(sourceContent: string, parentTypesPath = '') {
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
			sourceContent = resolveDTFiles(packageDeclarationFile) + sourceContent;
		}
	}
	return sourceContent;
}

resolveDTFiles(sample_test_source);
