import {gitremoteurl, gitpush} from "../library/git";

export function setRemote(path, newRemote) {
	gitremoteurl(path, 'origin', 'jsonenv', newRemote);
	
	gitpush(path, 'origin', 'jsonenv');
}
