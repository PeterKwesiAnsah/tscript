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
