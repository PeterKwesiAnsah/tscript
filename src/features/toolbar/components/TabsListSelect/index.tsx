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

const TabsListSelect = () => {
	const editorModels = useGetModels();
	const activeEditorModel = useGetActiveModel();
	const { changeActiveModal } = useGetModelStoreActions();
	//const langToIconLabel=
	return (
		<Select
			defaultValue={DEFAULT_ACTIVE_MODEL_INDEX + ''}
			onValueChange={(strigifyIndex) => {
				changeActiveModal(parseInt(strigifyIndex));
			}}
		>
			<SelectTrigger className="w-[180px]">
				<span>{activeEditorModel.fileName}</span>
			</SelectTrigger>
			<SelectContent>
				{editorModels.map((model, index) => (
					<SelectItem key={model.fileName + index} value={index + ''}>
						{model.fileName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default TabsListSelect;
