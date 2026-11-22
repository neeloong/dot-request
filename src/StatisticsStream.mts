
export default class StatisticsStream<T extends ArrayBuffer | ArrayBufferView>
	extends TransformStream<T> {

	constructor(
		cb: (size: number) => void,
		writableStrategy?: QueuingStrategy<T>,
		readableStrategy?: QueuingStrategy<T>,
	) {
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
