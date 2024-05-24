import {
	parseSourceToDep,
	parseSourceToDepPath,
	sourceDep,
} from './parseSource.ts';
import '../fetch/index.ts';
import {
	getDefinitelyTypedBaseURL,
	getJSDelivBaseURL,
	getJSDelivURLOrigin,
} from '../utils/urls/index.ts';

import { PackageJson } from '../declarationfiles/types/index.ts';
import { resolvePackageTypesToURL } from '../declarationfiles/resolvePackageTypesSource.ts';
import path from 'path-browserify';
// const sample_test_source = `
// 	import react from "axios";
// `;

export const num = 1;

const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

function handleResponse<resType>(
	response: Response,
	defaultPromiseFailedValue: resType
): Promise<resType> {
	if (!response.ok) {
		return Promise.resolve(defaultPromiseFailedValue);
	}
	return response[
		typeof defaultPromiseFailedValue === 'string' ? 'text' : 'json'
	]();
}

function getSourceDepPathname(dep: sourceDep) {
	let cdnURL =
		getJSDelivURLOrigin() + path.join(dep.parentDir, dep.sourceDepPath);
	if (!cdnURL.endsWith('.d.ts')) {
		cdnURL = cdnURL + '.d.ts';
	}
	//console.log(cdnURL);
	//circular dep

	//return sourceDep;

	const pathname = new URL(cdnURL).pathname;
	return [pathname, cdnURL];
}

function createSourceDep(sourceContent: string, parentTypesPath = '') {
	const dep = parseSourceToDepPath(sourceContent.replace(commentRegex, ''));
	//TODO: <reference dependecies />
	const sourceDep = parseSourceToDep([...new Set(dep)], parentTypesPath);
	return sourceDep;
}
//https://cdn.jsdelivr.net/npm/ts-match/lib/index.d.ts"
export async function depGraph(
	entrySourceContent: string,
	parentTypesPath = ''
) {
	const sourceDep = createSourceDep(entrySourceContent, parentTypesPath);
	for (const modulePath of sourceDep) {
		if (modulePath.type === 'package') {
			let packageDeclarationFile: string = '';
			let rootTypesDir = '';
			let rootTypePathname = '';
			const scopedPackagesRegex =
				/^@?([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)(\/[a-zA-Z0-9-_]+)*$/;
			if (!modulePath.sourceDepPath.match(scopedPackagesRegex)) {
				const [pkgFromJsDeliv, pkgFromDT] = await Promise.all([
					(async () => {
						return handleResponse<PackageJson>(
							await fetch(
								getJSDelivBaseURL() + `${modulePath.sourceDepPath}/package.json`
							),
							{} as PackageJson
						);
					})(),
					(async () => {
						return handleResponse<PackageJson>(
							await fetch(
								getDefinitelyTypedBaseURL() +
									`${modulePath.sourceDepPath}/package.json`
							),
							{} as PackageJson
						);
					})(),
				]);
				const cdnURL = resolvePackageTypesToURL([pkgFromJsDeliv, pkgFromDT]);
				rootTypePathname = new URL(cdnURL).pathname;

				rootTypesDir = path.dirname(rootTypePathname);
				packageDeclarationFile = await fetch(cdnURL).then((res) => {
					if (!res.ok) {
						return '';
					}
					return res.text();
				});
			} else {
				const [dtsPackage, dtsTypesPackage] = await Promise.all([
					(async () => {
						return handleResponse<string>(
							await fetch(
								getJSDelivBaseURL() + `${modulePath.sourceDepPath}.d.ts`
							),
							''
						);
					})(),
					(async () => {
						return handleResponse<string>(
							await fetch(
								getDefinitelyTypedBaseURL() + `${modulePath.sourceDepPath}.d.ts`
							),
							''
						);
					})(),
				]);
				packageDeclarationFile = dtsPackage || dtsTypesPackage;
				if (dtsPackage) {
					rootTypePathname = new URL(
						getJSDelivBaseURL() + `${modulePath.sourceDepPath}.d.ts`
					).pathname;
					rootTypesDir = path.dirname(rootTypePathname);
				} else if (dtsTypesPackage) {
					rootTypePathname = new URL(
						getDefinitelyTypedBaseURL() + `${modulePath.sourceDepPath}.d.ts`
					).pathname;
					rootTypesDir = path.dirname(rootTypePathname);
				}
			}
			//child dependencies
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				rootTypesDir //should be path to root dir
			);
			//console.log(childSourceDependcies);
			for (const childSourceDep of childSourceDependcies) {
				//if you don't have a parentFileName, means you are an entry file
				childSourceDep['parentFilePathname'] = rootTypePathname;
				sourceDep.push(childSourceDep);
			}
		} else if (modulePath.type === 'relative') {
			//only works ./ i.e the both the source and dependent live in the same directory
			//TODO:../
			const [pathname, cdnURL] = getSourceDepPathname(modulePath);
			const rootTypesDir = path.dirname(pathname);
			const packageDeclarationFile = await fetch(cdnURL).then((res) => {
				if (!res.ok) {
					return '';
				}
				return res.text();
			});
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				rootTypesDir //should be path to root dir
			);
			for (const childSourceDep of childSourceDependcies) {
				//absolute imports are the truth
				//if a child dep depends on it parent then we have circular deps
				//a parent ideally should depend on a child not the other way round

				//naive circular dep solution?
				if (
					modulePath.parentFilePathname ===
					getSourceDepPathname(childSourceDep)[0]
				) {
					continue;
				}
				childSourceDep['parentFilePathname'] = pathname;

				sourceDep.push(childSourceDep);
			}
		}
	}
	return sourceDep;
}
