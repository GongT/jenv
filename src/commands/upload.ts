import {uploadRemote} from "../actions/upload-remote";
import {requireConfigSetPath} from "../library/path";
export default function upload(this:CmdLineConfig, configSetName) {
	return uploadRemote(requireConfigSetPath(configSetName));
}
