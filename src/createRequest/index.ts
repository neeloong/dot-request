import type { RequestParams } from '../types';

import getSignal from './getSignal';
import getPath from './getPath';
import createHeaders from './createHeaders';
import createForm from './createForm';


export default function createRequest({
	method = 'get',
	prefix, path, append, suffix,
	params, query, search, data, body, type,
	signal, signalHandler,
	headers: baseHeaders,
}: RequestParams) {
	const headers: HeadersInit = createHeaders(baseHeaders);
	const init: RequestInit = {
		method,
		headers,
		signal: getSignal(signal, signalHandler),
	};
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
