export const getInitialCode = () =>
	"function hello() {\n\talert('Hello world!');\n}";

export const getEditorLanguageFromFileName = (fileName: string) => {
	return fileName.startsWith('t') ? 'typescript' : 'javascript';
};
