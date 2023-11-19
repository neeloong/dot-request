import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import replace from '@rollup/plugin-replace';
import fsPromise from 'node:fs/promises';
const info = JSON.parse(await fsPromise.readFile('./package.json', 'utf-8'));
const {
	name, description, version, engines, dependencies,
	author, license, homepage, repository, bugs,
} = info;
const beginYear = 2022;
const year = new Date().getFullYear();

const banner = `\
/*!
 * ${name} v${version}
 * (c) ${beginYear === year ? beginYear : `${beginYear}-${year}`} ${author}
 * @license ${license}
 */
`;


await fsPromise.rm('dist', { recursive: true }).catch(() => {});
await fsPromise.mkdir(`dist`, { recursive: true });
await fsPromise.writeFile(`dist/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	module: 'index.mjs',
	main: 'index.cjs',
	unpkg: 'index.js',
	jsdelivr: 'index.js',
	author, license, homepage, repository, bugs,
	exports: {
		'.': {
			type: './index.d.js',
			node: './index.cjs',
			module: './index.mjs',
			unpkg: './index.js',
			jsdelivr: './index.js',
		},
	},
}, null, 2));

function createOutput(format, ext) {
	return {
		format,
		file: `dist/index.${ext}`,
		name: name.replace(/-([a-z])/g, (_, v) => v.toUpperCase()),
		banner,
		exports: 'default',
	};
}

export default [
	{
		input: 'src/index.mjs',
		output: [
			createOutput('esm', 'mjs'),
			createOutput('cjs', 'cjs'),
			createOutput('umd', 'js'),
		],
		plugins: [
			resolve({ extensions: ['.ts'] }),
			babel({
				extensions: ['.ts'],
				plugins: ['@babel/plugin-transform-typescript'],
			}),
			replace({ preventAssignment: true, values: {
				__VERSION__: version,
				[`import('./types.mjs').`]: '',
				[`import('../types.mjs').`]: '',
				[`import('./index.mjs').`]: '',
				[`import('./create.mjs').`]: '',
				[`import('./createRequest/index.mjs').`]: '',
			} }),
		],
	}, {
		input: 'src/types.mts',
		output: { file: 'dist/index.d.ts', format: 'esm', banner },
		plugins: [dts()],
	},
];
