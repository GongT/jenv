const fs = require('fs');

module.exports = function (targetFile) {
	const config = require(targetFile);
	
	const text = loopObject(config, 'IJsonEnv');
	
	const result = `// GENERATED FILE

module JsonEnv {
	${text}
}

namespace global {
	const JsonEnv:JsonEnv.IJsonEnv;
}
`;
	const dts = targetFile.replace(/\.js$/, '') + '.d.ts';
	console.log('<- %s', dts);
	fs.writeFileSync(dts, result, 'utf-8');
};

function subObject(k, v, prepend) {
	console.log('subObject:', k);
	const subName = 'I' + ucfirst(k) + 'Config';
	const subContent = loopObject(v, subName);
	
	prepend.push(subContent);
	
	return subName;
}

function subArray(k, v, prepend) {
	console.log('subArray:', k);
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

function loopObject(object, objectName) {
	console.log('loopObject:', objectName);
	const prepend = [];
	const content = [];
	
	Object.keys(object).forEach((k) => {
		const v = object[k];
		let t = typeof v;
		console.log('  -> ', k, ':', t);
		
		if (Array.isArray(v)) {
			t = subArray(k, v[0], prepend);
		} else if (t === 'object') {
			t = subObject(k, v, prepend);
		}
		
		content.unshift(`${k}: ${t};`);
	});
	
	return `${prepend.join('\n\t')}

interface ${objectName} {
	${content.join('\n\t')}
}`
}

function ucfirst(str) {
	if (!str) {
		return '';
	}
	return str[0].toUpperCase() + str.substr(1);
}
