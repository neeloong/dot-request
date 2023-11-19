import create from './create.mjs';
import createFetch from './createFetch.mjs';
/**
 * @template {Record<string, any>} T
 * @param {T} extend
 * @param {import('./types.mjs').Options<T>} [options]
 * @returns
 */
function createDotRequest(extend, { fetch: allFetch } = {}) {
	/** @type {import('./create.mjs').RequestData['fetch']} */
	let fetchApi = r => fetch(r);
	for (const f of [allFetch].flat()) {
		if (typeof f !== 'function') { continue; }
		fetchApi = createFetch(f, fetchApi);
	}
	return create({
		prefix: '',
		path: '',
		append: [],
		suffix: '',

		context: {},
		headers: {},
		query: {},
		params: {},
		fetch: fetchApi,
		redirect: true,

		signal: null,
		signalHandler: null,

		sender: null,

		timeout: 0,
		integrity: '',
		keepalive: false,
		credentials: null,
		mode: null,
		cache: null,
		referrer: '',
		referrerPolicy: null,

		uploadProgress: null,
		downloadProgress: null,
	}, /** @type {[string | symbol, PropertyDescriptor][]} */(
		Reflect.ownKeys(extend)
			.map(k => [k, Reflect.getOwnPropertyDescriptor(extend, k)])
			.filter(v => v[1])),
	);
}
/** @type {import('./types.mjs').default} */
const dotRequest = /** @type {import('./types.mjs').default} */(Object.assign(
	createDotRequest,
	createDotRequest({}),
));

export default dotRequest;
