import type DotRequest from '.';

export type Method = 'get' | 'post' | 'put' | 'delete' | 'head';
export type Signal = AbortSignal | symbol | object | Record<string, any>;
export type Data = FormData | ArrayBuffer | ArrayBufferView | object | Record<string, any>;


export interface RequestParams {
	method?: Method;
	path?: string;
	root?: string;
	append?: string[];

	headers?: Record<string, string | undefined | null | (() => string | undefined | null)>;

	params?: Record<string, any>;
	query?: Record<string, any>;
	search?: string;
	data?:any;
	body?:any;
	type?: any;

	signal?: Signal | boolean;
	signalHandler?: Signal | ((v: any) => Signal);
}

export interface RequestData extends RequestParams {
	handlers?: ((v: Response) => any)[];
	catchers?: ((v: any) => any)[];
	fetch?(request: Request): Promise<Response> | Response;
}
export interface Result<T, R extends DotRequest<T>> {
	text(): Promise<string>;
	blob(): Promise<Blob>;
	arrayBuffer(): Promise<ArrayBuffer>;
	formData(): Promise<FormData>;
	json<V = T>(): Promise<V>;

	ok(): Result<T, R>;
	clone(): Result<T, R>;
	copy(): R;

	then<TResult1 = Response, TResult2 = never>(
		onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
	): Promise<TResult1 | TResult2>;
	catch<TResult = never>(
		onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
	): Promise<Response | TResult>;
	finally(onfinally?: (() => void) | undefined | null): Result<T, R>

	do(handler?: ((v: Response) => any) | null, catcher?: ((v: any) => any) | null): Result<T, R>;
}
