/* eslint-disable no-mixed-spaces-and-tabs */
export type editorTabInfo =
	| {
			hash: string;
			code?: '';
			language: string;
			fileName: string;
	  }
	| {
			hash?: '';
			code: string;
			language: string;
			fileName: string;
	  };
export type editorTabs = editorTabInfo[];
