import { depGraph } from '../core/depGraph.ts';
import { exportImportRegex } from '../core/parseSource.ts';

export async function resolveDTFiles(sourceContent: string) {
	const graph = await depGraph(sourceContent);
	let dts = '';
	for (const dep of graph) {
		dts = dep.sourceContent + dts;
	}
	return dts.replace(exportImportRegex, '');
}
