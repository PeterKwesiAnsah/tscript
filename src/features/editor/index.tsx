import React from 'react';
import * as monaco from 'monaco-editor';
import { useGetActiveModel } from './store/models';

const EditorInstance = () => {
	const activeModel = useGetActiveModel();
	const createMonacoEditor = React.useCallback(
		function (node: HTMLElement | null) {
			const model = monaco.editor.createModel(
				activeModel.code!,
				activeModel.language,
				monaco.Uri.file(activeModel.fileName)
			);

			const sharedEditorOptions = {
				minimap: { enabled: false },
				automaticLayout: true,
				scrollBeyondLastLine: false,
				theme: 'vs-dark',
			};
			node &&
				monaco.editor.create(node, {
					model,
					...sharedEditorOptions,
				});
		},
		[activeModel]
	);
	return <div ref={createMonacoEditor} className="h-screen"></div>;
};

export default EditorInstance;
