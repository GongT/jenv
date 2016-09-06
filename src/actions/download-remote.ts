import {gitcheck, gitpull} from "../library/git";

export function downloadRemote(gitPath) {
	gitcheck(gitPath);
	
	gitpull(gitPath);
}
