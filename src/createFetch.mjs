/** @import { Fetch } from './types.mjs' */
/** @import { DotRequest } from './DotRequest.mjs' */

/**
 * @param {Fetch} fetchApi
 * @param {(request: Request, dotRequest: DotRequest) => Promise<Response>} oldFetch
 * @returns {(request: Request, dotRequest: DotRequest) => Promise<Response>}
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
