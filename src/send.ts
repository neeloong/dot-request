export default async function fetchData(
	request: Request,
	catchers?: ((v: any) => any)[],
	send?: (request: Request) => Response | Promise<Response>,
) {
	try {
		if (typeof send === 'function') {
			return await send(request);
		} else {
			return await fetch(request);
		}
	} catch (e) {
		for (const handler of catchers || []) {
			if (typeof handler !== 'function') { continue }
			await handler(e);
		}
		throw e;
	}
}
