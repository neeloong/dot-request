import type { SignalMap, Signal, SignalMapToken } from '../types';
import createSignalMap from '../createSignalMap';

const types = new Set([
	'object',
	'string',
	'symbol',
	'number',
	'boolean',
	'bigint',
]);
const abortTokens = createSignalMap();

function toSignal(
	tokens: SignalMap,
	signal?: any,
): AbortSignal | undefined {
	if (!types.has(typeof signal)) { return; }
	if (signal === null || signal === false) { return; }
	tokens.get(signal)?.abort();
	const ac = new AbortController();
	tokens.set(signal, ac);
	return ac.signal;
}
function isSignalMap(v: any): v is SignalMap {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	if (typeof v.get !== 'function') { return false; }
	if (typeof v.set !== 'function') { return false; }
	return true;
}


const signalMaps = new Map<SignalMapToken, SignalMap>();

const mapTypes = new Set(['string', 'symbol', 'number', 'bigint']);
function toSignalMap(handler?: any): SignalMap {
	if (isSignalMap(handler)) { return handler; }
	if (!mapTypes.has(typeof handler)) { return abortTokens; }
	const oldMap = signalMaps.get(handler);
	if (oldMap) { return oldMap; }
	const map = createSignalMap();
	signalMaps.set(handler, map);
	return map;
}
export default function getSignal(
	signal?: Signal,
	handler?: SignalMap | SignalMapToken | ((v: any) => Signal),
) {
	if (signal instanceof AbortSignal) { return signal; }
	if (signal === null || signal === undefined || signal === false) { return; }
	if (typeof handler === 'function') {
		const s = handler(signal);
		if (s instanceof AbortSignal) { return s; }
		return toSignal(abortTokens, s);
	}
	return toSignal(toSignalMap(handler), signal);

}
