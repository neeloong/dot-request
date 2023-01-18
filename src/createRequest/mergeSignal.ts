export default function mergeSignal(
	...signals: (AbortSignal | undefined)[]
): AbortSignal | undefined {
	const list = signals
		.filter((v: any): v is AbortSignal => v instanceof AbortSignal);
	if (!list) { return; }
	if (list.length === 1) { return list[0]; }
	const controller = new AbortController();
	Promise.any(list.map(v => {
		if (v.aborted) { return Promise.resolve(v.reason); }
		return new Promise(r => v.addEventListener(
			'abort',
			() => r(v.reason),
			{ once: true },
		));
	})).then(e => controller.abort(e));
	return controller.signal;
}
