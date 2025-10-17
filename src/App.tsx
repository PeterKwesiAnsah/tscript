import EditorInstance from "./features/editor";
import Toolbar from "./features/toolbar";
import Console from "./features/console";

function App() {
	return (
		<section className="flex flex-col">
			<Toolbar />
			<main className="flex flex-row">
				<EditorInstance />
				<div id="console_container" className="w-0 transition-all duration-300 ease-in-out overflow-hidden">
					<Console />
				</div>
			</main>
		</section>
	);
}

export default App;
