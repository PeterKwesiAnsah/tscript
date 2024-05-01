import React from 'react';
import * as monaco from 'monaco-editor';
import { useGetActiveModel } from './store/models';
import defaultTheme from '@/monaco/themes/default.json';
import { resolveDTFiles } from '../resolver/declarationfiles';
import { accentColors } from '@radix-ui/themes/props';
import path from 'path-browserify';
//import path from 'path-browserify';

let timeoutId: NodeJS.Timeout;
const EditorInstance = () => {
	const activeModel = useGetActiveModel();

	React.useEffect(() => {
		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			allowNonTsExtensions: true,
			//This need to be set always for type intellisense with third lib parties to work
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			noEmit: true,
		});
	}, []);
	function subscribeToModelChanges(model: monaco.editor.ITextModel) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(async function () {
			const modelContent = model.getValue();
			if (!modelContent.length) {
				return;
			}
			const rootDir = path.dirname(model.uri.toString());
			const dts = await resolveDTFiles(modelContent);
			const libUri = rootDir + '/node_modules/axios/index.d.ts';
			monaco.languages.typescript.typescriptDefaults.addExtraLib(dts, libUri);
		}, 2000);
	}

	const createMonacoEditor = React.useCallback(
		function (node: HTMLElement | null) {
			if (!node) return;
			monaco.editor.getModels().forEach((model) => model.dispose());
			const fileURI = monaco.Uri.file(activeModel.fileName);
			const model = monaco.editor.createModel(
				activeModel.code!,
				activeModel.language,
				fileURI
			);

			monaco.editor.defineTheme('shadcnTheme', defaultTheme);

			const sharedEditorOptions = {
				minimap: { enabled: false },
				automaticLayout: true,
				scrollBeyondLastLine: false,
				theme: 'shadcnTheme',
			};
			//console.log(fileURI.toString());

			// const editor = monaco.editor.create(node, {
			// 	value: activeModel.code!,
			// 	language: activeModel.language,
			// 	...sharedEditorOptions,
			// });
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
