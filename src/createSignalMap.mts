import type { DotRequest } from './DotRequest.mts';

function isObject(v: any): v is object | Function {
	return typeof v === 'object' || typeof v === 'function';
}

export default function createSignalMap(): DotRequest.SignalMap {
	type PrimitiveType = string | number | bigint | boolean | symbol;
	const primitiveMap: Map<PrimitiveType, AbortController> = new Map();
	const objectMap: WeakMap<object, AbortController> = new WeakMap();
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
