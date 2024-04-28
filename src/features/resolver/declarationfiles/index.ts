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
	import react from "ts-match";
`;
function handleResponse(response: Response): Promise<PackageJson> {
	if (!response.ok) {
		return Promise.resolve({} as PackageJson);
	}
	return response.json();
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
async function resolveDTFiles(sourceContent: string, parentTypesPath = '') {
	const dep = parseSourceToDepPath(sourceContent);
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
			// const pathToTypes: string | undefined =
			// 	JSON.parse(pkgFromJsDeliv).types || JSON.parse(pkgFromDT).types;
			// if (pathToTypes) {
			// 	//fetch where the types is defined
			// }
			// console.log(pathToTypes);
			console.log(resolvePackageTypesToURL([pkgFromJsDeliv, pkgFromDT]));
			//const pkg = await ;
			//const pkgJSON = JSON.parse(pkg);
			//console.log(pkgJSON.types);
		}
	}
}
//https://cdn.jsdelivr.net/npm/ts-match/   + package.json
//https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types + /react/package.json

resolveDTFiles(sample_test_source);
