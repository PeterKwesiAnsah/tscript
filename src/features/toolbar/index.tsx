/* eslint-disable react-hooks/rules-of-hooks */

import { Button } from "@/components/ui/button";
import AddTab from "./components/AddTab";
import TabsListSelect from "./components/TabsListSelect";
import React from "react";

const index = () => {

	const handleConsoleWindowToggle = React.useCallback((consoleButton: HTMLButtonElement) => {
		const consoleContainer = document.getElementById("console_container");
		const editorContainer = document.getElementById("editor_container");

		consoleButton.addEventListener("click", () => {
			const isHidden = consoleContainer?.classList.contains("w-0");

			if (isHidden) {
				consoleContainer?.classList.replace("w-0", "w-[30%]");
				editorContainer?.classList.replace("w-full", "w-[70%]");
			} else {
				consoleContainer?.classList.replace("w-[30%]", "w-0");
				editorContainer?.classList.replace("w-[70%]", "w-full");
			}
		});
	}, []);

	return (
		<header className="p-4">
			<nav className="flex flex-row justify-between">
				<div className="flex flex-row items-center gap-3">
					<TabsListSelect />
					<AddTab />
				</div>
				<Button ref={handleConsoleWindowToggle} className="rounded-xl flex items-center gap-2">
					Console
					<span id="console_button_badge" className="hidden bg-red-500 w-4 h-4 rounded-full flex items-center justify-center text-white">
						0
					</span>
				</Button>
			</nav>
		</header>
	);
};

export default index;
