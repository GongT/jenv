import {resolve} from "path";
import {existsSync} from "fs";
const osLocale = require('os-locale').sync;

let locale;
export default function installI18N() {
	if (locale) {
		return;
	}
	locale = osLocale();
	locale = locale.toLowerCase().replace(/_/g, '-');
	if (locale === 'posix') {
		locale = 'en-us';
	}
	
	let langFile = localeFilePath(locale);
	if (!existsSync(require('path').resolve(__dirname, langFile))) {
		console.warn(`Warn: no language file for ${locale}, fallback to en.`);
		locale = 'en-us';
		langFile = localeFilePath(locale);
	}
	global.t = getTextFn(locale, require(langFile));
}

function getTextFn(locale, data) {
	return (text) => {
		if (data.hasOwnProperty(text)) {
			return data[text];
		} else {
			console.warn(`Warn: no translate for text "${text}" in ${locale}.`);
			return text.toUpperCase();
		}
	};
}

function localeFilePath(locale) {
	return resolve(__dirname, `../../i18n/${locale}.json`);
}
