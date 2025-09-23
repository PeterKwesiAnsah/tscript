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
import { getReferencePaths } from './getReferencePaths.ts';
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

function formatDTSourceURL(cdnURLPathname: string) {
	const parsePath = path.parse(cdnURLPathname);
	return path.join(parsePath.dir, parsePath.name) + '.d.ts';
}

function getSourceDepPathname(dep: sourceDep) {
	const cdnURL =
		getJSDelivURLOrigin() +
		formatDTSourceURL(path.join(dep.parentDir, dep.sourceDepPath));
	const pathname = new URL(cdnURL).pathname;
	return [pathname, cdnURL];
}

function createSourceDep(sourceContent: string, parentTypesPath = '') {
	const strippedSourceContent = sourceContent.replace(commentRegex, '');
	const dep = parseSourceToDepPath(strippedSourceContent);
	const referenceDeps = getReferencePaths(strippedSourceContent);
	const sourceDep = parseSourceToDep(
		[...new Set([...dep, ...referenceDeps])],
		parentTypesPath
	);
	return sourceDep;
}

//TODO: Need to find a way to only fetch what i need (in module terms tree shake)
//TODO: Need to support  multiple parent directories
export async function depGraph(
	entrySourceContent: string,
	parentTypesPath = ''
) {
	const sourceDep = createSourceDep(entrySourceContent, parentTypesPath);
	for (const modulePath of sourceDep) {
		if (modulePath.type === 'package') {
			//TODO:we always fetch package JSON of package
			let packageDeclarationFile: string = '';
			let rootTypesDir = '';
			let rootTypePathname = '';
			/**
			 * 1.scopedPackage Eg: @x/y
			 * 2.packageWithSubModule Eg: x/y
			 * 3.package Eg: x
			 *
			 */
			if (modulePath.sourceDepPath.startsWith('@')) {
				//scopedPackage
				const restOfPath = modulePath.sourceDepPath.split('/').slice(2);
				let cdnURL = getJSDelivBaseURL();
				if (restOfPath.length === 0) {
					const pkgFromJsDeliv = await (async () => {
						return handleResponse<PackageJson>(
							await fetch(
								getJSDelivBaseURL() + `${modulePath.sourceDepPath}/package.json`
							),
							{} as PackageJson
						);
					})();

					//TODO: update index to path of file
					cdnURL =
						cdnURL +
						formatDTSourceURL(
							path.join(modulePath.sourceDepPath, pkgFromJsDeliv.types || '')
						);
				} else {
					cdnURL + formatDTSourceURL(modulePath.sourceDepPath);
				}
				const res = await fetch(cdnURL);
				packageDeclarationFile = await handleResponse(res, '');
				rootTypePathname = new URL(cdnURL).pathname;
				rootTypesDir = path.dirname(rootTypePathname);
				modulePath.sourceContent = packageDeclarationFile;
			} else if (modulePath.sourceDepPath.includes('/')) {
				//packageWithSubModule
				const [rootPackageDir] = modulePath.sourceDepPath.split('/');
				const pkgFromJsDeliv = await (async () => {
					return handleResponse<PackageJson>(
						await fetch(getJSDelivBaseURL() + `${rootPackageDir}/package.json`),
						{} as PackageJson
					);
				})();
				let cdnURL =
					getJSDelivBaseURL() + formatDTSourceURL(modulePath.sourceDepPath);
				if (!pkgFromJsDeliv.types) {
					cdnURL =
						getDefinitelyTypedBaseURL() +
						formatDTSourceURL(modulePath.sourceDepPath);
				}
				const res = await fetch(cdnURL);
				packageDeclarationFile = await handleResponse(res, '');
				rootTypePathname = new URL(cdnURL).pathname;
				rootTypesDir = path.dirname(rootTypePathname);
				modulePath.sourceContent = packageDeclarationFile;
			} else {
				//package
				//TODO: just call from JSDeliv
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
				//TODO: find out why cdnURL is empty sometimes
				if (cdnURL) {
					rootTypePathname = new URL(cdnURL).pathname;
					rootTypesDir = path.dirname(rootTypePathname);
					const res = await fetch(cdnURL);
					packageDeclarationFile = await handleResponse(res, '');
					modulePath.sourceContent = packageDeclarationFile;
				}
			}
			//child dependencies
			const childSourceDependcies = createSourceDep(
				packageDeclarationFile,
				rootTypesDir //should be path to root dir
			);
			for (const childSourceDep of childSourceDependcies) {
				//if you don't have a parentFileName, means you are an entry file
				childSourceDep['parentFilePathname'] = rootTypePathname;
				sourceDep.push(childSourceDep);
			}
		} else if (modulePath.type === 'relative') {
			//only works ./ i.e the both the source and dependent live in the same directory
			//TODO: support ../ and others
			const [pathname, cdnURL] = getSourceDepPathname(modulePath);
			const rootTypesDir = path.dirname(pathname);
			const res = await fetch(cdnURL);
			const packageDeclarationFile = await handleResponse(res, '');
			modulePath.sourceContent = packageDeclarationFile;
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
