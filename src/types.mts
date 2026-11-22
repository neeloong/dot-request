import type { DotRequest } from './DotRequest.mts';

export type Signal = AbortSignal | number | bigint | string | symbol | object | boolean | Record<string, any>;
export interface SignalMap {
	get(signal: Exclude<Signal, AbortSignal>): AbortController | void | null;
	set(signal: Exclude<Signal, AbortSignal>, ac: AbortController): void;
}
export type SignalMapToken = number | bigint | string | symbol;
export type SignalHandler = SignalMapToken | SignalMap | ((v: any) => Signal);

export type BodyData = 
	| FormData | ArrayBuffer | ArrayBufferView<ArrayBuffer>
	| object | Record<string, any>
	| ReadableStream | Blob | BufferSource | URLSearchParams | string

export type HeaderValue = number | string | void | null

export interface ProgressListener {
	(progress: number, total: number): void
}
export interface ErrorHandler {
	(response: Response): unknown | Promise<unknown>
}
export interface Fetch {
	(
		request: Request,
		fetch: (request?: Request, dotRequest?: DotRequest) => Promise<Response>,
		dotRequest: DotRequest,
	): PromiseLike<Response> | Response
}
