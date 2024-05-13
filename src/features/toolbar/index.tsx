import { Button } from '@/components/ui/button';
import AddTab from './components/AddTab';
import TabsListSelect from './components/TabsListSelect';
import AuthorConfig from './components/AuthorConfig';

const index = () => {
	return (
		<header className="p-4">
			<nav className="flex flex-row justify-between">
				<div className="flex flex-row items-center gap-3">
					<TabsListSelect />
					<AddTab />
				</div>
				<div className='flex'>
					<AuthorConfig />
					<Button className="rounded-xl">Console</Button>

				</div>
			</nav>
		</header>
	);
};

export default index;
