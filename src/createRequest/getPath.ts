import getFromData from './getFromData';

function getKey(name: string, keys: string[]) {
	return `${decodeURIComponent(name)}${keys.map(k => `[${decodeURIComponent(k)}]`).join('')}`
}
function queryStringify(query: any) {
	const text: string[] = [];
	if (!query) { return text; }
	for (const [k, v] of Object.entries(query)) {
		for (const [name, keys, value] of getFromData(k, [], v)) {
			const key = getKey(name, keys);
			if (value === null) {
				text.push(key);
				continue;
			}
			if (value === true) {
				text.push(key);
				continue;
			}
			text.push(`${key}=${encodeURIComponent(String(value))}`);
		}
	}
	return text
}

function createReplace(params?: Record<string, any>): (p: string) => string {
	if (params) {
		return p =>p.replace(/:([a-zA-Z0-9][a-z0-9]*)/g, (_, k) => {
			return k && k in params ? encodeURIComponent(params[k]) : ''
		})
	}
	return p =>p.replace(/:([a-zA-Z0-9][a-z0-9]*)/g, '')
}

const regex = /^([^?#]*)((?:\?[^#]*)?)((?:#[\s\S]*)?)$/;
export default function getPath(
	root: string | undefined,
	path: string | undefined,
	append: string[],
	params?: Record<string, any>,
	query?: any,
	search?: any,
	data?: any,
) {
	const paths = [root, path, ...append].map(p => p && regex.exec(p) || ['', '', '']);
	let p = paths.map(([,v]) => v).map(createReplace(params)).join('/')
		.replace(/((?:^(?:http|ftp)s?\:\/)?)[\\/]+/ig, '$0/');
	if (p[0] !== '/' && !/^(http|ftp)s?:\/\//i.test(p)) {
		p = `/${p}`;
	}
	const allSearch = [
		...paths.map(([,,s]) => s.substring(1)),
		search[0] === '?' ? search.substring(1) : search,
		...queryStringify(query),
		...queryStringify(data),
	].filter(Boolean).join('&');
	return `${p}?${allSearch}`;

}
