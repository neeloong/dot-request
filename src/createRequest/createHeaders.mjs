/** @import { HeaderValue } from '../types.mjs' */
/**
 *
 * @param {Record<string, HeaderValue | (() => HeaderValue)>} [baseHeaders]
 * @returns
 */
export default function createHeaders(baseHeaders) {
	/** @type {Record<string, string | string>} */
	const headers = {};
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
