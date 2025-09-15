/** @import { HeaderValue } from '../types.mjs' */
/**
 *
 * @param {(() => Record<string, HeaderValue>?)[]} headerGroups
 * @param {Record<string, HeaderValue | (() => HeaderValue)>} [baseHeaders]
 * @returns
 */
export default function createHeaders(headerGroups, baseHeaders) {
	/** @type {Record<string, string | string>} */
	const headers = {};
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
