import createRequest from './createRequest';
import send from './send';
import type { RequestData } from './send';
import type { Signal } from './types';

interface ChainRequest<T = unknown> {
	get(path?: string): ChainRequest<T>;
	post(path?: string): ChainRequest<T>;
	put(path?: string): ChainRequest<T>;
	delete(path?: string): ChainRequest<T>;
	head(path?: string): ChainRequest<T>;
	path(path: string): ChainRequest<T>;
	root(path?: string): ChainRequest<T>;
	append(...path: string[]): ChainRequest<T>;

	header(name: string, value?: string | (() => string | undefined | null)): ChainRequest<T>;
	headers(headers: Record<string, string | (() => string | undefined | null)>): ChainRequest<T>;

	params(params?: Record<string, any>): ChainRequest<T>;
	query(query?: Record<string, any>): ChainRequest<T>;
	search(search?: string): ChainRequest<T>;
	body(body?: ReadableStream | FormData | Blob | BufferSource | FormData | URLSearchParams): ChainRequest<T>;
	data(data?: Record<string, any>): ChainRequest<T>;
	body(body?: string | ArrayBuffer | ArrayBufferView): ChainRequest<T>;
	body(body?: object | Record<string, any>, type?: string): ChainRequest<T>;
	form(form?: FormData | Record<string, any>): ChainRequest<T>;

	signal(signal?: Signal | boolean): ChainRequest<T>;
	signalHandler(signalHandler?: Signal | ((v: any) => Signal)): ChainRequest<T>;

	text(): Promise<string>;
	blob(): Promise<Blob>;
	arrayBuffer(): Promise<ArrayBuffer>;
	formData(): Promise<FormData>;
	json<V = T>(): Promise<V>;

	ok(): Result<T>;
	send(): Result<T>;
	create(): Request;

	then<TResult1 = Response, TResult2 = never>(onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
	catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<Response | TResult>;
	finally(onfinally?: (() => void) | undefined | null): Promise<Response>;

	handler(...handlers: ((v: Response) => any)[]): ChainRequest<T>;
	catcher(...catchers: ((v: any) => any)[]): ChainRequest<T>;
}

interface Result<T> {
	text(): Promise<string>;
	blob(): Promise<Blob>;
	arrayBuffer(): Promise<ArrayBuffer>;
	formData(): Promise<FormData>;
	json<V = T>(): Promise<V>;

	ok(): Result<T>;
	clone(): Result<T>;
	copy(): ChainRequest<T>;

