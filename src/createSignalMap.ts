import type { SignalMap } from './types';

function isObject(v: any): v is object | Function {
	return typeof v === 'object' || typeof v === 'function';
}
type PrimitiveType =
	| string
	| number
	| bigint
	| boolean
	| symbol;
export default function createSignalMap(): SignalMap {
	const primitiveMap = new Map<PrimitiveType, AbortController>();
	const objectMap = new WeakMap<object, AbortController>();
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
