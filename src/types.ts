export type Signal =
	| AbortSignal
	| number
	| bigint
	| string
	| symbol
	| object
	| boolean | Record<string, any>;
export interface SignalMap {
	get(signal: Exclude<Signal, AbortSignal>): AbortController | undefined;
	set(signal: Exclude<Signal, AbortSignal>, ac: AbortController): void;
}
export type SignalMapToken = number | bigint | string | symbol;


export type Data =
	| FormData
	| ArrayBuffer
	| ArrayBufferView
	| object
	| Record<string, any>;

export interface Sender<T extends Record<string, any>, A extends any[], R> {
	(request: DotRequest<T, [], undefined>, ...args: A): R;
}
export type HeaderValue = number | string | undefined | null;
export interface RequestParams {
	method?: string;
	prefix?: string;
	path?: string;
	append: string[];
	suffix?: string;

	headers: Record<string, HeaderValue | (() => HeaderValue)>;

	params: Record<string, any>;
	query?: Record<string, any>;
	search?: string;
	data?: any;
	body?: any;
	type?: any;

	signal?: Signal | boolean;
	signalHandler?: SignalMapToken | SignalMap | ((v: any) => Signal);

	redirect: boolean | 'error';
}

export interface RequestData extends RequestParams {
	sender?: Sender<any, any, any>;
	fetch(
		request: Request,
		dotRequest: DotRequest<any, any, any>,
	): Promise<Response>;
	context: Record<string | symbol, any>,
}


export interface Result {
	readonly version: string;
	/** 获取文本格式的相应体 */
	text(): Promise<string>;
	/** 获取 Blob 格式的相应体 */
	blob(): Promise<Blob>;
	/** 获取 ArrayBuffer 格式的相应体 */
	arrayBuffer(): Promise<ArrayBuffer>;
	/** 获取 FormData 格式的相应体 */
	formData(): Promise<FormData>;
	/** 获取 JSON 格式的相应体 */
	json<T>(): Promise<T>;

	/** 获取状态码在 200-299 的相应结果 */
	ok(): Result;
	/** 复制相应结果 */
	clone(): Result;

	/** 对相应按照 Promise.then 的方式处理 */
	then<TResult1 = Response, TResult2 = never>(
		onfulfilled?:
			| ((value: Response) => TResult1 | PromiseLike<TResult1>)
			| undefined
			| null,
		onrejected?:
			| ((reason: any) => TResult2 | PromiseLike<TResult2>)
			| undefined
			| null
	): Promise<TResult1 | TResult2>;
	/** 对相应按照 Promise.catch 的方式处理 */
	catch<TResult = never>(
		onrejected?:
			| ((reason: any) => TResult | PromiseLike<TResult>)
			| undefined
			| null
	): Promise<Response | TResult>;
	/** 对相应按照 Promise.finally 的方式处理 */
	finally(onfinally?: (() => void) | undefined | null): Promise<Response>;

	/** 对相应按照类似 Promise.then 的方式处理，但仍返回相应结果 */
	do(
		handler?: ((v: Response) => any) | null,
		catcher?: ((v: any) => any) | null,
	): Result;
}

export interface Fetch<
	T extends Record<string, any>,
> {
	(
		request: Request,
		fetch: (
			request?: Request,
			dotRequest?: DotRequest<T, any[], any>,
		) => Promise<Response>,
		dotRequest: DotRequest<T, any[], any>,
	): PromiseLike<Response> | Response
}
export type Trans<T extends Record<string, any>, A extends any[], R, E>
	= E extends DotRequest<T, infer FA, infer FR>
		? unknown[] extends FA
			? unknown extends FR
				? DotRequest<T, A, R>
				: E
			: E
		: E;

export type DotRequest<
	T extends Record<string, any> = {},
	A extends any[] = [],
	R = unknown,
> = Api<T, A, R> & {
	[P in Exclude<keyof T, keyof Api<T, A, R>>]:
	T[P] extends (...a: infer FA) => infer FR
		? (...a: FA) => Trans<T, A, R, FR>
		: Trans<T, A, R, T[P]>;
};
export interface Api<
	T extends Record<string, any>,
	A extends any[],
	R,
