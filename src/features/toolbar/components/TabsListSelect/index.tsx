import {
	DEFAULT_ACTIVE_MODEL_INDEX,
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
import { getFileExtention, getLanguageFromFileExtension } from '../../utils';

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
	const { changeActiveModal } = useGetModelStoreActions();

	return (
		<Select
			defaultValue={DEFAULT_ACTIVE_MODEL_INDEX + ''}
			onValueChange={(strigifyIndex) => {
				changeActiveModal(parseInt(strigifyIndex));
			}}
		>
			<SelectTrigger className="w-[180px]">
				<TabItem fileName={activeEditorModel.fileName} />
			</SelectTrigger>
			<SelectContent>
				{editorModels.map((model, index) => (
					<SelectItem key={model.fileName + index} value={index + ''}>
						<TabItem fileName={model.fileName} />
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default TabsListSelect;
