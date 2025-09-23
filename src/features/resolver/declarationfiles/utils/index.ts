export function isValidUrl(url: string) {
	// Regular expression to match URL format
	const urlRegex =
		/^(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
	// Check if the URL matches the regex pattern
	return urlRegex.test(url);
}

export function endsWithDTS(url: string) {
	// Regular expression to match 'd.t.s' at the end of a string
	const dtsRegex = /d\.t\.s$/;
	// Check if the URL ends with 'd.t.s'
	return dtsRegex.test(url);
}
