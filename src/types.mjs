
/**
 * @typedef {AbortSignal | number | bigint | string | symbol | object | boolean | Record<string, any>} Signal
 */
/**
 * @typedef {object} SignalMap
 * @property {(signal: Exclude<Signal, AbortSignal>) => AbortController | void | null} get
 * @property {(signal: Exclude<Signal, AbortSignal>, ac: AbortController) => void} set
 */
/**
 * @typedef {number | bigint | string | symbol} SignalMapToken
 */
/**
 * @typedef {SignalMapToken | SignalMap | ((v: any) => Signal)} SignalHandler
 */

/**
 * @typedef {FormData | ArrayBuffer | ArrayBufferView | object | Record<string, any> | ReadableStream | Blob | BufferSource | URLSearchParams | string} BodyData
 */
/**
 * @typedef {number | string | void | null} HeaderValue
 */
/**
 * @callback ProgressListener
 * @param {number} progress
 * @param {number} total
 * @returns {void}
 */

/**
 * @callback Fetch
 * @param {Request} request
 * @param {(request?: Request, dotRequest?: import('./DotRequest.mjs').DotRequest) => Promise<Response>} fetch
 * @param {import('./DotRequest.mjs').DotRequest} dotRequest
 * @returns {PromiseLike<Response> | Response}
 */
