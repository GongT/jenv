import {createHash} from 'crypto';

export function ucfirst(str) {
	if (!str) {
		return '';
	}
	return str[0].toUpperCase() + str.substr(1);
}

export function md5(str) {
	return createHash('md5').update(str).digest("hex");
}

export function constant_name_style(str) {
	if (str.toUpperCase() === str) {
		return str;
	}
	return str.replace(/([a-z])([A-Z])/g, (m0, first, next) => {
		return `${first}_${next.toUpperCase()}`;
	}).toUpperCase();
}

export function c_style(str) {
	return str.replace(/([0-9a-zA-Z])([A-Z])/g, (m0, first, next) => {
		return `${first}_${next.toLowerCase()}`;
	}).toUpperCase();
}
