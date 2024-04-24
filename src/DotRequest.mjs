import { Result } from './Result.mjs';
import createFetch from './createFetch.mjs';
import createRequest from './createRequest/index.mjs';
import createSignalMap from './createSignalMap.mjs';

/** @type {(request: Request, dotRequest: import('./DotRequest.mjs').DotRequest) => Promise<Response>} */
const defaultFetch = r => fetch(r);
class DotRequest {
	/**
	 * @param {object} options
	 * @param {import('./types.mjs').Fetch | import('./types.mjs').Fetch[]} [options.fetch]
	 * @returns {DotRequest}
	 */
	static create({ fetch }) {
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
	static get Result() { return Result; }
	/** @type {import('./createRequest/index.mjs').RequestParams} */
	#options = {
		prefix: '',
		path: '',
		append: [],
		suffix: '',

		headers: {},
		query: {},
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
	};
	#fetch = defaultFetch;
	/** @type {Record<string | symbol, any>} */
	#context = {};
	/** @type {import('./types.mjs').ProgressListener?} */
	#downloadProgress = null;
	/** @type {import('./types.mjs').ErrorHandler?} */
	#errorHandler = null;
	get version() { return '__VERSION__'; }
	/**
	 * @returns {DotRequest}
	 */
	build() {
		return new DotRequest();
	}
	/**
	 * @template {DotRequest} T
	 * @overload
	 * @param {T} target
	 * @returns {T}
	 */
	/**
	 * @overload
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * @template {DotRequest} T
	 * @param {T} [target]
	 * @returns {ReturnType<this['build']> | T}
	 */
	clone(target) {
		const api = target instanceof DotRequest ? target : this.build();
		if (api !== this) {
			api.#options = { ...this.#options };
			api.#fetch = this.#fetch;
			api.#context = this.#context;
			api.#downloadProgress = this.#downloadProgress;
			api.#errorHandler = this.#errorHandler;
		}
		// @ts-ignore
		return api;
	}
	/**
	 * @template {keyof import('./createRequest/index.mjs').RequestParams} K
	 * @param {Pick<import('./createRequest/index.mjs').RequestParams, K>} np
	 * @returns {ReturnType<this['build']>}
	 */
	#build(np) {
		const api = this.clone();
		Object.assign(api.#options, np);
		return api;
	}
	/**
	 * 设置请求方法
	 * @param {string} method 请求方法
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	method(method, path) {
		if (path) {
			return this.#build({ method, path, append: [] });
		}
		return this.#build({ method });
	}
	/**
	 * 将请求方法设置为 `GET`
	 * @param path 新的路径，可选
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	get(path) { return this.method('get', path); }
	/**
	 * 将请求方法设置为 `POST`
	 * @param path 新的路径，可选
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	post(path) { return this.method('post', path); }
	/**
	 * 将请求方法设置为 `PUT`
	 * @param path 新的路径，可选
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	put(path) { return this.method('put', path); }
	/**
	 * 将请求方法设置为 `DELETE`
	 * @param path 新的路径，可选
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	delete(path) { return this.method('delete', path); }
	/**
	 * 将请求方法设置为 `HEAD`
	 * @param path 新的路径，可选
	 * @param {string} [path] 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	head(path) { return this.method('head', path); }
	/**
	 * 修改请求路径
	 * @param path 新的路径
	 * @param {string} path 新的路径
	 * @returns {ReturnType<this['build']>}
	 */
	path(path) { return this.#build({ path, append: [] }); }
	/**
	 * 修改请求路径前缀
	 * @param {string} [prefix] 新的路径前缀
	 * @returns {ReturnType<this['build']>}
	 */
	prefix(prefix) { return this.#build({ prefix: prefix || '' }); }
	/**
	 * 修改请求路径后缀
	 * @param {string} [suffix] 新的路径后缀
	 * @returns {ReturnType<this['build']>}
	 */
	suffix(suffix) { return this.#build({ suffix: suffix || '' }); }
	/**
	 * 在请求路径后追加新的路径
	 * @param {...string} path 追加的路径
	 * @returns {ReturnType<this['build']>}
	 */
	append(...path) {
		return this.#build({ append: [...this.#options.append, ...path] });
	}
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
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * 设置请求头
	 * @overload
	 * @param {Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} headers 要设置的请求头
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 *
	 * @param {string | Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} name
	 * @param {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)} [value]
	 */
	header(name, value) {
		const {headers} = this.#options;
		if (typeof name !== 'string') {
			return this.#build({ headers: { ...headers, ...name } });
		}
		if (arguments.length < 2) { return headers[name]; }
		return this.#build({ headers: { ...headers, [name]: value } });
	}
	/**
	 * 设置重定向模式
	 * @overload
	 * @param {boolean | 'error'} redirect 重定向模式
	 * @returns {ReturnType<this['build']>}
	 * @description true 自动重定向
	 * @description false 不进行重定向
	 * @description 'error' 如果产生重定向将自动终止并且抛出一个错误
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
		if (!arguments.length) { return this.#options.redirect; }
		return this.#build({
			redirect: typeof redirect === 'boolean' ? redirect : 'error',
		});
	}
	/**
	 * 设置超时时间
	 * @overload
	 * @param {number} ms 超时时间，单位毫秒
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.timeout || 0; }
		return this.#build({ timeout: typeof t === 'number' && t > 0 ? t : 0 });
	}
	/**
	 * 设置浏览器对凭证信息的控制方式
	 * @overload
	 * @param {RequestCredentials?} credentials 操作方式
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.credentials; }
		return this.#build({
			credentials: typeof credentials === 'string' && credentials || null,
		});
	}
	/**
	 * 设置请求模式
	 * @overload
	 * @param {RequestMode?} mode 请求模式
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * 获取设置的请求模式
	 * @overload
	 * @returns {RequestMode?}
	 */
	/**
	 * @param {RequestMode?} [mode]
	 * @returns {ReturnType<this['build']> | RequestMode?}
	 */
	mode(mode) {
		// @ts-ignore
		if (!arguments.length) { return this.#options.mode || ''; }
		return this.#build({ mode: typeof mode === 'string' && mode || null });
	}
	/**
	 * 设置缓存模式
	 * @overload
	 * @param {RequestCache?} cache 缓存模式
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.cache; }
		return this.#build({ cache: typeof cache === 'string' && cache || null });
	}
	/**
	 * 指定请求头中 referrer 的模式
	 * @overload
	 * @param {string} referrer referrer 的模式
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.referrer; }
		return this.#build({
			referrer: typeof referrer === 'string' ? referrer : '',
		});
	}
	/**
	 * 设置请求头中 Referrer-Policy
	 * @overload
	 * @param {ReferrerPolicy?} rp Referrer-Policy 值
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.referrerPolicy; }
		return this.#build({
			referrerPolicy: typeof rp === 'string' && rp || null,
		});
	}
	/**
	 * 设置子资源完整性验证信息
	 * @overload
	 * @param {string} integrity
	 * @returns {ReturnType<this['build']>}
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
		if (!arguments.length) { return this.#options.integrity; }
		return this.#build({
			integrity: typeof integrity === 'string' ? integrity : '',
		});
	}
	/**
	 * 设置在页面被关闭后，链接是否可以继续保持活跃
	 * @overload
	 * @param {boolean} keep
	 * @returns {ReturnType<this['build']>}
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
		if (typeof keep !== 'boolean') { return this.#options.keepalive || false; }
		return this.#build({ keepalive: keep });
	}
	/**
	 * 获取设置的上下文数据
	 * @template V
	 * @overload
	 * @param {string | symbol} name 要获取的请求头名称
	 * @returns {V}
	 */
	/**
	 * 设置一项上下文数据
	 * @overload
	 * @param {string | symbol} name 要设置的上下文数据名称
	 * @param {*} value 要设置的上下文数据内容
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * 设置上下文数据
	 * @overload
	 * @param {Record<string, any>} context 要设置的上下文数据
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * @param {string | symbol | Record<string, any>} name
	 * @param {*} [value]
	 */
	context(name, value) {
		const context = this.#context;
		if (typeof name !== 'string' && typeof name !== 'symbol') {
			const api = this.clone();
			api.#context = { ...context, ...name };
			return api;
		}
		if (arguments.length < 2) { return context[name]; }
		const api = this.clone();
		api.#context = { ...context, [name]: value };
		return api;
	}

	/**
	 * 设置路径参数
	 * @param {Record<string, string | number>} [params]
	 * @returns {ReturnType<this['build']>}
	 */
	params(params) {
		if (!params) { return this.#build({ params: {} }); }
		return this.#build({ params: { ...this.#options.params, ...params } });
	}
	/**
	 * 设置查询参数
	 * @param {Record<string, any>} [query]
	 * @returns {ReturnType<this['build']>}
	 */
	query(query) {
		if (!query) { return this.#build({ query: {} }); }
		return this.#build({ query: { ...this.#options.query, ...query } });
	}
	/**
	 * 设置查询字符串
	 * @param {string} [search]
	 * @returns {ReturnType<this['build']>}
	 */
	search(search) { return this.#build({ search }); }
	/**
	 * 设置请求数据
	 * @param {Record<string, any>} [data]
	 * @returns {ReturnType<this['build']>}
	 */
	data(data) { return this.#build({ data }); }
	/**
	 * 设置请求身体
	 * @overload
	 * @param {import('./types.mjs').BodyData} [body]
	 * @param {string} [type]
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * 设置请求身体
	 * @overload
	 * @param {object | Record<string, any>} [body]
	 * @returns {ReturnType<this['build']>}
	 */
	/**
	 * 设置请求身体
	 * @param {*} [body]
	 * @param {string} [type]
	 * @returns {ReturnType<this['build']>}
	 */
	body(body, type) { return this.#build({ body, type }); }
	/**
	 * 设置请求身体
	 * @param {FormData | object | Record<string, any>} [form]
	 * @returns {ReturnType<this['build']>}
	 */
	form(form) { return this.#build({ body: form, type: true }); }

	/**
	 * 设置中断信号
	 * @param {import('./types.mjs').Signal} [signal]
	 * @returns {ReturnType<this['build']>}
	 */
	signal(signal) { return this.#build({ signal: signal || null }); }
	/**
	 * 设置中断信号处理函数
	 * @param {import('./types.mjs').SignalHandler | boolean} [handler]
	 * @returns {ReturnType<this['build']>}
	 */
	signalHandler(handler) {
		return this.#build({
			signalHandler: handler === true ? createSignalMap() : handler || null,
		});
	}

	/**
	 * 设置请求方法
	 * @param {import('./types.mjs').Fetch} fetch
	 * @returns {ReturnType<this['build']>}
	 */
	interface(fetch) {
		const api = this.clone();
		api.#fetch = createFetch(fetch, this.#fetch);
		return api;
	}
	/**
	 * 设置上传进度监听
	 * @param {import('./types.mjs').ProgressListener} up
	 * @returns {ReturnType<this['build']>}
	 */
	uploadProgress(up) {
		return this.#build({
			uploadProgress: typeof up === 'function' ? up : null,
		});
	}
	/**
	 * 设置下载进度监听
	 * @param {import('./types.mjs').ProgressListener?} dp
	 * @returns {ReturnType<this['build']>}
	 */
	downloadProgress(dp) {
		const api = this.clone();
		api.#downloadProgress = typeof dp === 'function' ? dp : null;
		return api;
	}
	/**
	 * 设置异常相应处理函数
	 * @param {import('./types.mjs').ErrorHandler?} eh
	 * @returns {ReturnType<this['build']>}
	 */
	errorHandler(eh) {
		const api = this.clone();
		api.#errorHandler = typeof eh === 'function' ? eh : null;
		return api;
	}
	/**
	 * 创建对应的 Request 对象
	 * @returns {Request}
		*/
	create() { return createRequest(this.#options); }
	/**
	 * 发送请求并获取相应结果
	 * @returns {import('./Result.mjs').Result}
	 */
	fetch() {
		const dotRequest = this.clone();
		const response = this.#fetch(this.create(), dotRequest);
		let res = new Result(response);
		const dp = this.#downloadProgress;
		if (dp) { res = res.downloadProgress(dp); }
		const eh = this.#errorHandler;
		if (eh) { res = res.ok(eh); }
		return res;
	}

	/**
	 * 发送请求，并获取状态码在 200-299 的相应结果
	 * @param {import('./types.mjs').ErrorHandler?} [error]
	 * @returns {import('./Result.mjs').Result}
	 */
	ok(error) { return this.fetch().ok(error); }
	/**
	 * 发送请求，并获取文本格式的相应体
	 * @returns {Promise<string>}
	 */
	text() { return this.fetch().ok().text(); }
	/**
	 * 发送请求，并获取 Blob 格式的相应体
	 * @returns {Promise<Blob>}
	 */
	blob() { return this.fetch().ok().blob(); }
	/**
	 * 发送请求，并获取 ArrayBuffer 格式的相应体
	 * @returns {Promise<ArrayBuffer>}
	 */
	arrayBuffer() { return this.fetch().ok().arrayBuffer(); }
	/**
	 * 发送请求，并获取 FormData 格式的相应体
	 * @returns {Promise<FormData>}
	 */
	formData() { return this.fetch().ok().formData(); }
	/**
	 * 发送请求，并获取 JSON 格式的相应体
	 * @template T
	 * @returns {Promise<T>}
	 */
	json() { return this.fetch().ok().json(); }
	/**
	 * 发送请求，并获取 UrlSearchParams 格式的相应体
	 * @returns {Promise<URLSearchParams>}
	 */
	searchParams() { return this.fetch().ok().searchParams(); }
	/**
	 * 发送请求，并获取相应流
	 * @returns {Promise<ReadableStream<Uint8Array> | null>}
	 */
	stream() { return this.fetch().ok().stream(); }
	/**
	 * 发送请求，并根据 Content-Type 相应头获取对应格式的相应体
	 * @template T
	 * @returns {Promise<T | null>}
	 */
	result() { return this.fetch().ok().result(); }
	/**
	 * 发送请求，并返回自定义结果
	 * @template [T=void]
	 * @overload
	 * @param {T} value
	 * @returns {Promise<T>}
	 */
	/**
	 * 发送请求，但不返回结果
	 * @overload
	 * @returns {Promise<void>}
	 */
	/**
	 * @param {unknown} [value]
	 * @returns {Promise<unknown>}
	 */
	done(value) { return this.fetch().ok().done(value); }

	/**
	 * 发送请求并获取相应，并按照 Promise.then 的方式处理
	 * @template [TResult1=Response]
	 * @template [TResult2=never]
	 * @param {((value: Response) => TResult1 | PromiseLike<TResult1>)?} [fulfilled]
	 * @param {((reason: any) => TResult2 | PromiseLike<TResult2>)?} [rejected]
	 * @returns {Promise<TResult1 | TResult2>}
	 */
	then(fulfilled, rejected) { return this.fetch().then(fulfilled, rejected); }
	/**
	 * 发送请求并获取相应，并按照 Promise.catch 的方式处理
	 * @template [TResult=never]
	 * @param {((reason: any) => TResult | PromiseLike<TResult>)?} [onrejected]
	 * @returns {Promise<Response | TResult>}
	 */
	catch(onrejected) { return this.fetch().catch(onrejected); }
	/**
	 * 发送请求并获取相应，并按照 Promise.finally 的方式处理
	 * @param {(() => void)?} onfinally
	 * @returns {Promise<Response>}
	 */
	finally(onfinally) { return this.fetch().finally(onfinally); }
}
export { DotRequest };
