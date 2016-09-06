import {gitcheck, gitadd, gitcommit, gitpush} from "../library/git";
export function uploadRemote(gitPath) {
	gitcheck(gitPath);
	
	gitadd(gitPath);
	
	gitcommit(gitPath, 'manual upload');
	
	gitpush(gitPath, 'origin', 'jsonenv');
}
