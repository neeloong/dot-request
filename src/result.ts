import type { Result } from './types';


export default function result(response: Promise<Response>): Result {
	return {
		get version() { return '__VERSION__'; },
		text() { return response.then(r => r.text()); },
		blob() { return response.then(r => r.blob()); },
		arrayBuffer() { return response.then(r => r.arrayBuffer()); },
		formData() { return response.then(r => r.formData()); },
		json() { return response.then(r => r.json()); },

		ok() {
			return result(response.then( v =>v.ok ? v : Promise.reject(v)));
		},
		clone() { return result(response.then(r => r.clone())); },

		then(r1, r2) { return response.then(r1, r2); },
		catch(r) { return response.catch(r); },
		finally(r) { return response.finally(r); },

		do(handler, catcher) {
			return result(response.then(async e => {
				if (typeof handler === 'function') {
					await handler(e);
				}
				return e;
			}, async e => {
				if (typeof catcher === 'function') {
					await catcher(e);
				}
				throw e;
			}));
		},
	};
}
