export interface PackageJson {
	name: string;
	version: string;
	description?: string;
	main?: string;
	types?: string; // Declaration file path for TypeScript packages
	scripts?: Record<string, string>;
	keywords?: string[];
	author?: string | { name: string; email?: string; url?: string };
	contributors?: string[] | { name: string; email?: string; url?: string }[];
	license?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	bundledDependencies?: string[];
	engines?: Record<string, string>;
	repository?: string | { type: string; url: string };
	bugs?: string | { url: string; email?: string };
	homepage?: string;
	publishConfig?: Record<string, string>;
	private?: boolean;
}
