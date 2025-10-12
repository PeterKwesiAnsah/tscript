import { create } from "zustand";
import { ConsoleMessage } from "../proxy";

type ConsoleStore = {
	messages: (ConsoleMessage & { id: string })[];
	addMessage: (msg: ConsoleMessage) => void;
	clear: () => void;
};

export const useConsoleStore = create<ConsoleStore>((set) => ({
	messages: [],

	addMessage: (msg) =>
		set((state) => ({
			messages: [
				...state.messages,
				{
					id: crypto.randomUUID(),
					...msg,
				},
			],
		})),

	clear: () => set({ messages: [] }),
}));
