import { allowedFileExtensions } from '../types';

export const getFileExtention = (fileName: string) => {
	const fileNameParts = fileName.split('.');
	return fileNameParts[fileNameParts.length - 1];
};

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
