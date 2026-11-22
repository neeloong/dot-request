import { Result } from './Result.mts';
import createFetch from './createFetch.mts';
import createRequest from './createRequest/index.mts';
import createSignalMap from './createSignalMap.mts';
import type { RequestParams } from './createRequest/index.mts';


function toString(
	template: string | (() => string) | TemplateStringsArray | undefined,
	...values: any[]
): string | (() => string) {
	if (!template) { return ''; }
	if (typeof template === 'function') { return template; }
	if (typeof template === 'string') { return template; }
	return String.raw(template, ...values.map(v => encodeURIComponent(v)));
}
const defaultFetch: (request: Request, dotRequest: DotRequest) => Promise<Response> = r => fetch(r);
class DotRequest {
	static create({ fetch }: { fetch?: DotRequest.Fetch | DotRequest.Fetch[]; }): DotRequest {
		const s = new DotRequest();
		let fetchApi = defaultFetch;
		for (const f of [fetch].flat()) {
			if (typeof f !== 'function') { continue; }
			fetchApi = createFetch(f, fetchApi);
		}
		if (fetchApi !== defaultFetch) {
			s.#fetch = fetchApi;
		}
		return s;
	}
	#options: RequestParams = {
		prefix: '',
		path: '',
		append: [],
		suffix: '',

		headers: {},
		headerGroups: [],
		params: {},
		redirect: true,

		signal: null,
		signalHandler: null,


		timeout: 0,
		integrity: '',
		keepalive: false,
		credentials: null,
		mode: null,
		cache: null,
		referrer: '',
		referrerPolicy: null,

