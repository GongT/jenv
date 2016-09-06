import {resolve} from "path";
var osLocale = require('os-locale');

let callback = [];
export default function installI18N(cb) {
	if (global.t) {
		cb();
	} else {
		callback.push(cb);
	}
}

osLocale((err, locale) => {
	if (err) {
		throw err;
	}
	
	locale = locale.toLowerCase().replace(/_/g, '-');
	if (locale === 'posix') {
		locale = 'en-us';
	}
	
	let langFile = localeFilePath(locale);
	if (!require('fs').existsSync(require('path').resolve(__dirname, langFile))) {
		console.warn(`Warn: no language file for ${locale}, fallback to en.`);
		locale = 'en-us';
		langFile = localeFilePath(locale);
	}
	
	global.t = getTextFn(locale, require(langFile));
	callback.forEach((cb) => {
		cb();
	});
});

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
	return resolve(__dirname, `../../../i18n/${locale}.json`);
}
