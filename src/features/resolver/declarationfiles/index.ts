import path from "path";
// import {
// 	parseSourceToDep,
// 	parseSourceToDepPath,
// } from '../core/parseSource/index.ts';
import "../fetch/index.ts";
import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
} from "../utils/urls/index.ts";
import { resolveRootPackageTypesToURL } from "./resolvePackageTypesSource.ts";
import { PackageJson } from "./types/index.ts";
import { parseSourceToDep, parseSourceToDepPath } from "../core/parseSource.ts";
const sample_test_source = `
	import {create} from "zustand";
`;

const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

function handleResponse(response: Response): Promise<PackageJson> {
	if (!response.ok) {
		return Promise.resolve({} as PackageJson);
	}
	return response.json();
}
function resolveRelativePathToFullURL(
	parentTypesPath = "",
	relativePath: string
) {
	if (!relativePath.endsWith(".d.ts")) {
		//we are expecting .d.ts
		relativePath = relativePath + ".d.ts";
	}
	return path.join(parentTypesPath, relativePath);
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
export async function resolveDTFiles(
	sourceContent: string,
	parentTypesPath = "",
	resolvedDepList = new Set()
) {
	//console.log(sourceContent);
	const dep = parseSourceToDepPath(sourceContent.replace(commentRegex, ""));
	console.log(dep);
	//TODO: <reference dependecies />
	const sourceDep = parseSourceToDep(dep, parentTypesPath);
	for (const modulePath of sourceDep) {
		if (modulePath.type === "package") {
			const modulePathSourceDepPathSplit = modulePath.sourceDepPath.split("/");
			const packageName = modulePathSourceDepPathSplit[0];
			// console.log(packageName);
			const [pkgFromJsDeliv, pkgFromDT] = await Promise.all([
				(async () => {
					return handleResponse(
						await fetch(getJSDelivBaseURL() + `${packageName}/package.json`)
					);
				})(),
				(async () => {
					return handleResponse(
						await fetch(
							getDefinitelyTypedBaseURL() + `${packageName}/package.json`
						)
					);
				})(),
			]);
			const packageRootTypesURL = resolveRootPackageTypesToURL([
				pkgFromJsDeliv,
				pkgFromDT,
			]);
			let urlToDTS = packageRootTypesURL;
			const packageRootTypesURLsplit = packageRootTypesURL.split("/");
			if (modulePathSourceDepPathSplit.length > 2) {
				urlToDTS = resolveRelativePathToFullURL(
					packageRootTypesURLsplit
						.slice(0, packageRootTypesURLsplit.length - 1)
						.join("/"),
					modulePathSourceDepPathSplit.slice(1).join("/")
				);
			}

			/**
			 * 
			 * 	 will give /node_modules${resolveRelativePathToFullURL(
					packageRootTypesURLsplit
						.slice(0, packageRootTypesURLsplit.length - 1)
						.join('/'),
					'./vanilla'
					//modulePathSourceDepPathSplit.slice(1).join('/')
				).split('npm')}
			 */

			//TODO: before we get the file from the CDN it's a valid url and ends with a d.t.s file
			// packageRootTypesURLsplit[packageRootTypesURLsplit.length - 1] =
			// 	modulePathSourceDepPathSplit.slice(1).join('/');
			// console.log(packageRootTypesURLsplit.join('/'));

			// console.log(
			// 	'https://cdn.jsdelivr.net/npm/zustand/index.d.ts'.split(
			// 		packageName
			// 	)[0] + modulePath.sourceDepPath
			// );
			// // if (modulePathSourceDepPathSplit.length > 2) {
			// // }
			// console.log(packageRootTypesURL);
			const packageDeclarationFile = await fetch(urlToDTS).then((res) =>
				res.text()
			);
			sourceContent =
				(await resolveDTFiles(
					packageDeclarationFile,
					packageRootTypesURLsplit
						.slice(0, packageRootTypesURLsplit.length - 1)
						.join("/")
				)) + sourceContent;
		} else if (modulePath.type === "relative") {
			const packageRelativePathToTypesURL = resolveRelativePathToFullURL(
				parentTypesPath,
				modulePath.sourceDepPath
			);
			const packageRelativePathToTypesURLsplit =
				packageRelativePathToTypesURL.split("/");

			sourceContent =
				(await resolveDTFiles(
					packageRelativePathToTypesURL,
					packageRelativePathToTypesURLsplit
						.slice(0, packageRelativePathToTypesURLsplit.length - 1)
						.join("/")
				)) + sourceContent;
		}
	}
	return sourceContent;
}
