import createRequest from './createRequest';
import fetchData from './send';
import type { Data, RequestData, RequestParams, Result, Signal } from './types';
export type { Data, RequestData, RequestParams, Result, Signal } from './types';

function onlyOk(v: Response) {
	if (v.ok) { return v }
	throw v;
}

function result<T, R extends DotRequest<T>>(p: R, response: Promise<Response>): Result<T, R> {
	return {
		text(): Promise<string> { return response.then(onlyOk).then(r => r.text()); },
		blob(): Promise<Blob> { return response.then(onlyOk).then(r => r.blob()); },
		arrayBuffer(): Promise<ArrayBuffer> { return response.then(onlyOk).then(r => r.arrayBuffer()); },
		formData(): Promise<FormData> { return response.then(onlyOk).then(r => r.formData()); },
		json<V = T>(): Promise<V> { return response.then(onlyOk).then(r => r.json()); },

		ok(): Result<T, R> { return result<T, R>(p, response.then(onlyOk)); },
		clone() { return result<T, R>(p, response.then(r => r.clone())) },
		copy() { return p.clone() },

		then(r1, r2) { return response.then(r1, r2) },
		catch(r) { return response.catch(r) },
		finally(r) { return result<T, R>(p, response.finally(r)) },


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

class DotRequest<T = unknown> {
	private readonly __c: new (p: RequestData) => this
	constructor(protected readonly _p: RequestData) {
		this.__c = new.target as { new(p: RequestData): any }
	}
	get(path = this._p.path): this {
		return new this.__c({ ...this._p, method: 'get', path });
	}
	post(path = this._p.path): this {
		return new this.__c({ ...this._p, method: 'post', path });
	}
	put(path = this._p.path): this {
		return new this.__c({ ...this._p, method: 'put', path });
	}
	delete(path = this._p.path): this {
		return new this.__c({ ...this._p, method: 'delete', path });
	}
	head(path = this._p.path): this {
		return new this.__c({ ...this._p, method: 'head', path });
	}
	path(path: string): this {
		return new this.__c({ ...this._p, path });
	}
	root(root?: string): this {
		return new this.__c({ ...this._p, root });
	}
	append(...path: string[]): this {
		return new this.__c({ ...this._p, append: [...this._p.append || [], ...path] });
	}

	header(name: string, value?: string | (() => string | undefined | null)): this {
		return new this.__c({ ...this._p, headers: { ...this._p.headers, [name]: value } });
	}
	headers(headers: Record<string, string | (() => string | undefined | null)>): this {
		return new this.__c({ ...this._p, headers: { ...this._p.headers, ...headers } });
	}

	params(params?: Record<string, any>): this {
		return new this.__c({ ...this._p, params: { ...this._p.params, ...params } });
	}
	query(query?: Record<string, any>): this {
		return new this.__c({ ...this._p, query });
	}
	search(search?: string): this {
		return new this.__c({ ...this._p, search });
	}
	data(data?: Record<string, any>): this {
		return new this.__c({ ...this._p, data });
	}
	body(body?: ReadableStream | FormData | Blob | BufferSource | FormData | URLSearchParams): DotRequest<T>;
	body(body?: string | ArrayBuffer | ArrayBufferView): DotRequest<T>;
	body(body?: object | Record<string, any>, type?: string): DotRequest<T>;
	body(body?: any, type?: any): this {
		return new this.__c({ ...this._p, body, type });
	}
	form(form?: FormData | Record<string, any>): this {
		return new this.__c({ ...this._p, body: form, type: true });
	}

	signal(signal?: Signal | boolean): this {
		return new this.__c({ ...this._p, signal });
	}
	signalHandler(signalHandler?: Signal | ((v: any) => Signal)): this {
		return new this.__c({ ...this._p, signalHandler });
	}

	handler(...handlers: ((v: Response) => any)[]): this {
		return new this.__c({ ...this._p, handlers: [...this._p.handlers || [], ...handlers] });
	}
	catcher(...catchers: ((v: any) => any)[]): this {
		return new this.__c({ ...this._p, catchers: [...this._p.catchers || [], ...catchers] });
	}

	interface(fetch?: (request: Request) => Response | Promise<Response>): this {
		return new this.__c({ ...this._p, fetch });
	}

	clone(): this {
		return new this.__c(this._p);
	}
	create(): Request {
		return createRequest(this._p)
	}
	async fetch(): Promise<Response> {
		const { handlers, catchers, fetch } = this._p;
		const request = this.create();
		const response = await fetchData(request, catchers, fetch);
		for (const handler of handlers || []) {
			if (typeof handler !== 'function') { continue }
			await handler(response);
		}
		return response;
	}

	text(): Promise<string> {
		return this.fetch().then(onlyOk).then(r => r.text());
	}
	blob(): Promise<Blob> {
		return this.fetch().then(onlyOk).then(r => r.blob());
	}
	arrayBuffer(): Promise<ArrayBuffer> {
		return this.fetch().then(onlyOk).then(r => r.arrayBuffer());
	}
	formData(): Promise<FormData> {
		return this.fetch().then(onlyOk).then(r => r.formData());
	}
	json<V = T>(): Promise<V> {
		return this.fetch().then(onlyOk).then(r => r.json());
	}
	send(): Result<T, this> {
		return result<T, this>(this, this.fetch());
	}
	ok(): Result<T, this> {
		return result<T, this>(this, this.fetch().then(onlyOk));
	}


	then<TResult1 = Response, TResult2 = never>(
		onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
	): Promise<TResult1 | TResult2> {
		return this.fetch().then(onfulfilled, onrejected)
	}
	catch<TResult = never>(
		onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
	): Promise<Response | TResult> {
		return this.fetch().catch(onrejected)
	}
	finally(
		onfinally?: (() => void) | undefined | null,
	): Promise<Response> {
		return this.fetch().finally(onfinally);
	}

	static get<T>(path: string) {
		return new this<T>({ method: 'get', path });
	}
	static post<T>(path: string) {
		return new this<T>({ method: 'post', path });
	}
	static put<T>(path: string) {
		return new this<T>({ method: 'put', path });
	}
	static delete<T>(path: string) {
		return new this<T>({ method: 'delete', path });
	}
	static head<T>(path: string) {
		return new this<T>({ method: 'head', path });
	}
	static root<T>(root: string) {
		return new this<T>({ root });
	}
	static path<T>(path: string) {
		return new this<T>({ path });
	}
	static header<T>(name: string, value: string | (() => string | undefined | null)) {
		return new this<T>({ headers: { [name]: value } });
	}
	static headers<T>(headers: Record<string, string | (() => string | undefined | null)>) {
		return new this<T>({ headers: { ...headers } });
	}

	static signalHandler<T>(signalHandler?: Signal | ((v: any) => Signal)) {
		return new this<T>({ signalHandler })
	}
	static handlers<T>(...handlers: ((v: Response) => any)[]) {
		return new this<T>({ handlers })
	}
	static catchers<T extends DotRequest<T>>(this: new (p: RequestData) => T, ...catchers: ((v: any) => any)[]): T {
		return new this({ catchers })
	}
}
declare namespace DotRequest {
	export { Data, RequestData, RequestParams, Result, Signal };
}


export default DotRequest;