		uploadProgress: null,
		stringifyJSON: null,
	};
	#fetch = defaultFetch;
	#context: Record<string | symbol, any> = {};
	#downloadProgress: DotRequest.ProgressListener | null = null;
	#errorHandler: DotRequest.ErrorHandler | null = null;
	#parseJSON: ((value: string) => any) | null = null;
	get version() { return '__VERSION__'; }

	build(): DotRequest {
		return new DotRequest();
	}
	buildResult(response: Promise<Response>): Result {
		return new Result(response);
	}

	clone<T extends DotRequest>(target: T): T
	clone<T extends DotRequest>(): ReturnType<this['build']>;
	clone<T extends DotRequest>(target?: T): ReturnType<this['build']> | T
	clone<T extends DotRequest>(target?: T): ReturnType<this['build']> | T {
		const api = target instanceof DotRequest ? target : this.build();
		if (api !== this) {
			api.#options = { ...this.#options };
			api.#fetch = this.#fetch;
			api.#context = this.#context;
			api.#downloadProgress = this.#downloadProgress;
			api.#errorHandler = this.#errorHandler;
			api.#parseJSON = this.#parseJSON;
		}
		// @ts-ignore
		return api;
	}
	/** 设置请求方法 */
	method(method: string, path?: string | (() => string)): this {
		this.#options.method = method;
		if (path) {
			this.#options.path = path;
			this.#options.append = [];
		}
		return this;
	}
	/** 将请求方法设置为 `GET` */
	get(path?: string | (() => string)): this
	/** 将请求方法设置为 `GET` */
	get(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `GET` */
	get(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	get(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('get', toString(...args)); }
	/** 将请求方法设置为 `POST` */
	post(path?: string | (() => string)): this
	/** 将请求方法设置为 `POST` */
	post(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `POST` */
	post(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	post(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('post', toString(...args)); }
	/** 将请求方法设置为 `PUT` */
	put(path?: string | (() => string)): this
	/** 将请求方法设置为 `PUT` */
	put(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `PUT` */
	put(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	put(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('put', toString(...args)); }
	/** 将请求方法设置为 `DELETE` */
	delete(path?: string | (() => string)): this
	/** 将请求方法设置为 `DELETE` */
	delete(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `DELETE` */
	delete(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	delete(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('delete', toString(...args)); }
	/** 将请求方法设置为 `HEAD` */
	head(path?: string | (() => string)): this
	/** 将请求方法设置为 `HEAD` */
	head(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `HEAD` */
	head(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	head(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('head', toString(...args)); }
	/** 将请求方法设置为 `QUERY` */
	query(path?: string | (() => string)): this
	/** 将请求方法设置为 `QUERY` */
	query(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 将请求方法设置为 `QUERY` */
	query(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	query(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this { return this.method('query', toString(...args)); }
	/** 修改请求路径 */
	path(path: string | (() => string)): this
	/** 修改请求路径 */
	path(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 修改请求路径 */
	path(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	path(...args: [string | (() => string) | TemplateStringsArray, ...any]): this {
		this.#options.path = toString(...args);
		this.#options.append = [];
		return this;
	}
	/** 修改请求路径前缀 */
	prefix(path: string | (() => string)): this
	/** 修改请求路径前缀 */
	prefix(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 修改请求路径前缀 */
	prefix(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	prefix(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this {
		this.#options.prefix = toString(...args);
		return this;
	}
	/** 修改请求路径后缀 */
	suffix(path: string | (() => string)): this
	/** 修改请求路径后缀 */
	suffix(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 修改请求路径后缀 */
	suffix(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	suffix(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this {
		this.#options.suffix = toString(...args);
		return this;
	}
	/** 在请求路径后追加新的路径 */
	append(path: string | (() => string)): this
	/** 在请求路径后追加新的路径 */
	append(template: TemplateStringsArray, ...substitutions: unknown[]): this
	/** 在请求路径后追加新的路径 */
	append(...args: [string | (() => string) | TemplateStringsArray | undefined, ...any]): this
	append(...path: any[]): this {
		if (!path.length) {
			this.#options.append = [];
			return this;
		}
		if (typeof path[0] === 'string') {
			this.#options.append = [...this.#options.append, ...path];
			return this;
		}
		const [template, ...values] = path;
		this.#options.append = [
			...this.#options.append,
			String.raw(template, ...values.map(v => encodeURIComponent(v))),
		];
		return this;
	}
	/** 设置请求头 */
	header(headers: (() => Record<string, DotRequest.HeaderValue> | null)): this
	/** 获取设置的请求头 */
	header(name: string): DotRequest.HeaderValue | (() => DotRequest.HeaderValue)
	/** 设置一项请求头 */
	header(name: string, value: DotRequest.HeaderValue | (() => DotRequest.HeaderValue)): this
	/** 设置请求头 */
	header(name: Record<string, DotRequest.HeaderValue | (() => DotRequest.HeaderValue)>): this
	header(
		name: string | Record<string, DotRequest.HeaderValue | (() => DotRequest.HeaderValue)> | (() => Record<string, DotRequest.HeaderValue> | null),
		value: DotRequest.HeaderValue | (() => DotRequest.HeaderValue),
	): this | DotRequest.HeaderValue | (() => DotRequest.HeaderValue)
	header(
		name: string | Record<string, DotRequest.HeaderValue | (() => DotRequest.HeaderValue)> | (() => Record<string, DotRequest.HeaderValue> | null),
		value: DotRequest.HeaderValue | (() => DotRequest.HeaderValue),
	): this | DotRequest.HeaderValue | (() => DotRequest.HeaderValue) {
		if (typeof name === 'function') {
			this.#options.headerGroups = [...this.#options.headerGroups, name];
			return this;
		}
		const { headers } = this.#options;
		if (typeof name !== 'string') {
			this.#options.headers = { ...headers, ...name };
			return this;
		}
		if (arguments.length < 2) { return headers[name]; }
		this.#options.headers = { ...headers, [name]: value };
		return this;
	}
	/**
	 * 设置重定向模式
	 * @description true 自动重定向
	 * @description false 不进行重定向
	 * @description 'error' 如果产生重定向将自动终止并且抛出一个错误
	 */
	redirect(redirect: boolean | 'error'): this;
	/** 获取重定向模式 */
	redirect(): boolean | 'error';
	redirect(redirect?: boolean | 'error'): boolean | 'error' | this;
	redirect(redirect?: boolean | 'error') {
		if (!arguments.length) { return this.#options.redirect; }
		this.#options.redirect = typeof redirect === 'boolean' ? redirect : 'error';
		return this;
	}
	/** 设置超时时间(单位毫秒) */
	timeout(t: number): this;
	/** 获取设置的超时时间(单位毫秒) */
	timeout(): number;
	timeout(t?: number): number | this;
	timeout(t?: number) {
		if (!arguments.length) { return this.#options.timeout || 0; }
		this.#options.timeout = typeof t === 'number' && t > 0 ? t : 0;
		return this;
	}
	/** 设置浏览器对凭证信息的控制方式 */
	credentials(credentials: RequestCredentials | null): this;
	/** 获取已设置浏览器对凭证信息的控制方式 */
	credentials(): RequestCredentials | null;
	credentials(credentials?: RequestCredentials | null): RequestCredentials | null | this;
	credentials(credentials?: RequestCredentials | null) {
		if (!arguments.length) { return this.#options.credentials; }
		this.#options.credentials =
			typeof credentials === 'string' && credentials || null;
		return this;
	}
	/** 设置请求模式 */
	mode(mode: RequestMode | '' | null): this;
	/** 获取设置的请求模式 */
	mode(): RequestMode | '';
	mode(mode?: RequestMode | '' | null): RequestMode | '' | this;
	mode(mode?: RequestMode | '' | null): this | RequestMode | '' {
		if (!arguments.length) { return this.#options.mode || ''; }
		this.#options.mode = typeof mode === 'string' && mode || null;
		return this;
	}
	/** 设置缓存模式 */
	cache(cache: RequestCache | null): this;
	/** 获取设置的缓存模式 */
	cache(): RequestCache | null;
	cache(cache?: RequestCache | null): RequestCache | null | this;
	cache(cache?: RequestCache | null) {
		if (!arguments.length) { return this.#options.cache; }
		this.#options.cache = typeof cache === 'string' && cache || null;
		return this;
	}
	/** 指定请求头中 referrer 的模式 */
	referrer(referrer: string): this;
	/** 获取已设置的请求头中 referrer 的模式 */
	referrer(): string;
	referrer(referrer?: string): string | this;
	referrer(referrer?: string) {
		if (!arguments.length) { return this.#options.referrer; }
		this.#options.referrer = typeof referrer === 'string' ? referrer : '';
		return this;
	}
	/** 设置请求头中 Referrer-Policy */
	referrerPolicy(rp: ReferrerPolicy | null): this;
	/** 获取已设置的请求头中 Referrer-Policy */
	referrerPolicy(): ReferrerPolicy | null;
	referrerPolicy(rp?: ReferrerPolicy | null): ReferrerPolicy | null | this;
	referrerPolicy(rp?: ReferrerPolicy | null) {
		if (!arguments.length) { return this.#options.referrerPolicy; }
		this.#options.referrerPolicy = typeof rp === 'string' && rp || null;
		return this;
	}
	/** 设置子资源完整性验证信息 */
	integrity(integrity: string): this;
	/** 获取已设置的子资源完整性验证信息 */
	integrity(): string;
	integrity(integrity?: string): string | this;
	integrity(integrity?: string) {
		if (!arguments.length) { return this.#options.integrity; }
		this.#options.integrity = typeof integrity === 'string' ? integrity : '';
		return this;
	}
	/** 设置在页面被关闭后，链接是否可以继续保持活跃 */
	keepalive(keep: boolean): this;
	/** 获取已设置的活跃配置 */
	keepalive(): boolean;
	keepalive(keep?: boolean): boolean | this;
	keepalive(keep?: boolean) {
		if (typeof keep !== 'boolean') { return this.#options.keepalive || false; }
		this.#options.keepalive = keep;
		return this;
	}
	/** 获取设置的上下文数据 */
	context<V>(name: string | symbol): V
	/** 设置一项上下文数据 */
	context(name: string | symbol | Record<string, any>, value: any): this
	/** 设置上下文数据 */
	context(context: Record<string, any>): this
	context(name: string | symbol | Record<string, any>, value?: any) {
		const context = this.#context;
		if (typeof name !== 'string' && typeof name !== 'symbol') {
			this.#context = { ...context, ...name };
			return this;
		}
		if (arguments.length < 2) { return context[name]; }
		this.#context = { ...context, [name]: value };
		return this;
	}

	/** 设置路径参数 */
	params(params?: Record<string, string | number>): this {
		this.#options.params = params ? { ...this.#options.params, ...params } : {};
		return this;
	}
	/** 设置查询字符串 */
	search(search?: string): this
	/** 设置查询参数 */
	search(query?: Record<string, any> | null): this
	/** 设置查询字符串或参数 */
	search(search?: string | Record<string, any> | null): this
	search(search?: string | Record<string, any> | null): this {
		if (typeof search !== 'object') {
			this.#options.search = search;
			return this;
		}
		if (!search) {
			delete this.#options.query;
			return this;
		}
		const oldQuery = this.#options.query;
		this.#options.query = oldQuery ? [...oldQuery, search] : [search];
		return this;
	}
	/** 设置请求数据 */
	data(data?: Record<string, any>): this {
		this.#options.data = data;
		return this;
	}
	/** 设置请求身体 */
	body(body?: DotRequest.BodyData, type?: string): this
	/** 设置请求身体 */
	body(body?: object | Record<string, any>): this
	/** 设置请求身体 */
	body(body?: any, type?: string): this
	/** 设置请求身体 */
	body(body?: any, type?: string): this {
		this.#options.body = body;
		this.#options.type = type;
		return this;
	}
	/** 设置请求身体 */
	form(form?: FormData | object | Record<string, any>): this {
		this.#options.body = form;
		this.#options.type = true;
		return this;
	}

	/** 设置中断信号 */
	signal(signal?: DotRequest.Signal): this {
		this.#options.signal = signal || null;
		return this;
	}
	/** 设置中断信号处理函数 */
	signalHandler(handler?: DotRequest.SignalHandler | boolean): this {
		this.#options.signalHandler =
			handler === true ? createSignalMap() : handler || null;
		return this;
	}

	/** 设置上传进度监听 */
	uploadProgress(up: DotRequest.ProgressListener): this {
		this.#options.uploadProgress = typeof up === 'function' ? up : null;
		return this;
	}
	/** 设置 JSON 字符串化函数 */
	stringifyJSON(fn?: ((value: any) => string) | null): this {
		this.#options.stringifyJSON = typeof fn === 'function' ? fn : null;
		return this;
	}
	/** 设置下载进度监听 */
	downloadProgress(dp: DotRequest.ProgressListener | null): this {
		this.#downloadProgress = typeof dp === 'function' ? dp : null;
		return this;
	}
	/** 设置异常相应处理函数 */
	errorHandler(eh: DotRequest.ErrorHandler | null): this {
		this.#errorHandler = typeof eh === 'function' ? eh : null;
		return this;
	}
	/** 设置异常相应处理函数 */
	parseJSON(fn: ((value: string) => any) | null): this {
		this.#parseJSON = typeof fn === 'function' ? fn : null;
		return this;
	}
	/** 创建对应的 Request 对象 */
	create(): Request { return createRequest(this.#options); }
	/** 设置请求方法 */
	fetch(fetch: DotRequest.Fetch): this
	/** 发送请求并获取相应结果 */
	fetch(): ReturnType<this['buildResult']>
	fetch(fetch?: DotRequest.Fetch): ReturnType<this['buildResult']> | this
	fetch(fetch?: DotRequest.Fetch): ReturnType<this['buildResult']> | this {
		if (typeof fetch === 'function') {
			this.#fetch = createFetch(fetch, this.#fetch);
			return this;
		}
		const dotRequest = this.clone();
		const response = this.#fetch(this.create(), dotRequest);
		let result = this.buildResult(response);
		const parseJSON = this.#parseJSON;
		if (typeof parseJSON === 'function') {
			result = result.parseJSON(parseJSON);
		}
		const dp = this.#downloadProgress;
		if (dp) { result = result.downloadProgress(dp); }
		const eh = this.#errorHandler;
		if (eh) { result = result.ok(eh); }
		// @ts-ignore
		return result;
	}

	/** 发送请求，并获取状态码在 200-299 的相应结果 */
	ok(error?: DotRequest.ErrorHandler | null): ReturnType<this["buildResult"]> { return this.fetch().ok(error); }
	/** 发送请求，并获取文本格式的相应体 */
	text(): Promise<string> { return this.fetch().ok().text(); }
	/** 发送请求，并获取 Blob 格式的相应体 */
	blob(): Promise<Blob> { return this.fetch().ok().blob(); }
	/** 发送请求，并获取 ArrayBuffer 格式的相应体 */
	arrayBuffer(): Promise<ArrayBuffer> { return this.fetch().ok().arrayBuffer(); }
	/** 发送请求，并获取 FormData 格式的相应体 */
	formData(): Promise<FormData> { return this.fetch().ok().formData(); }
	/** 发送请求，并获取 JSON 格式的相应体 */
	json<T>(reviver?: (this: any, key: string, value: any) => any): Promise<T> { return this.fetch().ok().json(reviver); }
	/** 发送请求，并获取 UrlSearchParams 格式的相应体 */
	searchParams(): Promise<URLSearchParams> { return this.fetch().ok().searchParams(); }
	/** 发送请求，并获取相应流 */
	stream(): Promise<ReadableStream<Uint8Array> | null> { return this.fetch().ok().stream(); }
	/** 发送请求，并根据 Content-Type 相应头获取对应格式的相应体 */
	result<T>(): Promise<T | null> { return this.fetch().ok().result(); }
	/** 发送请求，并返回自定义结果 */
	done<T>(value: T): Promise<T>;
	/** 发送请求，但不返回结果 */
	done(): Promise<void>
	/** 发送请求，并返回自定义结果 */
	done(value?: unknown): Promise<unknown>
	done(value?: unknown): Promise<unknown> { return this.fetch().ok().done(value); }

	/** 发送请求并获取相应，并按照 Promise.then 的方式处理 */
	then<TResult1 = Response, TResult2 = never>(
		fulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | null,
		rejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this.fetch().then(fulfilled, rejected);
	}
	/** 发送请求并获取相应，并按照 Promise.catch 的方式处理 */
	catch<TResult = never>(
		onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
	): Promise<Response | TResult> {
		return this.fetch().catch(onrejected);
	}
	/** 发送请求并获取相应，并按照 Promise.finally 的方式处理 */
	finally(onfinally: (() => void) | null): Promise<Response> {
		return this.fetch().finally(onfinally);
	}
}
declare namespace DotRequest {
	export type { Result };
	export type Signal = AbortSignal | number | bigint | string | symbol | object | boolean | Record<string, any>;
	export interface SignalMap {
		get(signal: Exclude<Signal, AbortSignal>): AbortController | void | null;
		set(signal: Exclude<Signal, AbortSignal>, ac: AbortController): void;
	}
	export type SignalMapToken = number | bigint | string | symbol;
	export type SignalHandler = SignalMapToken | SignalMap | ((v: any) => Signal);

	export type BodyData =
		| FormData | ArrayBuffer | ArrayBufferView<ArrayBuffer>
		| object | Record<string, any>
		| ReadableStream | Blob | BufferSource | URLSearchParams | string

	export type HeaderValue = number | string | void | null

	export interface ProgressListener {
		(progress: number, total: number): void
	}
	export interface ErrorHandler {
		(response: Response): unknown | Promise<unknown>
	}
	export interface Fetch {
		(
			request: Request,
			fetch: (request?: Request, dotRequest?: DotRequest) => Promise<Response>,
			dotRequest: DotRequest,
		): PromiseLike<Response> | Response
	}
}
Object.defineProperty(DotRequest, 'Result', {
	get() { return Result; },
	enumerable: true,
	configurable: true,
})
export { DotRequest };
