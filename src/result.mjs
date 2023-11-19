import StatisticsStream from './StatisticsStream.mjs';

/**
 *
 * @param {Promise<Response>} response
 * @returns {import('./types.mjs').Result}
 */
export default function result(response) {
	return {
		get version() { return '__VERSION__'; },
		/**
		 * 获取文本格式的相应体
		 * @returns {Promise<string>}
		 */
		text() { return response.then(r => r.text()); },
		/**
		 * 获取 Blob 格式的相应体
		 * @returns {Promise<Blob>}
		 */
		blob() { return response.then(r => r.blob()); },
		/**
		 * 获取 ArrayBuffer 格式的相应体
		 * @returns {Promise<ArrayBuffer>}
		 */
		arrayBuffer() { return response.then(r => r.arrayBuffer()); },
		/**
		 * 获取 FormData 格式的相应体
		 * @returns {Promise<FormData>}
		 */
		formData() { return response.then(r => r.formData()); },
		/**
		 * 获取 JSON 格式的相应体
		 * @template T
		 * @returns {Promise<T>}
		 */
		json() { return response.then(r => r.json()); },
		/**
		 * 获取相应流
		 * @returns {Promise<ReadableStream<Uint8Array> | null>}
		 */
		stream() { return response.then(r => r.body); },

		/**
		 * 获取状态码在 200-299 的相应结果
		 * @returns {import('./types.mjs').Result}
		 */
		ok() {
			return result(response.then( v =>v.ok ? v : Promise.reject(v)));
		},
		/**
		 * 复制相应结果
		 * @returns {import('./types.mjs').Result}
		 */
		clone() { return result(response.then(r => r.clone())); },

		/**
		 * 对相应按照 Promise.then 的方式处理
		 * @template [TResult1=Response]
		 * @template [TResult2=never]
		 * @param {((value: Response) => TResult1 | PromiseLike<TResult1>)?} [fulfilled]
		 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>)?} [rejected]
		 * @returns {Promise<TResult1 | TResult2>}
		 */
		then(fulfilled, rejected) { return response.then(fulfilled, rejected); },
		/**
		 * 对相应按照 Promise.catch 的方式处理
		 * @template [TResult=never]
		 * @param {((reason: any) => TResult | PromiseLike<TResult>)?} [onrejected]
		 * @returns {Promise<Response | TResult>}
		 */
		catch(onrejected) { return response.catch(onrejected); },
		/**
		 * 对相应按照 Promise.finally 的方式处理
		 * @param {(() => void)?} onfinally
		 * @returns {Promise<Response>}
		 */
		finally(onfinally) { return response.finally(onfinally); },

		/**
		 * 对相应按照类似 Promise.then 的方式处理，但仍返回相应结果
		 * @param {((v: Response) => any)?} handler
		 * @param {((v: any) => any)?} catcher
		 * @returns {import('./types.mjs').Result}
		 */
		do(handler, catcher) {
			return result(response.then(async e => {
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
		},
		/**
		 * 设置下载进度监听
		 * @param {import('./types.mjs').ProgressListener} dp
		 * @returns {import('./types.mjs').Result}
		 */
		downloadProgress(dp) {
			return result(response.then(r => {
				const totalN = Number(r.headers.get('Context-Length'));
				const total = totalN >= 0 ? totalN : -1;
				return new Response(
					r.body?.pipeThrough(new StatisticsStream(p => dp(p, total))),
					r,
				);
			}));
		},
	};
}
