/**
 *
 * @param {string} main
 * @param {string[]} key
 * @param {any} value
 * @param {boolean} [inArray]
 * @returns {Iterable<[string, string[], true | null | string | Blob]>}
 * @yields {[string, string[], true | null | string | Blob]}
 */
export default function* getFromData(main, key, value, inArray) {
	if (value === null) {
		return yield [main, key, null];
	}
	if (['string', 'number', 'boolean'].includes(typeof value)) {
		return yield [main, key, String(value)];
	}
	if (value instanceof Blob) {
		return yield [main, key, value];
	}
	if (typeof value !== 'object') { return; }
	if (inArray) {
		return yield [main, key, true];
	}
	if (Array.isArray(value)) {
		const newKey = [...key, ''];
		for (const it of value) {
			yield* getFromData(main, newKey, it, true);
		}
		return;
	}
	for (const [k, v] of Object.entries(value)) {
		if (!k) { continue; }
		if (k.includes('\'')) { continue; }
		if (k.includes('"')) { continue; }
		if (k.includes('[')) { continue; }
		if (k.includes(']')) { continue; }
		yield* getFromData(main, [...key, k], v);
	}
}
