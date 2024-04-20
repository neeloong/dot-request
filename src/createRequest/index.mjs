import getSignal from './getSignal.mjs';
import getPath from './getPath.mjs';
import createHeaders from './createHeaders.mjs';
import createForm from './createForm.mjs';
import mergeSignal from './mergeSignal.mjs';
import StatisticsStream from '../StatisticsStream.mjs';
/**
 * @typedef {object} RequestParams
 * @property {string} [method]
 * @property {string} prefix
 * @property {string} path
 * @property {string[]} append
 * @property {string} suffix
 *
 * @property {Record<string, import('../types.mjs').HeaderValue | (() => import('../types.mjs').HeaderValue)>} headers
 *
 * @property {Record<string, any>} params
 * @property {Record<string, any>} [query]
 * @property {string} [search]
 * @property {any} [data]
 * @property {any} [body]
 * @property {string | boolean} [type]
 *
 * @property {import('../types.mjs').Signal | boolean | null} signal
 * @property {import('../types.mjs').SignalHandler?} signalHandler
 *
 * @property {boolean | 'error' | 'follow' | 'manual'} redirect
 *
 * @property {number} timeout
 * @property {string} integrity
 * @property {boolean} keepalive
 * @property {RequestCredentials | null} credentials
 * @property {RequestMode | null} mode
 * @property {RequestCache | null} cache
 * @property {string} referrer
 * @property {ReferrerPolicy | null} referrerPolicy
 * @property {import('../types.mjs').ProgressListener?} uploadProgress
 */


/**
 *
 * @param {RequestParams} params
 * @returns {Request}
 */
export default function createRequest({
	method = 'get',
	prefix, path, append, suffix,
	params, query, search, data, body, type,
	signal, signalHandler,
	headers: baseHeaders,

	uploadProgress,

	timeout,
	integrity, keepalive, credentials, mode, cache, referrer, referrerPolicy,
}) {
	const headers = createHeaders(baseHeaders);
	/** @type {RequestInit} */
	const init = {
		method,
		headers,
		signal: mergeSignal(
			getSignal(signal, signalHandler),
			timeout ? AbortSignal.timeout(timeout) : null,
		),
	};
	if (keepalive) { init.keepalive = true; }
	if (credentials) { init.credentials = credentials; }
	if (cache) { init.cache = cache; }
	if (mode) { init.mode = mode; }
	if (referrer) { init.referrer = referrer; }
	if (referrerPolicy) { init.referrerPolicy = referrerPolicy; }
	if (integrity) { init.integrity = integrity; }

	let total = -1;

	if (method !== 'get' && method !== 'head') {
		if (body instanceof FormData) {
			init.body = body;
		} else if (body instanceof URLSearchParams) {
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
			const blob = new Blob([body.toString()]);
			total = blob.size;
			init.body = blob;
		} else if (body instanceof Blob) {
			const bType = body.type;
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			} else if (bType) {
				headers['Content-Type'] = bType;
			}
			total = body.size;
			init.body = body;
		} else if (body instanceof ReadableStream) {
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			}
			init.body = body;
		} else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			}
			total = body.byteLength;
			init.body = body;
		} else if (body && typeof body === 'string') {
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			}
			const blob = new Blob([body]);
			total = blob.size;
			init.body = blob;
		} else if (body) {
			if (
				type === true
				&& typeof body === 'object'
				&& !Array.isArray(body)
			) {
				init.body = createForm(body);
			} else {
				headers['Content-Type'] = 'application/json';
				const blob = new Blob([JSON.stringify(body)]);
				total = blob.size;
				init.body = blob;
			}
		} else if (data) {
			headers['Content-Type'] = 'application/json';
			const blob = new Blob([JSON.stringify(data)]);
			total = blob.size;
			init.body = blob;
		}
	}
	const dataInPath = body || ['get', 'head'].includes(method.toLowerCase());
	const fullPath = getPath(
		prefix,
		path,
		append,
		suffix,
		params,
		query,
		search,
		dataInPath ? data : null,
	);
	const request = new Request(fullPath, init);
	if (!uploadProgress) { return request; }
	const requestBody = request.body;
	if (!requestBody) {
		return request;
	}
	return new Request(request, {
		body: requestBody.pipeThrough(new StatisticsStream(progress => {
			uploadProgress(progress, total);
		})),
	});
}
