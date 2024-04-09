import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useGetModelStoreActions } from '@/features/editor/store/models';
const AddTab = () => {
	const [toggleFileNameInput, setToggleFileNameInput] = useState(false);
	const { addModel } = useGetModelStoreActions();
	useEffect(() => {
		document.addEventListener('keydown', function (event) {
			const { key } = event;
			if (key === 'Escape') {
				setToggleFileNameInput(false);
			}
		});
	}, []);

	const clickAwayListener = useCallback((node: HTMLDivElement) => {
		document.addEventListener('mousedown', function (e) {
			const el = e.target as HTMLElement;
			if (el && node && !node.contains(el)) {
				setToggleFileNameInput(false);
			}
		});
	}, []);

	const addTabOnSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		const formElement = e.target as HTMLFormElement;
		const enteredFileName = formElement['fileName'].value as string;
		addModel(enteredFileName);
		setToggleFileNameInput(false);
	};
	return (
		<div ref={clickAwayListener}>
			<div>
				{!toggleFileNameInput ? (
					<Button
						onClick={() => {
							setToggleFileNameInput(true);
						}}
						className="rounded-full"
						variant={'ghost'}
						size={'icon'}
					>
						<Plus />
					</Button>
				) : (
					<form onSubmit={addTabOnSubmit}>
						<Input
							// style={{
							// 	borderBottom: '1px solid',
							// }}
							autoFocus
							className="w-[150px] border-solid rounded-none border-0 border-b-2"
							placeholder="New File Name"
							type="text"
							name="fileName"
							pattern="^.+\.(ts|tsx|js|jsx)$"
						/>
					</form>
				)}
			</div>
		</div>
	);
};

export default AddTab;
