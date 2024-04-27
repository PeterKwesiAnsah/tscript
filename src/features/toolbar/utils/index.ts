import { allowedFileExtensions } from '../types';

export const getLanguageFromFileExtension = (
	fileExtension: allowedFileExtensions
) => {
	const fileExtensionToLanguage = {
		ts: 'typescript',
		js: 'javascript',
		tsx: 'react',
		jsx: 'react',
	};
	return fileExtensionToLanguage[fileExtension] as
		| 'typescript'
		| 'javascript'
		| 'react';
};
