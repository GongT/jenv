import MyError from "./error";
import {nodeSpawnSync, nodeExecSync} from "./spawn-sync";
import {sync as mkdirpSync} from "mkdirp";

export function gitcheck(path) {
	const ret = nodeExecSync(`git branch --color=never`, path);
	if (!/\* jsonenv/.test(ret)) {
		throw new MyError(`refuse to run in path ${path}: not a git repo on "jsonenv" branch`);
	}
}
export function gitpull(dir, url?) {
	const arg = ['pull'];
	if (url) {
		arg.push(url);
	}
	if (!nodeSpawnSync('git', arg, dir)) {
		throw new MyError(`can't run "git pull" command.`);
	}
}
export function gitadd(dir, files = '.') {
	const ret = nodeSpawnSync('git', ['add', files], dir);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}

export function gitcommit(dir, message = 'empty commit message') {
	if (/working directory clean/.test(nodeExecSync('git status', dir))) {
		return true;
	}
	const ret = nodeSpawnSync('git', ['commit', '-a', '-m', message], dir);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}

export function gitremoteurl(dir, name, branch, url) {
	if (!nodeSpawnSync('git', ['remote', 'add', name, '--no-tags', '-t', branch, url], dir)) {
		if (!nodeSpawnSync('git', ['remote', 'set-url', name, url], dir)) {
			throw new MyError('run git command failed. (see above)');
		}
	}
}

export function gitremote(path) {
	return nodeExecSync(`git remote get-url origin`, path);
}

export function gitpush(dir, remote, branch) {
	if (!nodeSpawnSync('git', ['push', '--set-upstream', remote, branch], dir)) {
		throw new MyError(`can't run "git push" command.`);
	}
}

export function gitinit(targetPath) {
	const ret = nodeSpawnSync('git', ['init', targetPath]);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}

export function gitbranch_rename(path, newName) {
	const ret = nodeSpawnSync('git', ['branch', '-M', newName], path);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}

export function gitbranch(path, branch) {
	const ret = nodeSpawnSync('git', ['branch', branch], path);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}

export function gitclone(path, url, branch) {
	mkdirpSync(path);
	const ret = nodeSpawnSync('git', ['clone', '-b', branch, '--single-branch', url, '.'], path);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
}
