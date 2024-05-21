import { parseSourceToDep, parseSourceToDepPath } from './parseSource.ts';
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
	//console.log(sourceContent);

	const sourceDep = createSourceDep(entrySourceContent, parentTypesPath);

	for (const modulePath of sourceDep) {
		if (modulePath.type === 'package') {
			let packageDeclarationFile: string = '';
			let rootTypesDir = '';
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
				//console.log('path', path.dirname('./index.ts'));
				const cdnURL = resolvePackageTypesToURL([pkgFromJsDeliv, pkgFromDT]);
				const pathname = new URL(cdnURL).pathname;
				rootTypesDir = path.dirname(pathname);
				packageDeclarationFile = await fetch(cdnURL).then((res) => {
					if (!res.ok) {
						return '';
					}
					return res.text();
				});
			} else {
				//1.step make two requests to package or @types/package (at least one should exist)
				//2. you can fetch base package package json to know if it has types or not
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
					rootTypesDir = path.dirname(
						new URL(getJSDelivBaseURL() + `${modulePath.sourceDepPath}.d.ts`)
							.pathname
					);
				} else if (dtsTypesPackage) {
					rootTypesDir = path.dirname(
						new URL(
							getDefinitelyTypedBaseURL() + `${modulePath.sourceDepPath}.d.ts`
						).pathname
					);
				}
			}

			//console.log(cdnURL);

			//child dependencies
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				rootTypesDir //should be path to root dir
			);
			for (const childSourceDep of childSourceDependcies) {
				sourceDep.push(childSourceDep);
			}
		} else if (modulePath.type === 'relative') {
			//const shippedTypes = !modulePath.parentPath.includes('@types');
			let cdnURL =
				getJSDelivURLOrigin() +
				path.join(modulePath.parentPath, modulePath.sourceDepPath);
			if (!cdnURL.endsWith('.d.ts')) {
				cdnURL = cdnURL + '.d.ts';
			}
			//const cdnURL = resolvePackageTypesToURL([pkgFromJsDeliv, pkgFromDT]);
			const pathname = new URL(cdnURL).pathname;
			const rootTypesDir = path.dirname(pathname);
			const packageDeclarationFile = await fetch(cdnURL).then((res) => {
				if (!res.ok) {
					return '';
				}
				return res.text();
			});
			// console.log({
			// 	rootTypesDir,
			// 	packageDeclarationFile,
			// });
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				rootTypesDir //should be path to root dir
			);
			for (const childSourceDep of childSourceDependcies) {
				sourceDep.push(childSourceDep);
			}
			//console.log(cdnURL);
			// full url=parentroottypesDir+sourceDepth+'.d.ts'
			// const childSourceDependcies = createSourceDep(
			// 	packageDeclarationFile,
			// 	rootTypesDir //should be path to root dir
			// );
			// for (const childSourceDep of childSourceDependcies) {
			// 	sourceDep.push(childSourceDep);
			// }
		}
	}
	return sourceDep;
}
