import * as extend from 'extend';
import {readdirSync, lstatSync, existsSync} from "fs";
import {resolve} from "path";

import MyError from '../library/error';
import {getCurrentConfigSet} from './current-config';
import {writeJsonFile, readJsonFile} from "../library/json";
import {generateDefineTs} from "../library/dts";
import {getEnvironmentMetaData} from "./get-env-meta";
import {findConfigSetPath} from "../library/path";

const TEMP_FILE = resolve(process.cwd(), './.jsonenv/', `_current_result.json`);

export default function readEnvSync(environment) {
	const result: JsonEnv = {
		JENV_FILE_NAME: TEMP_FILE,
		JENV_FILE_NAME_REL: TEMP_FILE.replace(process.cwd() + '', '.'),
	};
	
	const setName = getCurrentConfigSet();
	if (!setName) {
		throw new MyError('config set has not define, use "jenv --set" or "jenv --pull" to set it.');
	}
	
	const setPath = findConfigSetPath(setName);
	if (!setPath) {
		throw new MyError(`config set "${setName}" do not exists`);
	}
	
	let meta = getEnvironmentMetaData(setName, environment);
	if (meta.abstract) {
		throw new MyError(`config set "${setName}" is abstract`);
	}
	const inheritList = [environment];
	if (meta.inherits) {
		while (meta.inherits) {
			inheritList.push(meta.inherits);
			meta = getEnvironmentMetaData(setPath, meta.inherits);
		}
	}
	
	parseFolder(result, setPath, inheritList.reverse());
	
	writeJsonFile(TEMP_FILE, result);
	generateDefineTs(TEMP_FILE);
	
	return result;
}

function getFileContent(dir, environmentList: string[]) {
	const ret = {};
	
	let found = false;
	environmentList.forEach(function (environment) {
		const confFile = resolve(dir, `${environment}.json`);
		if (existsSync(confFile)) {
			found = true;
			console.error('-> %s', confFile);
			extend(ret, readJsonFile(confFile));
		}
	});
	
	if (!found) {
		throw new Error(`required config file "${dir}/[${environmentList.join(', ')}].json" not found.`);
	}
	
	return ret;
}

function parseFolder(itr, dir, environmentList) {
	if (existsSync(resolve(dir, '.root'))) {
		
	} else {
		extend(true, itr, getFileContent(dir, environmentList));
	}
	readdirSync(dir).forEach((name) => {
		if (/^\./.test(name)) {
			return;
		}
		const subFile = resolve(dir, name);
		if (lstatSync(subFile).isDirectory()) {
			itr[name] = {};
			parseFolder(itr[name], subFile, environmentList);
		}
	});
}