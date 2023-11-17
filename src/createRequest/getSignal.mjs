import createSignalMap from '../createSignalMap.mjs';

const types = new Set([
	'object',
	'string',
	'symbol',
	'number',
	'boolean',
	'bigint',
]);
const abortTokens = createSignalMap();

/**
 *
 * @param {import('../types.mjs').SignalMap} tokens
 * @param {*} [signal]
 * @returns {AbortSignal?}
 */
function toSignal(tokens, signal) {
	if (!types.has(typeof signal)) { return null; }
	if (signal === null || signal === false) { return null; }
	tokens.get(signal)?.abort();
	const ac = new AbortController();
	tokens.set(signal, ac);
	return ac.signal;
}
/**
 *
 * @param {*} v
 * @returns {v is import('../types.mjs').SignalMap}
 */
function isSignalMap(v) {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	if (typeof v.get !== 'function') { return false; }
	if (typeof v.set !== 'function') { return false; }
	return true;
}

/** @type {Map<import('../types.mjs').SignalMapToken, import('../types.mjs').SignalMap>} */
const signalMaps = new Map();

const mapTypes = new Set(['string', 'symbol', 'number', 'bigint']);
/**
 *
 * @param {*} [handler]
 * @returns {import('../types.mjs').SignalMap}
 */
function toSignalMap(handler) {
	if (isSignalMap(handler)) { return handler; }
	if (!mapTypes.has(typeof handler)) { return abortTokens; }
	const oldMap = signalMaps.get(handler);
	if (oldMap) { return oldMap; }
	const map = createSignalMap();
	signalMaps.set(handler, map);
	return map;
}
/**
 *
 * @param {import('../types.mjs').Signal?} signal
 * @param {import('../types.mjs').SignalHandler?} handler
 * @returns {AbortSignal?}
 */
export default function getSignal(
	signal,
	handler,
) {
	if (signal instanceof AbortSignal) { return signal; }
	if ((signal ?? null) === null || signal === false) { return null; }
	if (typeof handler === 'function') {
		const s = handler(signal);
		if (s instanceof AbortSignal) { return s; }
		return toSignal(abortTokens, s);
	}
	return toSignal(toSignalMap(handler), signal);

}
