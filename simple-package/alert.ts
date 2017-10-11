/* this file is just for debug */

let IS_SERVER = typeof window === 'undefined';
try {
	const val = process.env.XXX;
	require.resolve('fs');
} catch (e) {
	IS_SERVER = false;
}
const colorHolder = IS_SERVER ? '%s' : '%c';
const errorColor = IS_SERVER ? '\x1B[38;5;9m' : 'color:red;font-size:large;';
const resetColor = IS_SERVER ? '\x1B[0m' : 'color:black;font-size:normal;';

export function alertJenv<T>(option: T, valueName: keyof T) {
	if (option.hasOwnProperty(valueName)) {
		const trace = (new Error).stack.replace(/^.*\n/, '');
		console.error(`${colorHolder}参数%s应使用JsonEnv传入${colorHolder}\n%s`, errorColor, valueName, resetColor, trace);
	}
}
