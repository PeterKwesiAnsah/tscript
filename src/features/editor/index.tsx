import React from 'react';
import * as monaco from 'monaco-editor';

const EditorInstance = () => {
	const createMonacoEditor = React.useCallback(function (node: HTMLElement) {
		const model = monaco.editor.createModel(
			"function hello() {\n\talert('Hello world!');\n}",
			'javascript',
			monaco.Uri.file('output.js')
		);

		const sharedEditorOptions = {
			minimap: { enabled: false },
			automaticLayout: true,
			scrollBeyondLastLine: false,
			theme: 'vs-dark',
		};
		monaco.editor.create(node, {
			model,
			...sharedEditorOptions,
		});
	}, []);
	return (
		<section
			ref={createMonacoEditor}
			style={{ height: '100vh', width: '100vw' }}
		></section>
	);
};

export default EditorInstance;
