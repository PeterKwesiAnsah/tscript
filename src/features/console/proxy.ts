/* eslint-disable @typescript-eslint/no-explicit-any */
export type ConsoleMessage = {
	method: keyof Console;
	args: any[];
	timestamp: number;
};

export class ConsoleProxy {
	private originalConsole: Partial<Console> = {};
	private listeners: ((msg: ConsoleMessage) => void)[] = [];

	constructor() {
		this.patch();
	}

	private patch() {
		const methods: (keyof Console)[] = [
			"log",
			"info",
			"warn",
			"error",
			"debug",
			"table",
			"dir",
		];

		for (const method of methods) {
			// @ts-expect-error Keep the original reference
			this.originalConsole[method] = console[method];
			//@ts-expect-error missing function signature
			console[method] = (...args: any[]) => {
				// Notify listeners
				const message: ConsoleMessage = {
					method,
					args,
					timestamp: Date.now(),
				};
				this.listeners.forEach((fn) => fn(message));
			};
		}
	}

	onMessage(fn: (msg: ConsoleMessage) => void) {
		this.listeners.push(fn);
	}

	restore() {
		for (const [method, original] of Object.entries(this.originalConsole)) {
			// @ts-expect-error restoring type
			console[method] = original;
		}
	}
}
