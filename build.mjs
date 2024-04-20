import pathFn from 'node:path';
import fsPromise from 'node:fs/promises';
import { rollup } from 'rollup';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const {
	name, description, version, engines, dependencies,
	author, license, homepage, repository, bugs,
} = JSON.parse(await fsPromise.readFile('./package.json', 'utf-8'));

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
console.log('创建 dist/package.json ...');
await fsPromise.writeFile(`dist/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	module: 'index.mjs',
	main: 'index.cjs',
	unpkg: 'index.js',
	jsdelivr: 'index.js',
	author, license, homepage, repository, bugs,
	exports: {
		'.': {
			types: './index.d.ts',
			node: './index.cjs',
			module: './index.mjs',
			unpkg: './index.js',
			jsdelivr: './index.js',
		},
	},
}, null, 2));

console.log('创建 dist/index.d.ts ...');
const [mainDts, resultDts, typesDts] = await Promise.all([
	fsPromise.readFile('types/DotRequest.d.mts', 'utf-8'),
	fsPromise.readFile('types/Result.d.mts', 'utf-8'),
	fsPromise.readFile('types/types.d.mts', 'utf-8'),
]);

const dts = `declare namespace DotRequest {
${typesDts.replace(/^(?!$)/gm, '    ')}
${resultDts.replace(/^(?!$)/gm, '    ')}
}
${mainDts.replace(/\bexport\b/g, 'declare')}
export default DotRequest`
	.replace(/import\((["']).\/(DotRequest|types|Result).mjs\1\)/g, 'DotRequest')
	.replaceAll('DotRequest.DotRequest', 'DotRequest')
	.replaceAll(`import { Result } from './Result.mjs';`, '')
	.replace(/\n\s*static get Result\(\): typeof Result;/, '');
await fsPromise.writeFile('dist/index.d.ts', dts);



console.log('打包...');
const bundle = await rollup({
	input: 'src/index.mjs',
	plugins: [
		replace({
			preventAssignment: true, values: {
				__VERSION__: version,
				[`import('./types.mjs').`]: '',
				[`import('../types.mjs').`]: '',
				[`import('./DotRequest.mjs').`]: '',
				[`import('./Result.mjs').`]: '',
				[`import('./createRequest/index.mjs').`]: '',
			}
		}),
	],
});


/** @type {[string, string, boolean?][]} */
const outputOptionsList = [
	['esm', 'mjs'],
	['cjs', 'cjs'],
	['umd', 'js'],
	['esm', 'mjs', true],
	['umd', 'js', true],
];
const umdName = name.replace(/-([a-z])/g, (_, v) => v.toUpperCase());
for (const [format, ext, min] of outputOptionsList) {

	console.log(`创建 dist/index${min ? '.min' : ''}.${ext} ...`);
	const { output: [chunk] } = await bundle.generate({
		format,
		name: umdName,
		banner,
		exports: 'default',
		plugins: min ? [terser()] : [],
	});

	await fsPromise.writeFile(
		pathFn.resolve('dist', `index${min ? '.min' : ''}.${ext}`),
		chunk.source || chunk.code || ''
	);
}

console.log('复制文件...');
for (const file of await fsPromise.readdir('.', 'utf-8')) {
	if (/^(README|LICENSE)(\..+)?$/.test(file)) {
		console.log(`  ${file}...`);
		await fsPromise.writeFile(
			pathFn.resolve('dist', file),
			await fsPromise.readFile(file),
		);
	}
}
console.log('完成');
