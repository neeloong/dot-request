import { Fetch, RequestData } from './types';
export default function createFetch<
	T extends Record<string, any>,
>(fetchApi: Fetch<T>, oldFetch: RequestData['fetch']): typeof oldFetch {
	return async function (request, dotRequest) {
		return fetchApi(
			request,
			(r, ndr) => oldFetch(r || request, ndr || dotRequest),
			dotRequest as any,
		);
	};
}
