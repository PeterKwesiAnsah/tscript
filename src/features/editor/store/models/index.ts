import { create } from 'zustand';
import { editorTabs } from '../../components/tab/types';
import { getEditorLanguageFromFileName, getInitialCode } from '../../utils';

export const DEFAULT_ACTIVE_MODEL_INDEX = 1;

const modelStore = create<{
	models: editorTabs;
	activeModelIndex: number;
	actions: {
		addModel: (fileName: string) => void;
		removeModel: (fileName: string) => void;
		changeActiveModel: (modelIndex: number) => void;
	};
}>((set, store) => ({
	activeModelIndex: DEFAULT_ACTIVE_MODEL_INDEX,
	models: [
		{
			fileName: 'index.js',
			language: 'javascript',
			code: "function hello() {\n\talert('Hello world!');\n}",
		},
		{
			fileName: 'index.ts',
			language: 'typescript',
			code: "function hello() {\n\talert('Hello world!');\n}",
		},
	],
	actions: {
		addModel(fileName: string) {
			const incomingFileName = fileName;
			const isFileAlreadyExist = store().models.some(
				(modal) =>
					modal.fileName.toLocaleLowerCase() ===
					incomingFileName.toLocaleLowerCase()
			);
			if (isFileAlreadyExist) {
				throw new Error('File Already Exist');
			}
			const updatedModels = [
				...store().models,
				{
					fileName: incomingFileName,
					code: getInitialCode(),
					language: getEditorLanguageFromFileName(incomingFileName),
				},
			];
			const activeModelIndex = updatedModels.length - 1;
			set({ models: updatedModels, activeModelIndex });
		},
		removeModel(fileName: string) {
			set({
				models: store().models.filter(
					(modal) =>
						modal.fileName.toLocaleUpperCase() !== fileName.toLocaleUpperCase()
				),
				activeModelIndex: store().models.length - 2,
			});
		},
		changeActiveModel(modelIndex: number) {
			set({ activeModelIndex: modelIndex });
		},
	},
}));

export const useGetModels = () => modelStore((store) => store.models);
export const useGetActiveModel = () =>
	modelStore((store) => store.models[store.activeModelIndex]);
export const useGetModelStoreActions = () =>
	modelStore((store) => store.actions);
