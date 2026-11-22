import type { DotRequest } from '../DotRequest.mts';
import createSignalMap from '../createSignalMap.mts';

const types = new Set([
	'object',
	'string',
	'symbol',
	'number',
	'boolean',
	'bigint',
]);
const abortTokens = createSignalMap();

function toSignal(tokens: DotRequest.SignalMap, signal?: any): AbortSignal | null {
	if (!types.has(typeof signal)) { return null; }
	if (signal === null || signal === false) { return null; }
	tokens.get(signal)?.abort();
	const ac = new AbortController();
	tokens.set(signal, ac);
	return ac.signal;
}

function isSignalMap(v: any): v is DotRequest.SignalMap {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	if (typeof v.get !== 'function') { return false; }
	if (typeof v.set !== 'function') { return false; }
	return true;
}

const signalMaps: Map<DotRequest.SignalMapToken, DotRequest.SignalMap> = new Map();

const mapTypes = new Set(['string', 'symbol', 'number', 'bigint']);

function toSignalMap(handler?: any): DotRequest.SignalMap {
	if (isSignalMap(handler)) { return handler; }
	if (!mapTypes.has(typeof handler)) { return abortTokens; }
	const oldMap = signalMaps.get(handler);
	if (oldMap) { return oldMap; }
	const map = createSignalMap();
	signalMaps.set(handler, map);
	return map;
}

export default function getSignal(
	signal: DotRequest.Signal | null,
	handler: DotRequest.SignalHandler | null,
): AbortSignal | null {
	if (signal instanceof AbortSignal) { return signal; }
	if ((signal ?? null) === null || signal === false) { return null; }
	if (typeof handler === 'function') {
		const s = handler(signal);
		if (s instanceof AbortSignal) { return s; }
		return toSignal(abortTokens, s);
	}
	return toSignal(toSignalMap(handler), signal);

}
