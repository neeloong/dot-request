import type { Signal } from '../types';


const abortTokens = new Map<any, AbortController>();
function getSignal2(signal?: any): AbortSignal | undefined {
	if (!['object', 'string', 'symbol', 'number'].includes(typeof signal)){ return; }
	abortTokens.get(signal)?.abort();
	const ac = new AbortController();
	abortTokens.set(signal, ac);
	return ac.signal;
}
export default function getSignal(
	signal?: Signal | boolean,
	handler?: Signal | ((v: any) => Signal),
) {
	if (signal instanceof AbortSignal) { return signal; }
	if (typeof handler === 'function') {
		const s = handler(signal);
		if (s instanceof AbortSignal) { return s; }
		return getSignal2(s);
	}
	return getSignal2(signal === true ? handler : signal);

}
