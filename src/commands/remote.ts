import MyError from "../library/error";
import {setRemote} from "../actions/set-remote";
import {requireConfigSetPath} from "../library/path";

export default function remote(configSetName, remoteUrl) {
	if (remoteUrl === undefined) {
		if (/^[a-zA-Z0-9\-_]+$/.test(configSetName)) {
			throw new MyError('env name must be /[a-zA-Z0-9\-_]+/');
		}
		remoteUrl = configSetName;
		configSetName = undefined;
	}
	return setRemote(requireConfigSetPath(configSetName), remoteUrl);
}
