export const getFileExtention = (fileName: string) => {
	const fileNameParts = fileName.split('.');
	return fileNameParts[fileNameParts.length - 1];
};
