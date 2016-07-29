var osLocale = require('os-locale');

let callback = [], t;
module.exports = (cb) => {
	if (t) {
		cb(t);
	} else {
		callback.push(cb);
	}
};

osLocale((err, locale) => {
	if (err) {
		throw err;
	}
	
	locale = locale.toLowerCase();
	
	let langFile = `../i18n/${locale}.json`;
	if (!require('fs').existsSync(require('path').resolve(__dirname, langFile))) {
		console.warn(`Warn: no language file for ${locale}, fallback to en.`);
		locale = 'en';
		langFile = `../i18n/${locale}.json`;
	}
	
	t = getTextFn(locale, require(langFile));
	callback.forEach((cb) => {
		cb(t);
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
