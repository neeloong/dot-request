import createRequest, { RequestParams } from './createRequest';

export interface RequestData extends RequestParams {
	handlers: ((v: Response) => any)[];
	catchers: ((v: any) => any)[];
	fetch?(request: Request): Promise<Response>;
}

async function fetchData(
	send: (request: Request) => Promise<Response> = fetch,
	catchers: ((v: any) => any)[],
	request: Request,
) {
	try {
		return await send(request);
	} catch (e) {
		for (const handler of catchers) {
			if (typeof handler !== 'function') { continue }
			await handler(e);
		}
		throw e;
	}
}

export default async function send({
	handlers, catchers, fetch,
	...params
}: RequestData) {
	const response = await fetchData(fetch, catchers, createRequest(params));
	for (const handler of handlers) {
		if (typeof handler !== 'function') { continue }
		await handler(response);
	}
	return response;

}
