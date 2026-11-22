import type { DotRequest } from './DotRequest.mts';

export default function createFetch(
	fetchApi: DotRequest.Fetch,
	oldFetch: (request: Request, dotRequest: DotRequest) => Promise<Response>
): (request: Request, dotRequest: DotRequest) => Promise<Response> {
	return async function (request, dotRequest) {
		return fetchApi(
			request,
			(r, ndr) => oldFetch(r || request, ndr || dotRequest),
			dotRequest,
		);
	};
}
