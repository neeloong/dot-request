
import type { Signal, Method } from '../types';

import getSignal from './getSignal';
import getPath from './getPath';
import createHeaders from './createHeaders';
import createForm from './createForm';

export interface RequestParams {
	method?: Method;
	path?: string;
	root?: string;
	append: string[];

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


export default function createRequest({
	method = 'get',
	root, path, append,
	params, query, search, data, body, type,
	signal, signalHandler,
	headers: baseHeaders,
}: RequestParams) {
	const headers: HeadersInit = createHeaders(baseHeaders)
	const init: RequestInit = {
		method,
		headers,
		signal: getSignal(signal, signalHandler),
	}
	if (method !== 'get' && method !== 'head') {
		if (body instanceof FormData) {
			init.body = body;
		} else if (body instanceof Blob) {
			const bType = body.type;
			if (type && typeof type === 'string') { headers['Content-Type'] = type }
			else if (bType) { headers['Content-Type'] = bType }
			init.body = body;
		} else if ( body instanceof ReadableStream || body instanceof ArrayBuffer || ArrayBuffer.isView(body) || body && typeof body === 'string') {
			if (type && typeof type === 'string') { headers['Content-Type'] = type }
			init.body = body
		} else if (body) {
			if (type === true && typeof body === 'object' && !Array.isArray(body)) {
				init.body = createForm(body);
			} else {
				headers['Content-Type'] = 'application/json'
				init.body = JSON.stringify(body);
			}
		} else if (data) {
			headers['Content-Type'] = 'application/json'
			init.body = JSON.stringify(body);
		}
	}
	const fullPath = getPath(root, path, append, params, query, search, body || ['get', 'head'].includes(method) ? data : undefined);
	return new Request(fullPath, init)

}
