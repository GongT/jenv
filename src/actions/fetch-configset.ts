import {rmdirsSync, moveSync}from 'nodejs-fs-utils';
import {existsSync} from "fs";
import {tmpdir} from "os";
import {join, dirname} from "path";
import {sync as mkdirpSync} from "mkdirp";

import {setCurrentConfigSet} from "./current-config";
import MyError from "../library/error";
import {configSetPath} from "../library/path";
import {readIdFile} from "../library/id_file";
import {gitclone} from "../library/git";

export function fetchConfigSet(git_url, global, force) {
	const tempPath = join(tmpdir(), 'jenv_fetch_temp', git_url);
	if (!existsSync(tempPath)) {
		mkdirpSync(dirname(tempPath));
		
		gitclone(tempPath, git_url, 'jsonenv');
	}
	
	const config = readIdFile(tempPath);
	const configSetName = config.name;
	// temp prepare ok
	
	const targetPath = configSetPath(configSetName, global);
	if (existsSync(targetPath)) {
		if (!force) {
			const exists_config = readIdFile(targetPath);
			if (exists_config.name === configSetName) {
				force = true;
			}
		}
		if (force) {
			rmdirsSync(targetPath);
		} else {
			throw new MyError(`target path ${targetPath} is already exists, please remove it first.`);
		}
	}
	mkdirpSync(dirname(targetPath));
	
	moveSync(tempPath, targetPath);
	
	setCurrentConfigSet(configSetName);
	return {name: configSetName, path: targetPath};
}
