import getFromData from './getFromData.mjs';

/**
 *
 * @param {string} name
 * @param {string[]} keys
 * @returns
 */
function getKey(name, keys) {
	const nameDecoded = decodeURIComponent(name);
	const keysDecoded = keys.map(k => `[${decodeURIComponent(k)}]`).join('');
	return `${nameDecoded}${keysDecoded}`;
}
/**
 *
 * @param {*} query
 * @returns {string[]}
 */
function queryStringify(query) {
	if (query instanceof URLSearchParams) {
		return [query.toString()];
	}
	/** @type {string[]} */
	const text = [];
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
	return text;
}

/**
 *
 * @param {Record<string, any>} [params]
 * @returns {(p: string) => string}
 */
function createReplace(params) {
	if (params) {
		return p => p.replace(
			/:([a-zA-Z0-9][a-z0-9]*)/g,
			(_, k) => k && k in params ? encodeURIComponent(params[k]) : '',
		);
	}
	return p => p.replace(/:([a-zA-Z0-9][a-z0-9]*)/g, '');
}

const regex = /^([^?#]*)((?:\?[^#]*)?)((?:#[\s\S]*)?)$/;
/**
 *
 * @param {string} prefix
 * @param {string} path
 * @param {string[]} append
 * @param {string} suffix
 * @param {Record<string, any>} [params]
 * @param {*} [query]
 * @param {string} [search]
 * @param {*} [data]
 * @returns
 */
export default function getPath(
	prefix,
	path,
	append,
	suffix,
	params,
	query,
	search,
	data,
) {
	const paths = [prefix, path, ...append]
		.map(p => p && regex.exec(p) || ['', '', '']);
	let p = paths.map(([, v]) => v)
		.map(createReplace(params))
		.join('/')
		.replace(/((?:^(?:http|ftp)s?:\/)?)[\\/]+/ig, '$0/');
	if (p[0] !== '/' && !/^(http|ftp)s?:\/\//i.test(p)) {
		p = `/${p}`;
	}
	if (suffix) {
		p += suffix;
	}
	const allSearch = [
		...paths.map(([, , s]) => s.substring(1)),
		search?.[0] === '?' ? search.substring(1) : search,
		...queryStringify(query),
		...queryStringify(data),
	].filter(Boolean).join('&');
	return `${p}?${allSearch}`;

}
