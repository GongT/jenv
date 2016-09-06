import {readJsonFile} from "../library/json";
import {resolve} from "path";
import MyError from "../library/error";
import {findConfigSetPath} from "../library/path";
import {readIdFile} from "../library/id_file";

let cache;
export function getEnvironmentMetaData(setName, environment): EnvironmentMetaData {
	if(!environment){
		return {};
	}
	if (!cache) {
		const setPath = findConfigSetPath(setName);
		cache = readIdFile(setPath);
	}
	
	if (!cache.environments[environment]) {
		throw new MyError(`environment "${environment}" not defined`);
	}
	
	return {
		configSet: setName,
		name: environment,
		inherits: cache.environments[environment].inherits,
		abstract: cache.environments[environment].abstract,
	};
}

export interface EnvironmentMetaData {
	abstract?: boolean;
	configSet?: string;
	name?: string;
	inherits?: string|boolean;
}
