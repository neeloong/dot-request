/**
 *
 * @param {*} v
 * @returns {v is object | Function}
 */
function isObject(v) {
	return typeof v === 'object' || typeof v === 'function';
}
/**
 *
 * @returns {import('./types.mjs').SignalMap}
 */
export default function createSignalMap() {
	/** @typedef {string | number | bigint | boolean | symbol} PrimitiveType */
	/** @type {Map<PrimitiveType, AbortController>} */
	const primitiveMap = new Map();
	/** @type {WeakMap<object, AbortController>} */
	const objectMap = new WeakMap();
	return {
		get(token) {
			if (isObject(token)) { return objectMap.get(token); }
			return primitiveMap.get(token);
		},
		set(token, ac) {
			if (isObject(token)) { return objectMap.set(token, ac); }
			return primitiveMap.set(token, ac);
		},
	};
}
