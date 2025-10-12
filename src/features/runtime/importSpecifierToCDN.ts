/**
 * Rewrites bare module specifiers (like "react") to ESM CDN URLs.
 * Leaves relative/local imports intact.
 * Handles:
 *   - import ... from "module"
 *   - export ... from "module"
 *   - import type { ... } from "module"
 *   - await import("module")
 */
export function rewriteImportsToCDN(
	source: string,
	cdn: string = "https://esm.sh/"
): string {
	// Matches:
	//  - import something from "specifier"
	//  - export something from "specifier"
	//  - import type { X } from "specifier"
	//  - import("specifier")
	const importExportRegex =
		/\b(?:import|export)\b(?:[\s\S]*?\bfrom\s*)?\(\s*['"]([^'"]+)['"]\s*\)|\b(?:import|export)\b(?:[\s\S]*?\bfrom\s*)?['"]([^'"]+)['"]/g;

	return source.replace(
		importExportRegex,
		(match, dynSpecifier, staticSpecifier) => {
			const specifier = dynSpecifier || staticSpecifier;

			// Skip local, relative, or blob URLs
			if (
				specifier.startsWith("./") ||
				specifier.startsWith("../") ||
				specifier.startsWith("/") ||
				specifier.startsWith("blob:") ||
				specifier.startsWith("data:")
			) {
				return match;
			}

			// Build the new CDN URL
			const url = `${cdn}${specifier}`;

			// Replace the old specifier with the CDN URL
			return match.replace(specifier, url);
		}
	);
}
