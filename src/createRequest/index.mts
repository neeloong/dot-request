import type { DotRequest } from '../DotRequest.mts';

import getSignal from './getSignal.mts';
import getPath from './getPath.mts';
import createHeaders from './createHeaders.mts';
import createForm from './createForm.mts';
import StatisticsStream from '../StatisticsStream.mts';

export interface RequestParams {
	method?: string;
	prefix: string | (() => string);
	path: string | (() => string);
	append: (string | (() => string))[];
	suffix: string | (() => string);
	headerGroups: Array<(() => Record<string, DotRequest.HeaderValue> | null)>;
	headers: Record<string, DotRequest.HeaderValue | (() => DotRequest.HeaderValue)>;
	params: Record<string, any>;
	query?: Record<string, any>[];
	search?: string;
	data?: any;
	body?: any;
	type?: string | boolean;
	signal: DotRequest.Signal | boolean | null;
	signalHandler: DotRequest.SignalHandler | null;
	redirect: boolean | 'error' | 'follow' | 'manual';
	timeout: number;
	integrity: string;
	keepalive: boolean;
	credentials: RequestCredentials | null;
	mode: RequestMode | null;
	cache: RequestCache | null;
	referrer: string;
	referrerPolicy: ReferrerPolicy | null;
	uploadProgress: DotRequest.ProgressListener | null;
	stringifyJSON: ((value: any) => string) | null;
}


function mergeSignal(...signals: (AbortSignal | null)[]): AbortSignal | null {
	const list = signals.filter(v => v instanceof AbortSignal);
	if (!list.length) { return null; }
	if (list.length === 1) { return list[0]; }
	return AbortSignal.any(list);
}

export default function createRequest({
	method = 'get',
	prefix, path, append, suffix,
	params, query, search, data, body, type,
	signal, signalHandler,
	headerGroups, headers: baseHeaders,

	uploadProgress,

	timeout,
	integrity, keepalive, credentials, mode, cache, referrer, referrerPolicy,
	stringifyJSON,
}: RequestParams): Request {
	const headers = createHeaders(headerGroups, baseHeaders);
	const init: RequestInit = {
		method,
		headers,
		// @ts-ignore
		duplex: 'half',
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
			init.body = body as ArrayBuffer | ArrayBufferView<ArrayBuffer>;
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
				const blob = new Blob([
					typeof stringifyJSON === 'function'
						? stringifyJSON(body)
						: JSON.stringify(body),
				]);
				total = blob.size;
				init.body = blob;
			}
		} else if (data) {
			headers['Content-Type'] = 'application/json';
			const blob = new Blob([
				typeof stringifyJSON === 'function'
					? stringifyJSON(body)
					: JSON.stringify(body),
			]);
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
		// @ts-ignore
		duplex: 'half',
		body: requestBody.pipeThrough(new StatisticsStream(progress => {
			uploadProgress(progress, total);
		})),
	});
}
