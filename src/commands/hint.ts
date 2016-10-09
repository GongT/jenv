import {KeyValuePrinter} from "../library/k-v-print";
import {existsSync} from "fs";
export default function () {
	const printer = new KeyValuePrinter;
	
	printer.tag('enabled');
	if (!process.env.JENV_FILE_NAME) {
		printer.value('NO');
		return printer.out();
	}
	printer.value('YES');
	printer.line('config file', process.env.JENV_FILE_NAME);
	
	printer.tag('file exists');
	if (!existsSync(process.env.JENV_FILE_NAME)) {
		printer.value('NO');
		return printer.out();
	}
	printer.value('YES');
	
	printer.tag('parse ok');
	let data;
	try {
		data = require(process.env.JENV_FILE_NAME);
		printer.value('YES');
	} catch (e) {
		printer.value('NO');
		return printer.out();
	}
	
	const cfg = data.__config || {};
	printer.line('config set', cfg.set);
	printer.line('config set', cfg.env);
	
	return printer.out();
}

