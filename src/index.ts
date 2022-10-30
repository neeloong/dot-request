import createFetch from './createFetch';
import createRequest from './createRequest';
import createSignalMap from './createSignalMap';
import result from './result';
import type {
	Result, DotRequest, RequestData, Api, HeaderValue, Options, Trans,
} from './types';
export type {
	Signal, SignalMap, SignalMapToken,
	Sender, Fetch,
	HeaderValue, Data,
	DotRequest, Result, Api,
	Options, Trans,
} from './types';

function create<
	T extends Record<string, any>,
	A extends any[],
	R,
>(
	p: RequestData,
	extend: [string | symbol, PropertyDescriptor][],
): DotRequest<T, A, R> {
	function init(np: Partial<RequestData>) {
		return create({ ...p, ...np }, extend);
	}
	function fetch(): Result {
		const dotRequest = create(p, extend);
		const response = p.fetch(createRequest(p), dotRequest);
		return result(response);
	}
	function method(method: string, path?: string) {
		return init(path ? { method, path, append: [] } : { method });
	}

	const api = {
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
		header(
			name: string | Record<string, HeaderValue | (() => HeaderValue)>,
			value?: HeaderValue | (() => HeaderValue),
		) {
			if (typeof name !== 'string') {
				return init({ headers: { ...p.headers, ...name } });
			}
			if (arguments.length < 2) { return p.headers[name]; }
			return init({ headers: { ...p.headers, [name]: value } });
		},
		redirect(redirect?: boolean | 'error') {
			if (redirect === undefined) { return p.redirect; }
			return init({
				redirect: typeof redirect === 'boolean' ? redirect : 'error',
			});
		},
		context(name: string | Record<string, any>, value?: any) {
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
		body(body?: any, type?: any) { return init({ body, type }); },
		form(form) { return init({ body: form, type: true }); },

		signal(signal) { return init({ signal }); },
		signalHandler(handler) {
			if (typeof handler === 'boolean') {
				return init({
					signalHandler: handler ? createSignalMap() : undefined,
				});
			}
			return init({ signalHandler: handler });
		},

		interface(fetch) {
			return init({ fetch: createFetch(fetch, p.fetch) });
		},


		create() { return createRequest(p); },
		fetch,

		ok() { return fetch().ok(); },
		text() { return fetch().ok().text(); },
		blob() { return fetch().ok().blob(); },
		arrayBuffer() { return fetch().ok().arrayBuffer(); },
		formData() { return fetch().ok().formData(); },
		json() { return fetch().ok().json(); },
		sender(sender) { return init({ sender }); },
		send(...args: A): R {
			const { sender } = p;
			if (typeof sender !== 'function') { return undefined as any; }
			return sender(init({ sender: undefined }) as any, ...args);
		},

		then(fulfilled, rejected) { return fetch().then(fulfilled, rejected); },
		catch(onrejected) { return fetch().catch(onrejected); },
		finally(onfinally) { return fetch().finally(onfinally); },
	} as Api<{}, A, R>;
	for (const [key, d] of extend) {
		if (key in api) { continue; }
		Reflect.defineProperty(api, key, d);
	}
	return api as DotRequest<T, A, R>;

}

interface dotRequest extends Api<{}, [], undefined> {
	<T extends Record<string, any>>(
		extend: T & ThisType<DotRequest<T, unknown[], unknown>>,
		options?: Options<T>
	): DotRequest<T, [], undefined>;
}
function createDotRequest<T extends Record<string, any>>(
	extend: T,
	{ fetch: allFetch }: Options<T> = {},
) {
	let fetchApi: RequestData['fetch'] = r => fetch(r);
	for (const f of [allFetch].flat()) {
		if (typeof f !== 'function') { continue; }
		fetchApi = createFetch(f, fetchApi);
	}
	return create<T, [], undefined>({
		context: {},
		append: [],
		headers: {},
		query: {},
		params: {},
		fetch: fetchApi,
		redirect: true,
	}, Reflect.ownKeys(extend)
		.map(k => [k, Reflect.getOwnPropertyDescriptor(extend, k)])
		.filter(v => v[1] as any) as [string | symbol, PropertyDescriptor][],
	);
}
const dotRequest: dotRequest = Object.assign(
	createDotRequest,
	createDotRequest({}),
) as dotRequest;

export default dotRequest;
