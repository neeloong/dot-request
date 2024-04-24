import StatisticsStream from './StatisticsStream.mjs';

export class Result {
	/** @type {Promise<Response>} */
	#response;
	/**
	 *
	 * @param {Promise<Response>} response
	 */
	constructor(response) {
		this.#response = response;
	}
	get version() { return '__VERSION__'; }
	/**
	 * 获取文本格式的相应体
	 * @returns {Promise<string>}
	 */
	text() { return this.#response.then(r => r.text()); }
	/**
	 * 获取 Blob 格式的相应体
	 * @returns {Promise<Blob>}
	 */
	blob() { return this.#response.then(r => r.blob()); }
	/**
	 * 获取 ArrayBuffer 格式的相应体
	 * @returns {Promise<ArrayBuffer>}
	 */
	arrayBuffer() { return this.#response.then(r => r.arrayBuffer()); }
	/**
	 * 获取 FormData 格式的相应体
	 * @returns {Promise<FormData>}
	 */
	formData() { return this.#response.then(r => r.formData()); }
	/**
	 * 获取 JSON 格式的相应体
	 * @template T
	 * @returns {Promise<T>}
	 */
	json() { return this.#response.then(r => r.json()); }
	/**
	 * 获取 UrlSearchParams 格式的相应体
	 * @returns {Promise<URLSearchParams>}
	 */
	searchParams() {
		return this.#response.then(r => r.text())
			.then(t => new URLSearchParams(t));
	}
	/**
	 * 获取相应流
	 * @returns {Promise<ReadableStream<Uint8Array> | null>}
	 */
	stream() { return this.#response.then(r => r.body); }
	/**
	 * 根据 Content-Type 相应头获取对应格式的相应体
	 * @template T
	 * @returns {Promise<T | null>}
	 */
	result() {
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
				return r.json();
			}
			if (mime === 'application/x-www-form-urlencoded') {
				return r.text().then(t => new URLSearchParams(t));
			}

		});
	}
	/**
	 * 返回自定义结果
	 * @template [T=void]
	 * @overload
	 * @param {T} value
	 * @returns {Promise<T>}
	 */
	/**
	 * 结束但不返回结果
	 * @overload
	 * @returns {Promise<void>}
	 */
	/**
	 * @param {unknown} [value]
	 * @returns {Promise<unknown>}
	 */
	done(value) {
		return this.#response.then(() => value);
	}

	/**
	 * 获取状态码在 200-299 的相应结果
	 * @param {import('./types.mjs').ErrorHandler?} [error]
	 * @returns {Result}
	 */
	ok(error) {
		return new Result(this.#response.then(v => {
			if (v.ok) { return v; }
			if (typeof error !== 'function') { return Promise.reject(v); }
			return Promise.resolve(error(v)).then(v => Promise.reject(v));
		}));
	}
	/**
	 * 复制相应结果
	 * @returns {Result}
	 */
	clone() { return new Result(this.#response.then(r => r.clone())); }

	/**
	 * 对相应按照 Promise.then 的方式处理
	 * @template [TResult1=Response]
	 * @template [TResult2=never]
	 * @param {((value: Response) => TResult1 | PromiseLike<TResult1>)?} [fulfilled]
	 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>)?} [rejected]
	 * @returns {Promise<TResult1 | TResult2>}
	 */
	then(fulfilled, rejected) {
		return this.#response.then(fulfilled, rejected);
	}
	/**
	 * 对相应按照 Promise.catch 的方式处理
	 * @template [TResult=never]
	 * @param {((reason: any) => TResult | PromiseLike<TResult>)?} [onrejected]
	 * @returns {Promise<Response | TResult>}
	 */
	catch(onrejected) { return this.#response.catch(onrejected); }
	/**
	 * 对相应按照 Promise.finally 的方式处理
	 * @param {(() => void)?} onfinally
	 * @returns {Promise<Response>}
	 */
	finally(onfinally) { return this.#response.finally(onfinally); }

	/**
	 * 对相应按照类似 Promise.then 的方式处理，但仍返回相应结果
	 * @param {((v: Response) => any)?} handler
	 * @param {((v: any) => any)?} catcher
	 * @returns {Result}
	 */
	do(handler, catcher) {
		return new Result(this.#response.then(async e => {
			if (typeof handler === 'function') {
				await handler(e);
			}
			return e;
		}, async e => {
			if (typeof catcher === 'function') {
				await catcher(e);
			}
			throw e;
		}));
	}
	/**
	 * 设置下载进度监听
	 * @param {import('./types.mjs').ProgressListener} dp
	 * @returns {Result}
	 */
	downloadProgress(dp) {
		return new Result(this.#response.then(r => {
			const totalN = Number(r.headers.get('Context-Length'));
			const total = totalN >= 0 ? totalN : -1;
			return new Response(
				r.body?.pipeThrough(new StatisticsStream(p => dp(p, total))),
				r,
			);
		}));
	}
}
