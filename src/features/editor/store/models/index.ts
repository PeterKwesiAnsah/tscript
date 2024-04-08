import { create } from 'zustand';
import { editorTabs } from '../../components/tab/types';

const modelStore = create<{
	models: () => editorTabs;
	activeModelIndex: number;
}>((set) => ({
	activeModelIndex: 0,
	models: () => [
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
	addModel(model: editorTabs[number]) {
		const incomingFileName = model.fileName;
		const isFileAlreadyExist = this.models().some(
			(modal) =>
				modal.fileName.toLocaleLowerCase() ===
				incomingFileName.toLocaleLowerCase()
		);
		if (isFileAlreadyExist) {
			throw new Error('File Already Exist');
		}
		const updatedModels = [...this.models(), model];
		const activeModelIndex = this.activeModelIndex + 1;
		set({ models: () => updatedModels, activeModelIndex });
	},
	removeModal(fileName: string) {
		set({
			models: () =>
				this.models().filter(
					(modal) =>
						modal.fileName.toLocaleUpperCase() === fileName.toLocaleUpperCase()
				),
		});
	},
}));

export const useGetModels = () => modelStore((store) => store.models());
export const useGetActiveModel = () =>
	modelStore((store) => store.models()[store.activeModelIndex]);
