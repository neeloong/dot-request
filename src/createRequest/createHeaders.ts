export default function createHeaders(
	baseHeaders?: Record<string, string | undefined | null | (() => string | undefined | null)>
) {
	const headers: Record<string, string> = {};
	if (!baseHeaders) { return headers; }
	for (const [k,v] of Object.entries(baseHeaders)) {
		const value = typeof v === 'function' ? v() : v;
		if (!value) { continue; }
		if (typeof value === 'string') {
			headers[k] = value;
			continue;
		}
		if (typeof value === 'number') {
			headers[k] = String(value);
			continue;
		}
	}
	return headers;
}
