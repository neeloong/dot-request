
/**
 * @template {Record<string, any>} T
 * @param {import('./types.mjs').Fetch<T>} fetchApi
 * @param {import('./create.mjs').RequestData['fetch']} oldFetch
 * @returns {import('./create.mjs').RequestData['fetch']}
 */
export default function createFetch(fetchApi, oldFetch) {
	return async function (request, dotRequest) {
		return fetchApi(
			request,
			(r, ndr) => oldFetch(r || request, ndr || dotRequest),
			/** @type {*} */(dotRequest),
		);
	};
}
