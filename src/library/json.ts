import {readFileSync, writeFileSync, existsSync} from "fs";
import {dirname} from "path";
import {sync as mkdirpSync} from "mkdirp";
import {prettyPrint} from "./output";

export function readJsonFile(file) {
	try {
		//noinspection TypeScriptUnresolvedFunction
		return JSON.parse(readFileSync(file, 'utf-8'));
	} catch (e) {
		e.message += ` (in file ${file})`;
		throw e;
	}
}

export function writeJsonFile(file, data): boolean {
	let str = JSON.stringify(data, null, 8);
	str = str.replace(/^\s+/gm, function (m0) {
		return (new Array(Math.ceil(m0.length / 8))).fill('\t').join('');
	});
	try {
		if (prettyPrint) {
			console.error('<- %s', file);
		}
		const dir = dirname(file);
		if (!existsSync(dir)) {
			console.error('<+ %s', dir);
			mkdirpSync(dir);
		}
		writeFileSync(file, str, 'utf-8');
		return true;
	} catch (e) {
		console.error(e.message);
		return false;
	}
}
