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
export default function create(p, extend) {
	/**
	 * @template {keyof RequestData} K
	 * @param {Pick<RequestData, K>} np
	 * @returns {import('./types.mjs').Api<T, A, R>}
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
	 * 设置请求方法
	 * @param {string} method 请求方法
	 * @param {string} [path] 新的路径
	 * @returns {import('./types.mjs').Api<T, A, R>}
	 */
	function method(method, path) {
		if (path) {
			return init({ method, path, append: [] });
		}
		return init({ method });
	}
	/** @type {import('./types.mjs').Api<T, A, R>} */
	const api = {
		get version() { return '__VERSION__'; },
		method,
		/**
		 * 将请求方法设置为 `GET`
		 * @param path 新的路径，可选
		 * @param {string} [path] 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		get(path) { return method('get', path); },
		/**
		 * 将请求方法设置为 `POST`
		 * @param path 新的路径，可选
		 * @param {string} [path] 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		post(path) { return method('post', path); },
		/**
		 * 将请求方法设置为 `PUT`
		 * @param path 新的路径，可选
		 * @param {string} [path] 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		put(path) { return method('put', path); },
		/**
		 * 将请求方法设置为 `DELETE`
		 * @param path 新的路径，可选
		 * @param {string} [path] 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		delete(path) { return method('delete', path); },
		/**
		 * 将请求方法设置为 `HEAD`
		 * @param path 新的路径，可选
		 * @param {string} [path] 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		head(path) { return method('head', path); },
		/**
		 * 修改请求路径
		 * @param path 新的路径
		 * @param {string} path 新的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		path(path) { return init({ path, append: [] }); },
		/**
		 * 修改请求路径前缀
		 * @param {string} [prefix] 新的路径前缀
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		prefix(prefix) { return init({ prefix: prefix || '' }); },
		/**
		 * 修改请求路径后缀
		 * @param {string} [suffix] 新的路径后缀
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		suffix(suffix) { return init({ suffix: suffix || '' }); },
		/**
		 * 在请求路径后追加新的路径
		 * @param {...string} path 追加的路径
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		append(...path) { return init({ append: [...p.append, ...path] }); },
		/**
		 * 获取设置的请求头
		 * @overload
		 * @param {string} name 要获取的请求头名称
		 * @returns {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)}
		 */
		/**
		 * 设置一项请求头
		 * @overload
		 * @param {string} name 要设置的请求头名称
		 * @param {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)} value 要设置的请求头内容
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 设置请求头
		 * @overload
		 * @param {Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} headers 要设置的请求头
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 *
		 * @param {string | Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} name
		 * @param {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)} [value]
		 */
		header(name, value) {
			if (typeof name !== 'string') {
				return init({ headers: { ...p.headers, ...name } });
			}
			if (arguments.length < 2) { return p.headers[name]; }
			return init({ headers: { ...p.headers, [name]: value } });
		},
		/**
		 * 设置重定向模式
		 * @overload
		 * @param {boolean | 'error'} redirect 重定向模式
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取重定向模式
		 * @overload
		 * @returns {boolean | 'error'}
		 */
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
		 * 设置超时时间
		 * @overload
		 * @param {number} ms 超时时间，单位毫秒
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取设置的超时时间
		 * @overload
		 * @returns {number}
		 */
		/**
		 *
		 * @param {number} [t]
		 * @returns
		 */
		timeout(t) {
			if (!arguments.length) { return p.timeout || 0; }
			return init({ timeout: typeof t === 'number' && t > 0 ? t : 0 });
		},
		/**
		 * 设置浏览器对凭证信息的控制方式
		 * @overload
		 * @param {RequestCredentials?} credentials 操作方式
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取已设置浏览器对凭证信息的控制方式
		 * @overload
		 * @returns {RequestCredentials?}
		 */
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
		 * 设置请求模式
		 * @overload
		 * @param {RequestMode?} mode 请求模式
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取设置的请求模式
		 * @overload
		 * @returns {RequestMode?}
		 */
		/**
		 * @param {RequestMode?} [mode]
		 */
		mode(mode) {
			if (!arguments.length) { return p.mode || ''; }
			return init({ mode: typeof mode === 'string' && mode || null });
		},
		/**
		 * 设置缓存模式
		 * @overload
		 * @param {RequestCache?} cache 缓存模式
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取设置的缓存模式
		 * @overload
		 * @returns {RequestCache?}
		 */
		/**
		 * @param {RequestCache?} [cache]
		 */
		cache(cache) {
			if (!arguments.length) { return p.cache; }
			return init({ cache: typeof cache === 'string' && cache || null });
		},
		/**
		 * 指定请求头中 referrer 的模式
		 * @overload
		 * @param {string} referrer referrer 的模式
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取已设置的请求头中 referrer 的模式
		 * @overload
		 * @returns {string}
		 */
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
		 * @overload
		 * @param {ReferrerPolicy?} rp Referrer-Policy 值
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取已设置的请求头中 Referrer-Policy
		 * @overload
		 * @returns {ReferrerPolicy?}
		 */
		/**
		 * @param {ReferrerPolicy?} [rp] Referrer-Policy 值
		 */
		referrerPolicy(rp) {
			if (!arguments.length) { return p.referrerPolicy; }
			return init({
				referrerPolicy: typeof rp === 'string' && rp || null,
			});
		},
		/**
		 * 设置子资源完整性验证信息
		 * @overload
		 * @param {string} integrity
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取已设置的子资源完整性验证信息
		 * @overload
		 * @returns {string}
		 */
		/**
		 * @param {string} [integrity]
		 */
		integrity(integrity) {
			if (!arguments.length) { return p.integrity; }
			return init({
				integrity: typeof integrity === 'string' ? integrity : '',
			});
		},
		/**
		 * 设置在页面被关闭后，链接是否可以继续保持活跃
		 * @overload
		 * @param {boolean} keep
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 获取已设置的活跃配置
		 * @overload
		 * @returns {boolean}
		 */
		/**
		 * @param {boolean} [keep]
		 */
		keepalive(keep) {
			if (typeof keep !== 'boolean') { return p.keepalive || false; }
			return init({ keepalive: keep });
		},
		/**
		 * 获取设置的上下文数据
		 * @template V
		 * @overload
		 * @param {string} name 要获取的请求头名称
		 * @returns {V}
		 */
		/**
		 * 设置一项上下文数据
		 * @overload
		 * @param {string} name 要设置的上下文数据名称
		 * @param {*} value 要设置的上下文数据内容
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 设置上下文数据
		 * @overload
		 * @param {Record<string, any>} context 要设置的上下文数据
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
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

		/**
		 * 设置路径参数
		 * @param {Record<string, string | number>} [params]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		params(params) {
			if (!params) { return init({ params: {} }); }
			return init({ params: { ...p.params, ...params } });
		},
		/**
		 * 设置查询参数
		 * @param {Record<string, any>} [query]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		query(query) {
			if (!query) { return init({ query: {} }); }
			return init({ query: { ...p.query, ...query } });
		},
		/**
		 * 设置查询字符串
		 * @param {string} [search]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		search(search) { return init({ search }); },
		/**
		 * 设置请求数据
		 * @param {Record<string, any>} [data]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		data(data) { return init({ data }); },
		/**
		 * 设置请求身体
		 * @overload
		 * @param {import('./types.mjs').BodyData} [body]
		 * @param {string} [type]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 设置请求身体
		 * @overload
		 * @param {object | Record<string, any>} [body]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		/**
		 * 设置请求身体
		 * @param {*} [body]
		 * @param {string} [type]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		body(body, type) { return init({ body, type }); },
		/**
		 * 设置请求身体
		 * @param {FormData | object | Record<string, any>} [form]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		form(form) { return init({ body: form, type: true }); },

		/**
		 * 设置中断信号
		 * @param {import('./types.mjs').Signal} [signal]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		signal(signal) { return init({ signal: signal || null }); },
		/**
		 * 设置中断信号处理函数
		 * @param {import('./types.mjs').SignalHandler | boolean} [handler]
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		signalHandler(handler) {
			if (typeof handler === 'boolean') {
				return init({
					signalHandler: handler ? createSignalMap() : null,
				});
			}
			return init({ signalHandler: handler || null });
		},

		/**
		 * 设置请求方法
		 * @param {import('./types.mjs').Fetch<T>} fetch
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		interface(fetch) {
			return init({ fetch: createFetch(fetch, p.fetch) });
		},
		/**
		 * 设置上传进度监听
		 * @param {import('./types.mjs').ProgressListener} up
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		uploadProgress(up) {
			return init({ uploadProgress: typeof up === 'function' ? up : null });
		},
		/**
		 * 设置下载进度监听
		 * @param {import('./types.mjs').ProgressListener} dp
		 * @returns {import('./types.mjs').Api<T, A, R>}
		 */
		downloadProgress(dp) {
			return init({ downloadProgress: typeof dp === 'function' ? dp : null });
		},
		/**
		 * 创建对应的 Request 对象
		 * @returns {Request}
		*/
		create() { return createRequest(p); },
		/** 发送请求并获取相应结果 */
		fetch,

		/**
		 * 发送请求，并获取状态码在 200-299 的相应结果
		 * @returns {import('./types.mjs').Result}
		 */
		ok() { return fetch().ok(); },
		/**
		 * 发送请求，并获取文本格式的相应体
		 * @returns {Promise<string>}
		 */
		text() { return fetch().ok().text(); },
		/**
		 * 发送请求，并获取 Blob 格式的相应体
		 * @returns {Promise<Blob>}
		 */
		blob() { return fetch().ok().blob(); },
		/**
		 * 发送请求，并获取 ArrayBuffer 格式的相应体
		 * @returns {Promise<ArrayBuffer>}
		 */
		arrayBuffer() { return fetch().ok().arrayBuffer(); },
		/**
		 * 发送请求，并获取 FormData 格式的相应体
		 * @returns {Promise<FormData>}
		 */
		formData() { return fetch().ok().formData(); },
		/**
		 * 发送请求，并获取 JSON 格式的相应体
		 * @template T
		 * @returns {Promise<T>}
		 */
		json() { return fetch().ok().json(); },
		/**
		 * 发送请求，并获取相应流
		 * @returns {Promise<ReadableStream<Uint8Array> | null>}
		 */
		stream() { return fetch().ok().stream(); },
		/**
		 * 设置发送处理函数，以供 send 方法使用
		 * @template {any[]} A
		 * @template R
		 * @param {import('./types.mjs').Sender<T,A,R>} sender
		 * @returns {import('./types.mjs').DotRequest<T, A, R>}
		 */
		sender(sender) { return /** @type {*} */(init({ sender })); },
		/**
		 * 用 sender 设置的处理函数
		 * @param  {A} args
		 * @returns {R}
		 */
		send(...args) {
			const { sender } = p;
			// @ts-ignore
			if (typeof sender !== 'function') { return; }
			return sender(init({ sender: null }), ...args);
		},

		/**
		 * 发送请求并获取相应，并按照 Promise.then 的方式处理
		 * @template [TResult1=Response]
		 * @template [TResult2=never]
		 * @param {((value: Response) => TResult1 | PromiseLike<TResult1>)?} [fulfilled]
		 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>)?} [rejected]
		 * @returns {Promise<TResult1 | TResult2>}
		 */
		then(fulfilled, rejected) { return fetch().then(fulfilled, rejected); },
		/**
		 * 发送请求并获取相应，并按照 Promise.catch 的方式处理
		 * @template [TResult=never]
		 * @param {((reason: any) => TResult | PromiseLike<TResult>)?} [onrejected]
		 * @returns {Promise<Response | TResult>}
		 */
		catch(onrejected) { return fetch().catch(onrejected); },
		/**
		 * 发送请求并获取相应，并按照 Promise.finally 的方式处理
		 * @param {(() => void)?} onfinally
		 * @returns {Promise<Response>}
		 */
		finally(onfinally) { return fetch().finally(onfinally); },
	};
	for (const [key, d] of extend) {
		if (key in api) { continue; }
		Reflect.defineProperty(api, key, d);
	}
	return /** @type {import('./types.mjs').DotRequest<T, A, R>} */ (api);

}
