import type { DotRequest } from '../DotRequest.mts';

export default function createHeaders(
	headerGroups: (() => Record<string, DotRequest.HeaderValue> | null)[],
	baseHeaders?: Record<string, DotRequest.HeaderValue | (() => DotRequest.HeaderValue)>,
) {
	const headers: Record<string, string | string> = {};
	for (const get of headerGroups) {
		const h = get();
		if (!h || typeof h !== 'object') { continue; }
		for (const [key, value] of Object.entries(h)) {
			if (typeof value === 'string') {
				if (!value) { continue; }
				headers[key] = value;
				continue;
			}
			if (typeof value === 'number') {
				headers[key] = String(value);
				continue;
			}
		}

	}
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