	then<TResult1 = Response, TResult2 = never>(onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
	catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<Response | TResult>;
	finally(onfinally?: (() => void) | undefined | null): Result<T>

	do(handler?: ((v: Response) => any) | null, catcher?: ((v: any) => any) | null): Result<T>;
}

function result<T>(p: RequestData, response: Promise<Response>): Result<T> {
	return {
		text(): Promise<string> { return response.then(onlyOk).then(r => r.text()); },
		blob(): Promise<Blob> { return response.then(onlyOk).then(r => r.blob()); },
		arrayBuffer(): Promise<ArrayBuffer> { return response.then(onlyOk).then(r => r.arrayBuffer()); },
		formData(): Promise<FormData> { return response.then(onlyOk).then(r => r.formData()); },
		json<V = T>(): Promise<V> { return response.then(onlyOk).then(r => r.json()); },

		ok(): Result<T> { return result<T>(p, response.then(onlyOk)); },
		clone() { return result<T>(p, response.then(r => r.clone())) },
		copy() { return create(p) },

		then(r1, r2) { return response.then(r1, r2) },
		catch(r) { return response.catch(r) },
		finally(r) { return result<T>(p, response.finally(r)) },


		do(handler, catcher) {
			return result(p, response.then(async e => {
				if (typeof handler === 'function') {
					await handler(e);
				}
				return e;
			}, async e => {
				if (typeof catcher === 'function') {
					await catcher(e);
				}
				throw e;
			}))
		},
	}

}

function onlyOk(v: Response) {
	if (v.ok) { return v}
	throw v;
}
function create<T = any>(p: RequestData): ChainRequest<T> {
	return {
		get(path = p.path) { return create<T>({ ...p, method: 'get', path }); },
		post(path = p.path) { return create<T>({ ...p, method: 'post', path }); },
		put(path = p.path) { return create<T>({ ...p, method: 'put', path }); },
		delete(path = p.path) { return create<T>({ ...p, method: 'delete', path }); },
		head(path = p.path) { return create<T>({ ...p, method: 'head', path }); },
		path(path) { return create<T>({ ...p, path, append: [] }); },
		root(root) { return create<T>({ ...p, root }); },
		append(...path) { return create<T>({ ...p, append: [...p.append, ...path] }); },

		header(name, v) { return create<T>({ ...p, headers: {...p.headers, [name]: v} }); },
		headers(headers) { return create<T>({ ...p, headers: {...p.headers, ...headers} }); },

		params(params) { return create<T>({ ...p, params: {...p.params, ...params} }); },
		query(query) { return create<T>({ ...p, query }); },
		search(search) { return create<T>({ ...p, search }); },
		data(data) { return create<T>({ ...p, data }); },
		body(body?: any, type?: any) { return create<T>({ ...p, body, type }); },
		form(form) { return create<T>({ ...p, body: form, type: true }); },

		signal(signal) { return create<T>({ ...p, signal }); },
		signalHandler(signalHandler) { return create<T>({ ...p, signalHandler }); },

		text(): Promise<string> { return send(p).then(onlyOk).then(r => r.text()); },
		blob(): Promise<Blob> { return send(p).then(onlyOk).then(r => r.blob()); },
		arrayBuffer(): Promise<ArrayBuffer> { return send(p).then(onlyOk).then(r => r.arrayBuffer()); },
		formData(): Promise<FormData> { return send(p).then(onlyOk).then(r => r.formData()); },
		json<V = T>(): Promise<V> { return send(p).then(onlyOk).then(r => r.json()); },

		ok(): Result<T> { return result<T>(p, send(p).then(onlyOk)); },
		send(): Result<T> { return result<T>(p, send(p)); },
		create() { return createRequest(p)},

		then(r1, r2) { return send(p).then(r1, r2) },
		catch(r) { return send(p).catch(r) },
		finally(r) { return send(p).finally(r) },
		handler(...handlers) { return create<T>({ ...p, handlers: [...p.handlers, ...handlers] }); },
		catcher(...catchers) { return create<T>({ ...p, catchers: [...p.catchers, ...catchers] }); },
	
	}
}

function ChainRequest<T>(fetch?: (request: Request) => Promise<Response>) {
	if (typeof fetch !== 'function') { fetch = undefined; }
	return create<T>({fetch, append: [], handlers: [], catchers: []});
}
declare namespace ChainRequest {
	export { Signal, Result };
}

ChainRequest.get = <T>(path: string) => create<T>({ method: 'get', path, append: [], handlers: [], catchers: []});
ChainRequest.post = <T>(path: string) => create<T>({ method: 'post', path, append: [], handlers: [], catchers: []});
ChainRequest.put = <T>(path: string) => create<T>({ method: 'put', path, append: [], handlers: [], catchers: []});
ChainRequest.delete = <T>(path: string) => create<T>({ method: 'delete', path, append: [], handlers: [], catchers: []});
ChainRequest.head = <T>(path: string) => create<T>({ method: 'head', path, append: [], handlers: [], catchers: []});
ChainRequest.root = <T>(root: string) => create<T>({ root, append: [], handlers: [], catchers: []});
ChainRequest.path = <T>(path: string) => create<T>({ path, append: [], handlers: [], catchers: []});
ChainRequest.header = <T>(name: string, value: string | (() => string | undefined | null)) => create<T>({ headers: {[name]: value}, append: [], handlers: [], catchers: []});
ChainRequest.headers = <T>(headers: Record<string, string | (() => string | undefined | null)>) => create<T>({ headers: {...headers}, append: [], handlers: [], catchers: []});

ChainRequest.signalHandler = <T>(signalHandler?: Signal | ((v: any) => Signal)) => create<T>({ signalHandler, append: [], handlers: [], catchers: [] })
ChainRequest.handlers = <T>(...handlers: ((v: Response) => any)[]) => create<T>({ append: [], handlers, catchers: [] })
ChainRequest.catchers = <T>(...catchers: ((v: any) => any)[]) => create<T>({ append: [], handlers: [], catchers })

export default ChainRequest;
