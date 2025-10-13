/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConsoleMessage, ConsoleMethod } from ".";

export class ConsoleProxy {
	private originalConsole: Partial<Console> = {};
	private listeners: ((msg: ConsoleMessage) => void)[] = [];

	constructor() {
		this.patch();
	}

	private patch() {
		const methods: ConsoleMethod[] = [
			"log",
			"info",
			"warn",
			"error",
			"debug",
			"table",
			"dir",
		];

		for (const method of methods) {
			this.originalConsole[method] = console[method];
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
