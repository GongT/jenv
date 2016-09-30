import MyError from "../library/error";
import {configSetPath} from "../library/path";
import {readIdFile} from "../library/id_file";
import {readdirSync, existsSync} from "fs";
import {resolve} from "path";
import {prettyPrint} from "../library/output";
import {requireCurrentConfigSet} from "../library/current";
import {getAllEnv} from "../actions/get-all-env";

export default function list(this: CmdLineConfig, type) {
	type = type.toLowerCase();
	switch (type) {
		case 'env':
			if (prettyPrint) {
				console.error('available environments in current config set:');
			}
			
			const envList: string[] = getAllEnv(requireCurrentConfigSet());
			envList.forEach((name) => {
				pretty(name)
			});
			break;
		case 'set':
			if (prettyPrint) {
				console.error('available config set in this system:');
			}
			const list = [];
			const [localStorage, homeStorage] = configSetPath('.');
			
			test_print(localStorage);
			readdirSync(homeStorage).forEach((name) => {
				test_print(resolve(homeStorage, name));
			});
			
			break;
		default:
			throw new MyError('Usage: \n   jenv --list set\n or\n   jenv --list env');
	}
	if (prettyPrint) {
		console.error('');
	}
}

function test_print(dir) {
	if (!existsSync(dir)) {
		return;
	}
	try {
		const name = readIdFile(dir).name;
		if (name) {
			pretty(name);
		}
	} catch (e) {
		console.error('invalid storage: %s', dir);
	}
}

function pretty(name) {
	if (prettyPrint) {
		process.stderr.write('\t');
	}
	console.log(name);
}
