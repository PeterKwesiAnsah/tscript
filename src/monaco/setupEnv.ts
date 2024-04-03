//declare some global type
import * as monaco from 'monaco-editor';
import TSworker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import Editorworker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
self.MonacoEnvironment = {
	getWorker: function (_, label) {
		if (label === 'typescript' || label === 'javascript') {
			return new TSworker({
				name: label,
			});
		}
		return new Editorworker();
	},
};

export function createMonacoEditor() {
	const model = monaco.editor.createModel(
		"function hello() {\n\talert('Hello world!');\n}",
		'javascript',
		monaco.Uri.file('output.js')
	);

	const sharedEditorOptions = {
		minimap: { enabled: false },
		automaticLayout: true,
		scrollBeyondLastLine: false,
	};
	monaco.editor.create(document.getElementById('container')!, {
		model,
		...sharedEditorOptions,
	});
}
