import { Result } from './Result.mjs';
import createFetch from './createFetch.mjs';
import createRequest from './createRequest/index.mjs';
import createSignalMap from './createSignalMap.mjs';


/**
 *
 * @param {string | TemplateStringsArray | undefined} template
 * @param  {...any} values
 * @returns
 */
function toString(template, ...values) {
	if (!template) { return ''; }
	if (typeof template === 'string') { return template; }
	return String.raw(template, ...values.map(v => encodeURIComponent(v)));
}
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
	 *
	 * @param {Promise<Response>} response
	 * @returns {import('./Result.mjs').Result}
	 */
	buildResult(response) { return new Result(response); }
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
	 * 设置请求方法
	 * @param {string} method 请求方法
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	method(method, path) {
		this.#options.method = method;
		if (path) {
			this.#options.path = path;
			this.#options.append = [];
		}
		return this;
	}
	/**
	 * 将请求方法设置为 `GET`
	 * @overload
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `GET`
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `GET`
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	get(...args) { return this.method('get', toString(...args)); }
	/**
	 * 将请求方法设置为 `POST`
	 * @overload
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `POST`
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `POST`
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	post(...args) { return this.method('post', toString(...args)); }
	/**
	 * 将请求方法设置为 `PUT`
	 * @overload
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `PUT`
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `PUT`
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	put(...args) { return this.method('put', toString(...args)); }
	/**
	 * 将请求方法设置为 `DELETE`
	 * @overload
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `DELETE`
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `DELETE`
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	delete(...args) { return this.method('delete', toString(...args)); }
	/**
	 * 将请求方法设置为 `HEAD`
	 * @overload
	 * @param {string} [path] 新的路径
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `HEAD`
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 将请求方法设置为 `HEAD`
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	head(...args) { return this.method('head', toString(...args)); }
	/**
	 * 修改请求路径
	 * @overload
	 * @param {string} path 新的路径
	 * @returns {this}
	 */
	/**
	 * 修改请求路径
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 修改请求路径
	 * @param {[string | TemplateStringsArray, ...any]} args
	 * @returns {this}
	 */
	path(...args) {
		this.#options.path = toString(...args);
		this.#options.append = [];
		return this;
	}
	/**
	 * 修改请求路径前缀
	 * @overload
	 * @param {string} [prefix] 新的路径前缀
	 * @returns {this}
	 */
	/**
	 * 修改请求路径前缀
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 修改请求路径前缀
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	prefix(...args) {
		this.#options.prefix = toString(...args);
		return this;
	}
	/**
	 * 修改请求路径后缀
	 * @overload
	 * @param {string} [suffix] 新的路径后缀
	 * @returns {this}
	 */
	/**
	 * 修改请求路径后缀
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 修改请求路径后缀
	 * @param {[string | TemplateStringsArray | undefined, ...any]} args
	 * @returns {this}
	 */
	suffix(...args) {
		this.#options.suffix = toString(...args);
		return this;
	}
	/**
	 * 在请求路径后追加新的路径
	 * @overload
	 * @param {...string} path 追加的路径
	 * @returns {this}
	 */
	/**
	 * 在请求路径后追加新的路径
	 * @overload
	 * @param {TemplateStringsArray} template
	 * @param {...any} substitutions
	 * @returns {this}
	 */
	/**
	 * 在请求路径后追加新的路径
	 * @param {...any} path 追加的路径
	 * @returns {this}
	 */
	append(...path) {
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
	 * @returns {this}
	 */
	/**
	 * 设置请求头
	 * @overload
	 * @param {Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} headers 要设置的请求头
	 * @returns {this}
	 */
	/**
	 *
	 * @param {string | Record<string, import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)>} name
	 * @param {import('./types.mjs').HeaderValue | (() => import('./types.mjs').HeaderValue)} [value]
	 */
	header(name, value) {
		const {headers} = this.#options;
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
	 * @overload
	 * @param {boolean | 'error'} redirect 重定向模式
	 * @returns {this}
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
		this.#options.redirect = typeof redirect === 'boolean' ? redirect : 'error';
		return this;
	}
	/**
	 * 设置超时时间
	 * @overload
	 * @param {number} ms 超时时间，单位毫秒
	 * @returns {this}
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
		this.#options.timeout = typeof t === 'number' && t > 0 ? t : 0;
		return this;
	}
	/**
	 * 设置浏览器对凭证信息的控制方式
	 * @overload
	 * @param {RequestCredentials?} credentials 操作方式
	 * @returns {this}
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
		this.#options.credentials =
			typeof credentials === 'string' && credentials || null;
		return this;
	}
	/**
	 * 设置请求模式
	 * @overload
	 * @param {RequestMode | '' | null} mode 请求模式
	 * @returns {this}
	 */
	/**
	 * 获取设置的请求模式
	 * @overload
	 * @returns {RequestMode | ''}
	 */
	/**
	 * @param {RequestMode | '' | null} [mode]
	 * @returns {this | RequestMode | ''}
	 */
	mode(mode) {
		if (!arguments.length) { return this.#options.mode || ''; }
		this.#options.mode = typeof mode === 'string' && mode || null;
		return this;
	}
	/**
	 * 设置缓存模式
	 * @overload
	 * @param {RequestCache?} cache 缓存模式
	 * @returns {this}
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
		this.#options.cache = typeof cache === 'string' && cache || null;
		return this;
	}
	/**
	 * 指定请求头中 referrer 的模式
	 * @overload
	 * @param {string} referrer referrer 的模式
	 * @returns {this}
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
		this.#options.referrer = typeof referrer === 'string' ? referrer : '';
		return this;
	}
	/**
	 * 设置请求头中 Referrer-Policy
	 * @overload
	 * @param {ReferrerPolicy?} rp Referrer-Policy 值
	 * @returns {this}
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
		this.#options.referrerPolicy = typeof rp === 'string' && rp || null;
		return this;
	}
	/**
	 * 设置子资源完整性验证信息
	 * @overload
	 * @param {string} integrity
	 * @returns {this}
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
		this.#options.integrity = typeof integrity === 'string' ? integrity : '';
		return this;
	}
	/**
	 * 设置在页面被关闭后，链接是否可以继续保持活跃
	 * @overload
	 * @param {boolean} keep
	 * @returns {this}
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
		this.#options.keepalive = keep;
		return this;
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
	 * @returns {this}
	 */
	/**
	 * 设置上下文数据
	 * @overload
	 * @param {Record<string, any>} context 要设置的上下文数据
	 * @returns {this}
	 */
	/**
	 * @param {string | symbol | Record<string, any>} name
	 * @param {*} [value]
	 */
	context(name, value) {
		const context = this.#context;
		if (typeof name !== 'string' && typeof name !== 'symbol') {
			this.#context = { ...context, ...name };
			return this;
		}
		if (arguments.length < 2) { return context[name]; }
		this.#context = { ...context, [name]: value };
		return this;
	}

	/**
	 * 设置路径参数
	 * @param {Record<string, string | number>} [params]
	 * @returns {this}
	 */
	params(params) {
		this.#options.params = params ? { ...this.#options.params, ...params } : {};
		return this;
	}
	/**
	 * 设置查询参数
	 * @param {Record<string, any>} [query]
	 * @returns {this}
	 */
	query(query) {
		if (!query) {
			delete this.#options.query;
			return this;
		}
		const oldQuery = this.#options.query;
		this.#options.query = oldQuery ? [ ...oldQuery, query ] : [query];
		return this;
	}
	/**
	 * 设置查询字符串
	 * @param {string} [search]
	 * @returns {this}
	 */
	search(search) {
		this.#options.search =search;
		return this;
	}
	/**
	 * 设置请求数据
	 * @param {Record<string, any>} [data]
	 * @returns {this}
	 */
	data(data) {
		this.#options.data = data;
		return this;
	}
	/**
	 * 设置请求身体
	 * @overload
	 * @param {import('./types.mjs').BodyData} [body]
	 * @param {string} [type]
	 * @returns {this}
	 */
	/**
	 * 设置请求身体
	 * @overload
	 * @param {object | Record<string, any>} [body]
	 * @returns {this}
	 */
	/**
	 * 设置请求身体
	 * @param {*} [body]
	 * @param {string} [type]
	 * @returns {this}
	 */
	body(body, type) {
		this.#options.body = body;
		this.#options.type = type;
		return this;
	}
	/**
	 * 设置请求身体
	 * @param {FormData | object | Record<string, any>} [form]
	 * @returns {this}
	 */
	form(form) {
		this.#options.body = form;
		this.#options.type = true;
		return this;
	}

	/**
	 * 设置中断信号
	 * @param {import('./types.mjs').Signal} [signal]
	 * @returns {this}
	 */
	signal(signal) {
		this.#options.signal = signal || null;
		return this;
	}
	/**
	 * 设置中断信号处理函数
	 * @param {import('./types.mjs').SignalHandler | boolean} [handler]
	 * @returns {this}
	 */
	signalHandler(handler) {
		this.#options.signalHandler =
			handler === true ? createSignalMap() : handler || null;
		return this;
	}

	/**
	 * 设置上传进度监听
	 * @param {import('./types.mjs').ProgressListener} up
	 * @returns {this}
	 */
	uploadProgress(up) {
		this.#options.uploadProgress = typeof up === 'function' ? up : null;
		return this;
	}
	/**
	 * 设置下载进度监听
	 * @param {import('./types.mjs').ProgressListener?} dp
	 * @returns {this}
	 */
	downloadProgress(dp) {
		this.#downloadProgress = typeof dp === 'function' ? dp : null;
		return this;
	}
	/**
	 * 设置异常相应处理函数
	 * @param {import('./types.mjs').ErrorHandler?} eh
	 * @returns {this}
	 */
	errorHandler(eh) {
		this.#errorHandler = typeof eh === 'function' ? eh : null;
		return this;
	}
	/**
	 * 创建对应的 Request 对象
	 * @returns {Request}
		*/
	create() { return createRequest(this.#options); }
	/**
	 * 设置请求方法
	 * @overload
	 * @param {import('./types.mjs').Fetch} fetch
	 * @returns {this}
	 */
	/**
	 * 发送请求并获取相应结果
	 * @overload
	 * @returns {ReturnType<this['buildResult']>}
	 */
	/**
	 * @param {import('./types.mjs').Fetch} [fetch]
	 * @returns {ReturnType<this['buildResult']> | this}
	 */
	fetch(fetch) {
		if (typeof fetch === 'function') {
			this.#fetch = createFetch(fetch, this.#fetch);
			return this;
		}
		const dotRequest = this.clone();
		const response = this.#fetch(this.create(), dotRequest);
		let result = this.buildResult(response);
		const dp = this.#downloadProgress;
		if (dp) { result = result.downloadProgress(dp); }
		const eh = this.#errorHandler;
		if (eh) { result = result.ok(eh); }
		// @ts-ignore
		return result;
	}

	/**
	 * 发送请求，并获取状态码在 200-299 的相应结果
	 * @param {import('./types.mjs').ErrorHandler?} [error]
	 * @returns {ReturnType<this["buildResult"]>}
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
