import type { ModuleFormat } from 'rollup';
import pathFn from 'node:path';
import fsPromise from 'node:fs/promises';
import { rollup } from 'rollup';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const {
	name, description, version, engines, dependencies,
	author, license, homepage, repository, bugs,
}: { name: string;[k: string]: any } = JSON.parse(await fsPromise.readFile('./package.json', 'utf-8'));

const banner = `\
/*!
 * ${name} v${version}
 * (c) 2022-${new Date().getFullYear()} ${author}
 * @license ${license}
 */
`;

console.log('移除 dist 目录...');
await fsPromise.rm('dist', { recursive: true }).catch(() => { });
console.log('创建 dist 目录...');
await fsPromise.mkdir(`dist`, { recursive: true });
console.log('生成 dist/package.json ...');
await fsPromise.writeFile(`dist/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	module: 'index.mjs',
	main: 'index.cjs',
	unpkg: 'index.js',
	jsdelivr: 'index.js',
	types: './index.d.mts',
	author, license, homepage, repository, bugs,
	exports: {
		'.': {
			import: './index.mjs',
			types: './index.d.mts',
			node: './index.cjs',
			module: './index.mjs',
			unpkg: './index.js',
			jsdelivr: './index.js',
		},
	},
}, null, 2));

const input = 'src/index.mts';
const replacePlugin = replace({
	preventAssignment: true, values: {
		__VERSION__: version,
	}
});
const babelPlugin = babel({
	extensions: ['.ts', '.mts', '.js', '.mjs'],
	babelHelpers: 'bundled',
	plugins: ['@babel/plugin-transform-typescript'],
});
console.log('生成 dist/index.d.mts ...');
const dtsBundle = await rollup({
	input,
	plugins: [replacePlugin, babelPlugin, dts()],
});
const { output: [chunk] } = await dtsBundle.generate({
	format: 'esm',
	banner,
	exports: 'default',
});
await fsPromise.writeFile(
	pathFn.resolve('dist', `index.d.mts`),
	chunk.code || ''
);

const bundle = await rollup({
	input,
	plugins: [replacePlugin, babelPlugin],
});

const outputOptionsList: [ModuleFormat, string, boolean?][] = [
	['esm', 'mjs'],
	['cjs', 'cjs'],
	['umd', 'js'],
	['esm', 'mjs', true],
	['umd', 'js', true],
];
const umdName = name.replace(/-([a-z])/g, (_, v) => v.toUpperCase());
for (const [format, ext, min] of outputOptionsList) {

	console.log(`生成 dist/index${min ? '.min' : ''}.${ext} ...`);
	const { output: [chunk] } = await bundle.generate({
		format,
		name: umdName,
		banner,
		exports: 'default',
		plugins: min ? [terser()] : [],
	});

	await fsPromise.writeFile(
		pathFn.resolve('dist', `index${min ? '.min' : ''}.${ext}`),
		chunk.code || ''
	);
}

for (const file of await fsPromise.readdir('.', 'utf-8')) {
	if (/^(README|LICENSE)(\..+)?$/.test(file)) {
		console.log(`复制 ${file}...`);
		await fsPromise.copyFile(file, pathFn.resolve('dist', file));
	}
}
console.log('完成');
