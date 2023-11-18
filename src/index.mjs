import createFetch from './createFetch.mjs';
import createRequest from './createRequest/index.mjs';
import createSignalMap from './createSignalMap.mjs';
import result from './result.mjs';
/**
 * @typedef {object} RequestDataParams
 * @property {import('./types.mjs').Sender<any, any, any>?} sender
 * @property {(request: Request, dotRequest: import('./types.mjs').DotRequest<any, any, any>) => Promise<Response>} fetch
 * @property {Record<string | symbol, any>} context
 * @property {import('./types.mjs').ProgressListener?} downloadProgress
 */
/**
 * @typedef {import('./createRequest/index.mjs').RequestParams & RequestDataParams} RequestData
 */

/**
 * @template {Record<string, any>} T
 * @template {any[]} A
 * @template R
 * @param {RequestData} p
 * @param {[string | symbol, PropertyDescriptor][]} extend
 * @returns {import('./types.mjs').DotRequest<T, A, R>}
 */
function create(p, extend) {
	/**
	 *
	 * @param {Partial<RequestData>} np
	 * @returns
	 */
	function init(np) {
		return create({ ...p, ...np }, extend);
	}
	/** @returns {import('./types.mjs').Result} */
	function fetch() {
		const dotRequest = create(p, extend);
		const response = p.fetch(createRequest(p), dotRequest);
		const res = result(response);
		const dp = p.downloadProgress;
		if (!dp) { return res; }
		return res.downloadProgress(dp);
	}
	/**
	 *
	 * @param {string} method
	 * @param {string} [path]
	 * @returns
	 */
	function method(method, path) {
		return init(path ? { method, path, append: [] } : { method });
	}
	const api = /** @type {import('./types.mjs').Api<T, A, R>} */({
		get version() { return '__VERSION__'; },
		method,
		get(path) { return method('get', path); },
		post(path) { return method('post', path); },
		put(path) { return method('put', path); },
		delete(path) { return method('delete', path); },
		head(path) { return method('head', path); },
		path(path) { return init({ path, append: [] }); },
		prefix(prefix) { return init({ prefix }); },
		suffix(suffix) { return init({ suffix }); },
		append(...path) { return init({ append: [...p.append, ...path] }); },
		/**
		 *
		 * @param {string | Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} name
		 * @param {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)} [value]
		 * @returns
		 */
		header(name, value) {
			if (typeof name !== 'string') {
				return init({ headers: { ...p.headers, ...name } });
			}
			if (arguments.length < 2) { return p.headers[name]; }
			return init({ headers: { ...p.headers, [name]: value } });
		},
		/**
		 *
		 * @param {boolean | 'error'} [redirect]
		 * @returns
		 */
		redirect(redirect) {
			if (!arguments.length) { return p.redirect; }
			return init({
				redirect: typeof redirect === 'boolean' ? redirect : 'error',
			});
		},
		/**
		 *
		 * @param {number} [t]
		 * @returns
		 */
		timeout(t) {
			if (!arguments.length) { return p.timeout || 0; }
			return init({timeout: typeof t === 'number' && t > 0 ? t : 0});
		},
		/**
		 * @param {RequestCredentials?} [credentials]
		 */
		credentials(credentials) {
			if (!arguments.length) { return p.credentials; }
			return init({
				credentials: typeof credentials === 'string' && credentials || null,
			});
		},
		/**
		 * @param {RequestMode?} [mode]
		 */
		mode(mode) {
			if (!arguments.length) { return p.mode || ''; }
			return init({ mode: typeof mode === 'string' && mode || null });
		},
		/**
		 * @param {RequestCache?} [cache]
		 */
		cache(cache) {
			if (!arguments.length) { return p.cache; }
			return init({ cache: typeof cache === 'string' && cache || null });
		},
		/**
		 * @param {string} [referrer]
		 */
		referrer(referrer) {
			if (!arguments.length) { return p.referrer; }
			return init({
				referrer: typeof referrer === 'string' ? referrer : '',
			});
		},
		/**
		 * 设置请求头中 Referrer-Policy
		 * @param {ReferrerPolicy?} rp Referrer-Policy 值
		 */
		referrerPolicy(rp) {
			if (!arguments.length) { return p.referrerPolicy; }
			return init({
				referrerPolicy: typeof rp === 'string' && rp || null,
			});
		},
		integrity(integrity) {
			if (!arguments.length) { return p.integrity; }
			return init({
				integrity: typeof integrity === 'string' ? integrity : '',
			});
		},
		/**
		 * @param {boolean} [keep]
		 */
		keepalive(keep) {
			if (typeof keep !== 'boolean') { return p.keepalive || false; }
			return init({ keepalive: keep });
		},
		/**
		 * @param {string | Record<string, any>} name
		 * @param {*} [value]
		 */
		context(name, value) {
			if (typeof name !== 'string') {
				return init({ context: { ...p.context, ...name } });
			}
			if (arguments.length < 2) { return p.context[name]; }
			return init({ context: { ...p.context, [name]: value } });
		},

		params(params) {
			if (!params) { return init({ params: {} }); }
			return init({ params: { ...p.params, ...params } });
		},
		query(query) {
			if (!query) { return init({ query: {} }); }
			return init({ query: { ...p.query, ...query } });
		},
		search(search) { return init({ search }); },
		data(data) { return init({ data }); },
		/**
		 *
		 * @param {*} [body]
		 * @param {string} [type]
		 * @returns
		 */
		body(body, type) { return init({ body, type }); },
		form(form) { return init({ body: form, type: true }); },

		signal(signal) { return init({ signal }); },
		signalHandler(handler) {
			if (typeof handler === 'boolean') {
				return init({
					signalHandler: handler ? createSignalMap() : null,
				});
			}
			return init({ signalHandler: handler });
		},

		interface(fetch) {
			return init({ fetch: createFetch(fetch, p.fetch) });
		},
		uploadProgress(up) {
			return init({ uploadProgress: typeof up === 'function' ? up : null });
		},
		downloadProgress(dp) {
			return init({ downloadProgress: typeof dp === 'function' ? dp : null });
		},
		create() { return createRequest(p); },
		fetch,

		ok() { return fetch().ok(); },
		text() { return fetch().ok().text(); },
		blob() { return fetch().ok().blob(); },
		arrayBuffer() { return fetch().ok().arrayBuffer(); },
		formData() { return fetch().ok().formData(); },
		json() { return fetch().ok().json(); },
		stream() { return fetch().ok().stream(); },
		sender(sender) { return init({ sender }); },
		/**
		 *
		 * @param  {A} args
		 * @returns {R}
		 */
		send(...args) {
			const { sender } = p;
			// @ts-ignore
			if (typeof sender !== 'function') { return; }
			return sender(init({ sender: null }), ...args);
		},

		then(fulfilled, rejected) { return fetch().then(fulfilled, rejected); },
		catch(onrejected) { return fetch().catch(onrejected); },
		finally(onfinally) { return fetch().finally(onfinally); },
	});
	for (const [key, d] of extend) {
		if (key in api) { continue; }
		Reflect.defineProperty(api, key, d);
	}
	return /** @type {import('./types.mjs').DotRequest<T, A, R>} */(api);

}

/**
 * @template {Record<string, any>} T
 * @param {T} extend
 * @param {import('./types.mjs').Options<T>} [options]
 * @returns
 */
function createDotRequest(extend, { fetch: allFetch } = {}) {
	/** @type {RequestData['fetch']} */
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
