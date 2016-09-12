import {setCurrentConfigSet, getCurrentConfigSet} from "../actions/current-config";
import {getLocalConfigName} from "../actions/get-local-configset-name";
import {requireConfigSetPath} from "../library/path";
import MyError from "../library/error";

export default function set(this:CmdLineConfig, configSetName) {
	if (configSetName) {
		if ('local' === configSetName) {
			configSetName = getLocalConfigName();
		}
		requireConfigSetPath(configSetName);
		console.log('set current configset to %s', configSetName);
		return setCurrentConfigSet(configSetName);
	} else {
		if (getCurrentConfigSet()) {
			console.log(getCurrentConfigSet());
			return true;
		} else {
			console.log('no config set');
			return false;
		}
	}
}
