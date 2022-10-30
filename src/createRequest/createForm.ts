import getFromData from './getFromData';

export default function createForm(data: Record<string, any>) {
	const from = new FormData();
	for (const [k, v] of Object.entries(data)) {
		for (const [name, keys, value] of getFromData(k, [], v)) {
			if (value === null) { continue; }
			if (value === true) {
				from.append(`${name}${keys.map(k => `[${k}]`)}[_]`, '');
				continue;
			}
			from.append(`${name}${keys.map(k => `[${k}]`)}`, value);
		}
	}
	return from;
}
