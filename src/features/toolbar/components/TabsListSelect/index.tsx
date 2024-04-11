import {
	useGetActiveModel,
	useGetModels,
	useGetModelStoreActions,
} from '@/features/editor/store/models';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import ReactIcon from '@/components/icons/React';
import JavascriptIcon from '@/components/icons/Javascript';
import TypescriptIcon from '@/components/icons/Typescript';
import { allowedFileExtensions } from '../../types';
import { Trash2 } from 'lucide-react';
import { getLanguageFromFileExtension } from '../../utils';
import { Button } from '@radix-ui/themes';
import { getFileExtention } from '@/util';

const TabItem = (props: { fileName: string }) => {
	const fileLanguageToIcon = {
		typescript: <TypescriptIcon />,
		javascript: <JavascriptIcon />,
		react: <ReactIcon />,
	};
	return (
		<div className="flex flex-row gap-2 items-center">
			{
				fileLanguageToIcon[
					getLanguageFromFileExtension(
						getFileExtention(props.fileName) as allowedFileExtensions
					)
				]
			}
			<span>{props.fileName}</span>
		</div>
	);
};

const TabsListSelect = () => {
	const editorModels = useGetModels();
	const activeEditorModel = useGetActiveModel();
	const { changeActiveModel, removeModel } = useGetModelStoreActions();
	const activeModelIndex = editorModels.findIndex(
		(model) => model.fileName === activeEditorModel.fileName
	);

	return (
		<Select
			value={activeModelIndex + ''}
			onValueChange={(strigifyIndex) => {
				changeActiveModel(parseInt(strigifyIndex));
			}}
		>
			<SelectTrigger className="w-[180px]">
				<TabItem fileName={activeEditorModel.fileName} />
			</SelectTrigger>
			<SelectContent>
				{editorModels.map((model, index) => (
					<SelectItem
						className="block w-full"
						key={model.fileName + index}
						value={index + ''}
					>
						<div className="flex justify-between w-full gap-4">
							<TabItem fileName={model.fileName} />
							<Button
								onMouseDown={() => {
									removeModel(model.fileName);
								}}
								disabled={editorModels.length === 1}
								size={'1'}
							>
								<Trash2 className="h-4 w-4 hover:text-rose-500" />
							</Button>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default TabsListSelect;
