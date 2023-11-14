import getSignal from './getSignal.mjs';
import getPath from './getPath.mjs';
import createHeaders from './createHeaders.mjs';
import createForm from './createForm.mjs';
import mergeSignal from './mergeSignal.mjs';
/**
 *
 * @param {import('../types.mjs').RequestParams} params
 * @returns {Request}
 */
export default function createRequest({
	method = 'get',
	prefix, path, append, suffix,
	params, query, search, data, body, type,
	signal, signalHandler,
	headers: baseHeaders,

	timeout,
	integrity, keepalive, credentials, mode, cache, referrer, referrerPolicy,
}) {
	/** @type {HeadersInit} */
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

	if (method !== 'get' && method !== 'head') {
		if (body instanceof FormData) {
			init.body = body;
		} else if (body instanceof Blob) {
			const bType = body.type;
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			} else if (bType) {
				headers['Content-Type'] = bType;
			}
			init.body = body;
		} else if (
			body instanceof ReadableStream
			|| body instanceof ArrayBuffer
			|| ArrayBuffer.isView(body)
			|| body && typeof body === 'string'
		) {
			if (type && typeof type === 'string') {
				headers['Content-Type'] = type;
			}
			init.body = body;
		} else if (body) {
			if (
				type === true
				&& typeof body === 'object'
				&& !Array.isArray(body)
			) {
				init.body = createForm(body);
			} else {
				headers['Content-Type'] = 'application/json';
				init.body = JSON.stringify(body);
			}
		} else if (data) {
			headers['Content-Type'] = 'application/json';
			init.body = JSON.stringify(body);
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
		dataInPath ? data : undefined,
	);
	return new Request(fullPath, init);

}
