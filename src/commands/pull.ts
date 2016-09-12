import usage from "../actions/usage";
import {fetchConfigSet} from "../actions/fetch-configset";
import {setCurrentConfigSet} from "../actions/current-config";

export default function pull(this:CmdLineConfig, gitUrl) {
	if (!gitUrl) {
		throw usage();
	}
	const { name, path } = fetchConfigSet(gitUrl, this.global, this.force);
	console.log('pull success: the config set is saved to %s', path);
	return setCurrentConfigSet(name);
}
