/**
 * @template I
 * @template O
 * @exports TransformStream<I,O>
 */
export default class StatisticsStream extends TransformStream {
	/**
	 *
	 * @param {(size: number) => void} cb
	 * @param {QueuingStrategy<I>} [writableStrategy]
	 * @param {QueuingStrategy<O>} [readableStrategy]
	 */
	constructor(cb, writableStrategy, readableStrategy) {
		let size = 0;
		super({
			transform(chunk, controller) {
				size += chunk.byteLength;
				controller.enqueue(chunk);
				cb(size);
			},
		}, writableStrategy, readableStrategy);
	}
}
