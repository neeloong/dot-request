import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import dts from 'rollup-plugin-dts';
import replace from 'rollup-plugin-replace';
import fsFn from 'fs';
import info from './package.json';
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

try {
	fsFn.rmSync('dist', { recursive: true });
} catch { }
fsFn.mkdirSync(`dist`, { recursive: true });
fsFn.writeFileSync(`dist/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	module: 'index.mjs',
	main: 'index.cjs',
	unpkg: 'index.js',
	jsdelivr: 'index.js',
	author, license, homepage, repository, bugs,
	exports: {
		'.': {
			import: './index.mjs',
			require: './index.cjs',
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
		input: 'src/index.ts',
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
			replace({ __VERSION__: version }),
		],
	}, {
		input: 'src/index.ts',
		output: { file: 'dist/index.d.ts', format: 'esm', banner },
		plugins: [dts()],
	},
];
