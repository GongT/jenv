import {ucfirst, constant_name_style} from "./strings";
import {readJsonFile} from "./json";
import {prettyPrint} from "./output";
const fs = require('fs');

export function generateDefineTs(targetFile) {
	const config = readJsonFile(targetFile);
	
	const text = loopObject(config, 'IJsonEnv');
	const envText = envObject(config['.ENVIRONMENT'], 'IJsonProcessEnv');
	
	const result = `// GENERATED FILE

declare module JsonEnvConfigModule {
	${text.replace(/\n/g, '\n\t')}

	${envText.replace(/\n/g, '\n\t')}
}

interface IProcessEnv extends JsonEnvConfigModule.IJsonProcessEnv {
	[id: string]: string;
}

declare const JsonEnv: JsonEnvConfigModule.IJsonEnv;
declare namespace NodeJS {
	export interface Global {
		JsonEnv: JsonEnvConfigModule.IJsonEnv;
	}
	/*export interface Process {
		env: IProcessEnv;
	}*/
}
`;
	const dts = targetFile.replace(/\.js$/, '') + '.d.ts';
	if (prettyPrint) {
		console.error('<- %s', dts);
	}
	fs.writeFileSync(dts, result, 'utf-8');
}

function subObject(k, v, prepend) {
	// console.log('subObject:', k);
	const subName = 'I' + wrapJsName(k) + 'Config';
	const subContent = loopObject(v, subName);
	
	prepend.push(subContent);
	
	return subName;
}

function subArray(k, v, prepend) {
	// console.log('subArray:', k);
	let t = typeof v, typeDeclare;
	const subName = 'I' + ucfirst(k) + 'Array';
	
	if (v === null || v === undefined) {
		t = 'null';
	}
	
	if (Array.isArray(v)) {
		t = subArray(k, v[0], prepend);
	} else if (t === 'object') {
		t = subObject(k + 'Child', v, prepend);
	}
	
	return `[${t}]`;
}

function envObject(object, objectName) {
	// console.log('envObject:', objectName);
	const content = [];
	
	Object.keys(object).forEach((k) => {
		const key = constant_name_style(k);
		const v = object[k];
		let t = typeof v;
		// console.log('  -> ', k, ':', t);
		
		content.unshift(`${wrapKey(key)}: string; // = ${JSON.stringify('' + v)};`);
	});
	
	return `interface ${objectName} {
	${content.join('\n\t')}
}`
}

function loopObject(object, objectName) {
	// console.log('loopObject:', objectName);
	const prepend = [];
	const content = [];
	
	Object.keys(object).forEach((k) => {
		if (/^\./.test(k)) {
			return;
		}
		const v = object[k];
		let t = typeof v;
		// console.log('  -> ', k, ':', t);
		
		if (Array.isArray(v)) {
			t = subArray(k, v[0], prepend);
		} else if (t === 'object') {
			t = subObject(k, v, prepend);
		}
		
		content.unshift(`${wrapKey(k)}: ${t};`);
	});
	
	return `${prepend.join('\n\t')}

interface ${objectName} {
	${content.join('\n\t')}
}`
}

function wrapKey(n) {
	if (/^[a-z_$][a-z_$0-9]*$/i.test(n)) {
		return n;
	} else {
		return JSON.stringify(n);
	}
}
function wrapJsName(s: string) {
	s = ucfirst(s);
	s = s.replace(/[-_]([a-z])/g, function (m0, chr) {
		return chr.toUpperCase();
	});
	return s;
}
