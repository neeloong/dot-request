import StatisticsStream from './StatisticsStream.mts';
import type { DotRequest } from './DotRequest.mts';

export class Result {
	#response: Promise<Response>;
	constructor(response: Promise<Response>) {
		this.#response = response;
	}
	get version() { return '__VERSION__'; }
	build(response: Promise<Response>): Result {
		return new Result(response);
	}
	#parseJSON: ((value: string) => any) | null = null;
	/** 设置JSON解析函数 */
	parseJSON(fn: ((value: string) => any) | null): this {
		this.#parseJSON = typeof fn === 'function' ? fn : null;
		return this;
	}
	/** 获取文本格式的相应体 */
	text(): Promise<string> {
		return this.#response.then(r => r.text());
	}
	/** 获取 Blob 格式的相应体 */
	blob(): Promise<Blob> {
		return this.#response.then(r => r.blob());
	}
	/** 获取 ArrayBuffer 格式的相应体 */
	arrayBuffer(): Promise<ArrayBuffer> {
		return this.#response.then(r => r.arrayBuffer());
	}
	/** 获取 FormData 格式的相应体 */
	formData(): Promise<FormData> {
		return this.#response.then(r => r.formData());
	}
	/** 获取 JSON 格式的相应体 */
	json<T>(
		reviver?: (this: any, key: string, value: any) => any,
	): Promise<T> {
		return this.#response.then(r => r.text()).then(r => {
			const parseJSON = this.#parseJSON;
			if (typeof parseJSON === 'function') { return parseJSON(r); }
			if (typeof reviver !== 'function') { return JSON.parse(r); }
			return JSON.parse(r, reviver);
		});
	}
	/** 获取 UrlSearchParams 格式的相应体 */
	searchParams(): Promise<URLSearchParams> {
		return this.#response.then(r => r.text())
			.then(t => new URLSearchParams(t));
	}
	/** 获取相应流 */
	stream(): Promise<ReadableStream<Uint8Array> | null> {
		return this.#response.then(r => r.body);
	}
	/** 根据 Content-Type 相应头获取对应格式的相应体 */
	result<T>(): Promise<T | null> {
		return this.#response.then(r => {
			const type = r.headers.get('content-type');
			if (!type) { return null; }
			const [mime] = type.replace(/\s/g, '').split(';', 1);
			if (mime === 'multipart/form-data') {
				return r.formData();
			}
			if (mime === 'text/plain') {
				return r.text();
			}
			if (mime === 'application/json' || mime === 'text/json') {
				return r.text().then(r => {
					const parseJSON = this.#parseJSON;
					if (typeof parseJSON === 'function') { return parseJSON(r); }
					return JSON.parse(r);
				});
			}
			if (mime === 'application/x-www-form-urlencoded') {
				return r.text().then(t => new URLSearchParams(t));
			}

		});
	}
	/** 返回自定义结果 */
	done<T>(value: T): Promise<T>;
	/** 结束但不返回结果 */
	done(): Promise<void> 
	/** 返回自定义结果 */
	done(value?: unknown): Promise<unknown>
	done(value?: unknown): Promise<unknown> {
		return this.#response.then(() => value);
	}

	/** 获取状态码在 200-299 的相应结果 */
	ok(error?: DotRequest.ErrorHandler | null): this {
		this.#response = this.#response.then(v => {
			if (v.ok) { return v; }
			if (typeof error !== 'function') { return Promise.reject(v); }
			return Promise.resolve(error(v)).then(v => Promise.reject(v));
		});
		return this;
	}
	/** 复制相应结果 */
	clone<T extends Result>(target: T): T;
	/** 复制相应结果 */
	clone<T>(): ReturnType<this['build']>
	/** 复制相应结果 */
	clone<T extends Result>(target?: T): ReturnType<this['build']> | T;
	clone<T extends Result>(target?: T): ReturnType<this['build']> | T {
		const api = target instanceof Result
			? target
			: this.build(this.#response.then(r => r.clone()));
		if (api !== this) {
			api.#parseJSON = this.#parseJSON;
		}
		// @ts-ignore
		return api;
	}

	/** 对相应按照 Promise.then 的方式处理 */
	then<TResult1 = Response, TResult2 = never>(
		fulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | null,
		rejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this.#response.then(fulfilled, rejected);
	}
	/** 对相应按照 Promise.catch 的方式处理 */
	catch<TResult = never>(
		onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
	): Promise<Response | TResult> {
		return this.#response.catch(onrejected);
	}
	/** 对相应按照 Promise.finally 的方式处理 */
	finally(onfinally: (() => void) | null): Promise<Response> {
		return this.#response.finally(onfinally);
		
	}
	/** 对相应按照类似 Promise.then 的方式处理，但仍返回相应结果 */
	do(
		handler: ((v: Response) => any) | null,
		catcher: ((v: any) => any) | null,
	): this {
		this.#response = this.#response.then(async e => {
			if (typeof handler === 'function') {
				await handler(e);
			}
			return e;
		}, async e => {
			if (typeof catcher === 'function') {
				await catcher(e);
			}
			throw e;
		});
		return this;
	}
	/** 设置下载进度监听 */
	downloadProgress(dp: DotRequest.ProgressListener): this {
		this.#response = this.#response.then(r => {
			const totalN = Number(r.headers.get('Context-Length'));
			const total = totalN >= 0 ? totalN : -1;
			return new Response(
				r.body?.pipeThrough(new StatisticsStream(p => dp(p, total))),
				r,
			);
		});
		return this;
	}
}
