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
 * ${ name } v${ version }
 * (c) ${ beginYear === year ? beginYear : `${ beginYear }-${ year }` } ${ author }
 * @license ${ license }
 */
`;

try {
	fsFn.rmSync('build', { recursive: true })
} catch {}
fsFn.mkdirSync(`build`, {recursive: true})
fsFn.writeFileSync(`build/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	type: 'module',
	main: 'index.mjs',
	unpkg: 'index.mjs',
	jsdelivr: 'index.mjs',
	author, license, homepage, repository, bugs,
}, null, 2))

export default [
	{
		input: 'src/index.ts',
		output: { file: `build/index.mjs`, format: 'esm', banner },
		plugins: [
			resolve({ extensions: ['.ts'] }),
			babel({ extensions: ['.ts'], plugins: ['@babel/plugin-transform-typescript'] }),
			replace({ __VERSION__: version }),
		],
	}, {
		input: 'src/index.ts',
		output: { file: 'build/index.d.ts', format: 'esm', banner },
		plugins: [ dts() ],
	},
];
