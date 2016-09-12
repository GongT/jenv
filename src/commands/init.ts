import usage from "../actions/usage";
import {createConfigSet} from "../actions/create-configset";
import remote from "./remote";
import set from "./set";

export default function init(this: CmdLineConfig, newName, gitUrl) {
	if (!newName) {
		throw usage();
	}
	if (newName === 'local' || newName === 'default') {
		console.error(`you can't use %s as name`, newName);
		return false;
	}
	
	const savePath = createConfigSet(newName, this.global);
	
	console.log('new config set saved to %s', savePath);
	
	if (gitUrl) {
		remote.call(this, newName, gitUrl);
	} else {
		console.log('  configure remote storage with "jenv --remote git@github.com:/yourname/yourproject"');
	}
	
	if (!this['no-default']) {
		set.call(this, newName);
	}
	
	return !!savePath;
}
