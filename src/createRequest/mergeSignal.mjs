/**
 *
 * @param {*} v
 * @returns {v is AbortSignal}
 */
function isAbortSignal(v) {
	return v instanceof AbortSignal;
}
/**
 *
 * @param  {...AbortSignal | undefined | null} signals
 * @returns {AbortSignal | undefined}
 */
export default function mergeSignal(...signals) {
	const list = signals.filter(isAbortSignal);
	if (!list.length) { return; }
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
