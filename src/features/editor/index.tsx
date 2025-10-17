import React from "react";
import * as monaco from "monaco-editor";
import { useGetActiveModel } from "./store/models";
import defaultTheme from "@/monaco/themes/default.json";
import runCode from "../runtime/runCode";

let timeoutId: NodeJS.Timeout;
const EditorInstance = () => {
	const activeModel = useGetActiveModel();

	React.useEffect(() => {
		//Typescript Compiler Options
		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			allowNonTsExtensions: true,
			//This need to be set always for type intellisense with third lib parties to work
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			noEmit: false,
		});
	}, []);
	function subscribeToModelChanges(model: monaco.editor.ITextModel) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(async function () {
			const modelContent = model.getValue();
			if (!modelContent.length) {
				return;
			}
			if (!model.uri.path.endsWith(".ts")) {
				runCode(modelContent);
				return;
			}

			const worker = await monaco.languages.typescript.getTypeScriptWorker();
			const client = await worker(model.uri);
			const result = await client.getEmitOutput(model.uri.toString());
			runCode(result.outputFiles[0].text);

			// const rootDir = path.dirname(model.uri.toString());
			// const extraLibs =
			// 	monaco.languages.typescript.typescriptDefaults.getExtraLibs();
			// console.log(parseSourceToOriginalDep(modelContent));

			//This piece of code handles .d.ts files resolution but for now my focus is getting the javascript running
			//and then later use web containers to handle this
			// for (const dep of parseSourceToOriginalDep(modelContent)) {
			// 	// if (dep.type !== 'package') continue;
			// 	//we can link other ts modules with this??
			// 	const libUri =
			// 		rootDir + `/node_modules/${dep.importResource}/index.d.ts`;
			// 	const findExtraLib = extraLibs[libUri];
			// 	if (findExtraLib) continue;

			// 	//TODO: cache dts files (offline)
			// 	const packageResolvedDTS = await resolveDTFiles(dep.importStatement);
			// 	console.log(packageResolvedDTS.includes("renderToReadableStream"));

			// 	monaco.languages.typescript.typescriptDefaults.addExtraLib(
			// 		packageResolvedDTS,
			// 		libUri
			//);
			/**
			 * TODO:using monaco.languages.typescript.typescriptDefaults.getExtraLibs() an extra lib has already been added
			 * prevening uneccesary api calls
			 * */
			//}
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
			//@ts-expect-error Type 'string' is not assignable to type 'BuiltinTheme'.
			monaco.editor.defineTheme("vs-dark", defaultTheme);

			const sharedEditorOptions = {
				minimap: { enabled: false },
				automaticLayout: true,
				scrollBeyondLastLine: false,
				theme: "vs-dark",
			};
			const editor = monaco.editor.create(node, {
				model,
				...sharedEditorOptions,
			});
			editor.onDidChangeModelContent(() => subscribeToModelChanges(model));
		},
		[activeModel]
	);
	return (
		<div
			id="editor_container"
			ref={createMonacoEditor}
			className="h-screen w-full transition-all duration-300 ease-in-out"
		></div>
	);
};

export default EditorInstance;
