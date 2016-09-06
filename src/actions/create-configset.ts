import {rmdirsSync} from "nodejs-fs-utils";
import {sync as mkdirpSync} from "mkdirp";
import {existsSync, writeFileSync} from "fs";
import {dirname, resolve} from "path";

import {getLocalConfigName} from "./get-local-configset-name";
import {setCurrentConfigSet} from "./current-config";
import MyError from "../library/error";
import {writeJsonFile} from "../library/json";
import {configSetPath} from "../library/path";
import {newEnvironment} from "./new-env";
import {gitinit, gitbranch_rename, gitadd, gitcommit} from "../library/git";

export function createConfigSet(name, global) {
	const targetPath = configSetPath(name, global || false);
	if (existsSync(targetPath)) {
		throw new MyError(`target path ${targetPath} is already exists, please remove it first.`);
	}
	mkdirpSync(dirname(targetPath));
	
	try {
		gitinit(targetPath);
		
		const installFile = resolve(targetPath, 'environments.json');
		writeJsonFile(installFile, {
			name: name,
			environments: {}
		});
		
		newEnvironment(targetPath, 'default', false);
		
		const gitignoreFile = resolve(targetPath, '.gitignore');
		writeFileSync(gitignoreFile, `
.idea
`, 'utf-8');
		
		gitadd(targetPath);
		
		gitcommit(targetPath, 'init json env storage');
		
		gitbranch_rename(targetPath, 'jsonenv');
	} catch (e) {
		rmdirsSync(targetPath);
		throw e;
	}
	setCurrentConfigSet(getLocalConfigName());
	return targetPath;
}
