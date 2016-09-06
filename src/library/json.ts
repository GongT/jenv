import {readFileSync, writeFileSync} from "fs";
import {existsSync} from "fs";
import {dirname} from "path";
import {sync as mkdirpSync} from "mkdirp";

export function readJsonFile(file) {
	try {
		//noinspection TypeScriptUnresolvedFunction
		return JSON.parse(readFileSync(file, 'utf-8'));
	} catch (e) {
		e.message += ` (in file ${file})`;
		throw e;
	}
}

export function writeJsonFile(file, data) {
	let str = JSON.stringify(data, null, 8);
	str = str.replace(/^\s+/gm, function (m0) {
		return (new Array(parseInt(m0.length / 8))).fill('\t').join('');
	});
	try {
		console.error('<- %s', file);
		const dir = dirname(file);
		if (!existsSync(dir)) {
			console.error('<+ %s', dir);
			mkdirpSync(dir);
		}
		return writeFileSync(file, str, 'utf-8');
	} catch (e) {
		console.error(e.message);
		return false;
	}
}
