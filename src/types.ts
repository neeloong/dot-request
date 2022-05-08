export type Method = 'get' | 'post' | 'put' | 'delete' | 'head';
export type Signal = AbortSignal | symbol | object | Record<string, any>;
export type Data = FormData | ArrayBuffer | ArrayBufferView | object | Record<string, any>;
