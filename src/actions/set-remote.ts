import {gitremoteurl, gitpush, gitadd, gitcommit} from "../library/git";

export function setRemote(path, newRemote) {
	gitremoteurl(path, 'origin', 'jsonenv', newRemote);
	
	gitadd(path);
	
	gitcommit(path, 'set-remote');
	
	gitpush(path, 'origin', 'jsonenv');
}
