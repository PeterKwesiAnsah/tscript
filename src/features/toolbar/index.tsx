import { Button } from '@/components/ui/button';
import AddTab from './components/AddTab';
import TabsListSelect from './components/TabsListSelect';

const index = () => {
	return (
		<header className="p-4">
			<nav className="flex flex-row justify-between">
				<div className="flex flex-row items-center gap-3">
					<TabsListSelect />
					<AddTab />
				</div>
				<Button className="rounded-xl">Console</Button>
			</nav>
		</header>
	);
};

export default index;
