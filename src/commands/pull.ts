import usage from "../actions/usage";
import {fetchConfigSet} from "../actions/fetch-configset";
import {setCurrentConfigSet} from "../actions/current-config";

export default function pull(this: CmdLineConfig, gitUrl):number {
	if (!gitUrl) {
		throw usage();
	}
	try {
		const {name, path} = fetchConfigSet(gitUrl, this.global, this.force);
		console.log('pull success: the config set is saved to %s', path);
		if (setCurrentConfigSet(name)) {
			return 0;
		} else {
			return 1
		}
	} catch (e) {
		console.error(e.stack);
		console.error(`

the remote url is not a valid json-env storage: "${gitUrl}".
also maybe network error occurred, check logs above.`);
		return 1;
	}
}
