
/**
 * @param {import('./types.mjs').Fetch} fetchApi
 * @param {(request: Request, dotRequest: import('./DotRequest.mjs').DotRequest) => Promise<Response>} oldFetch
 * @returns {(request: Request, dotRequest: import('./DotRequest.mjs').DotRequest) => Promise<Response>}
 */
export default function createFetch(fetchApi, oldFetch) {
	return async function (request, dotRequest) {
		return fetchApi(
			request,
			(r, ndr) => oldFetch(r || request, ndr || dotRequest),
			dotRequest,
		);
	};
}