> {
	readonly version: string;
	/**
	 * 设置请求方法
	 * @param method 请求方法
	 * @param path 新的路径，可选
	 */
	method(method: string, path?: string): this;
	/**
	 * 将请求方法设置为 `GET`
	 * @param path 新的路径，可选
	 */
	get(path?: string): this;
	/**
	 * 将请求方法设置为 `POST`
	 * @param path 新的路径，可选
	 */
	post(path?: string): this;
	/**
	 * 将请求方法设置为 `PUT`
	 * @param path 新的路径，可选
	 */
	put(path?: string): this;
	/**
	 * 将请求方法设置为 `DELETE`
	 * @param path 新的路径，可选
	 */
	delete(path?: string): this;
	/**
	 * 将请求方法设置为 `HEAD`
	 * @param path 新的路径，可选
	 */
	head(path?: string): this;
	/**
	 * 修改请求路径
	 * @param path 新的路径
	 */
	path(path: string): this;
	/**
	 * 修改请求路径前缀
	 * @param prefix 新的路径前缀
	 */
	prefix(prefix?: string): this;
	/**
	 * 修改请求路径后缀
	 * @param suffix 新的路径后缀
	 */
	suffix(suffix?: string): this;
	/**
	 * 在请求路径后追加新的路径
	 * @param path 追加的路径
	 */
	append(...path: string[]): this;
	/**
	 * 获取设置的请求头
	 * @param name 要获取的请求头名称
	 */
	header(name: string): HeaderValue | (() => HeaderValue);
	/**
	 * 设置一项请求头
	 * @param name 要设置的请求头名称
	 * @param value 要设置的请求头内容
	 */
	header(name: string, value: HeaderValue | (() => HeaderValue)): this;
	/**
	 * 设置请求头
	 * @param headers 要设置的请求头
	 */
	header(headers: Record<string, HeaderValue | (() => HeaderValue)>): this;
	/**
	 * 设置重定向模式
	 * @param redirect 重定向模式
	 * @enum `true` 自动重定向
	 * @enum `false` 不进行重定向
	 * @enum `'error'` 如果产生重定向将自动终止并且抛出一个错误
	*/
	redirect(redirect: boolean | 'error'): this;
	/**
	 * 获取重定向模式
	*/
	redirect(): boolean | 'error';
	/**
	 * 获取设置的上下文数据
	 * @param name 要获取的请求头名称
	 */
	context<T>(name: string): T;
	/**
	 * 设置一项上下文数据
	 * @param name 要设置的上下文数据名称
	 * @param value 要设置的上下文数据内容
	 */
	context(name: string, value: any): this;
	/**
	 * 设置上下文数据
	 * @param context 要设置的上下文数据
	 */
	context(context: Record<string, any>): this;

	/** 设置路径参数 */
	params(params?: Record<string, string | number>): this;
	/** 设置查询参数 */
	query(query?: Record<string, any>): this;
	/** 设置查询字符串 */
	search(search?: string): this;
	/** 设置请求数据 */
	data(data?: Record<string, any>): this;
	/** 设置请求身体 */
	body(
		body?:
			| ReadableStream
			| FormData
			| Blob
			| BufferSource
			| FormData
			| URLSearchParams
			| string
			| ArrayBuffer
			| ArrayBufferView,
		type?: string,
	): this;
	/** 设置请求身体 */
	body(body?: object | Record<string, any>): this;
	/** 设置请求身体 */
	form(form?: FormData | object | Record<string, any>): this;

	/** 设置中断信号 */
	signal(signal?: Signal): this;
	/** 设置中断信号处理函数 */
	signalHandler(
		handler?: SignalMapToken | SignalMap | ((v: any) => Signal) | boolean,
	): this;

	/** 设置请求方法 */
	interface(fetch: Fetch<T>): this;

	/** 创建对应的 Request 对象 */
	create(): Request;
	/** 发送请求并获取相应结果 */
	fetch(): Result;

	/** 发送请求，并获取状态码在 200-299 的相应结果 */
	ok(): Result;
	/** 发送请求，并获取文本格式的相应体 */
	text(): Promise<string>;
	/** 发送请求，并获取 Blob 格式的相应体 */
	blob(): Promise<Blob>;
	/** 发送请求，并获取 ArrayBuffer 格式的相应体 */
	arrayBuffer(): Promise<ArrayBuffer>;
	/** 发送请求，并获取 FormData 格式的相应体 */
	formData(): Promise<FormData>;
	/** 发送请求，并获取 JSON 格式的相应体 */
	json<T>(): Promise<T>;

	/** 设置发送处理函数，以供 send 方法使用 */
	sender<A extends any[], R>(sender: Sender<T, A, R>): DotRequest<T, A, R>;
	/** 用 sender 设置的处理函数 */
	send(...args: A): R;

	/** 发送请求并获取相应，并按照 Promise.then 的方式处理 */
	then<TResult1 = Response, TResult2 = never>(
		onfulfilled?:
			| ((value: Response) => TResult1 | PromiseLike<TResult1>)
			| undefined
			| null,
		onrejected?:
			| ((reason: any) => TResult2 | PromiseLike<TResult2>)
			| undefined
			| null,
	): Promise<TResult1 | TResult2>;
	/** 发送请求并获取相应，并按照 Promise.catch 的方式处理 */
	catch<TResult = never>(
		onrejected?:
			| ((reason: any) => TResult | PromiseLike<TResult>)
			| undefined
			| null,
	): Promise<Response | TResult>;
	/** 发送请求并获取相应，并按照 Promise.finally 的方式处理 */
	finally(
		onfinally?: (() => void) | undefined | null,
	): Promise<Response>;
}
export interface Options<T extends Record<string, any>> {
	fetch?: Fetch<T> | Fetch<T>[];
}
