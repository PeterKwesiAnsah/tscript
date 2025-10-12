export default async function (code: string) {
	const blob = new Blob([code], { type: "text/javascript" });
	const url = URL.createObjectURL(blob);
	try {
		await import(url);
	} catch (err) {
		console.error("Runtime error:", err);
	} finally {
		URL.revokeObjectURL(url);
	}
}
