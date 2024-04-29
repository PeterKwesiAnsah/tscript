import React from 'react';
import * as monaco from 'monaco-editor';
import { useGetActiveModel } from './store/models';
import defaultTheme from '@/monaco/themes/default.json';

let timeoutId: NodeJS.Timeout;
const EditorInstance = () => {
	const activeModel = useGetActiveModel();
	function subscribeToModelChanges(model: monaco.editor.ITextModel) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			console.log(model.getValue());
		}, 2000);
	}

	const createMonacoEditor = React.useCallback(
		function (node: HTMLElement | null) {
			if (!node) return;
			monaco.editor.getModels().forEach((model) => model.dispose());
			const model = monaco.editor.createModel(
				activeModel.code!,
				activeModel.language,
				monaco.Uri.file(activeModel.fileName)
			);
			monaco.editor.defineTheme('mine', defaultTheme);

			const sharedEditorOptions = {
				minimap: { enabled: false },
				automaticLayout: true,
				scrollBeyondLastLine: false,
				theme: 'mine',
			};

			const editor = monaco.editor.create(node, {
				model,
				...sharedEditorOptions,
			});
			editor.onDidChangeModelContent(() => subscribeToModelChanges(model));
		},
		[activeModel]
	);
	return <div ref={createMonacoEditor} className="h-screen"></div>;
};

export default EditorInstance;
