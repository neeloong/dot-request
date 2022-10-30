import type { HeaderValue } from '../types';

export default function createHeaders(
	baseHeaders?: Record<string, HeaderValue | (() => HeaderValue)>,
) {
	const headers: Record<string, string | string> = {};
	if (!baseHeaders) { return headers; }
	for (const [k, v] of Object.entries(baseHeaders)) {
		const value = typeof v === 'function' ? v() : v;
		if (typeof value === 'string') {
			if (!value) { continue; }
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
