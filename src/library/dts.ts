import {ucfirst} from "./strings";
import {readJsonFile} from "./json";
import {prettyPrint} from "./output";
const fs = require('fs');

export function generateDefineTs(targetFile) {
	const config = readJsonFile(targetFile);
	
	const mainGen = new TypescriptDeclarationGenerator(config, 'JsonEnv');
	const envGen = new TypescriptDeclarationGenerator(config['.ENVIRONMENT'], 'ProcessEnv');
	
	const result = `// GENERATED FILE

declare module JsonEnvConfigModule {
	type UndefinedType = undefined;
	type NumberType = number;
	type BooleanType = boolean;
	type StringType = string;
	type SymbolType = symbol;
	
${mainGen.interfaces.replace(/^/mg, '\t')}
	
${envGen.interfaces.replace(/^/mg, '\t')}
}

declare const JsonEnv: JsonEnvConfigModule.${mainGen.mainType};
declare namespace NodeJS {
	export interface Global {
		JsonEnv: JsonEnvConfigModule.${mainGen.mainType};
	}
	/* export interface Process {
		env: ${envGen.mainType};
	}*/
}
`;
	const dts = targetFile.replace(/\.js$/, '') + '.d.ts';
	if (prettyPrint) {
		console.error('<- %s', dts);
	}
	fs.writeFileSync(dts, result, 'utf-8');
}

export class TypescriptDeclarationGenerator {
	private nameRegistry: {[n: string]: boolean} = {};
	private objectPathStack: string[] = [];
	private objectStack: any[] = [];
	private current: any;
	private currentName: string;
	private interfaceList: string[] = [];
	
	public readonly mainType: string;
	public readonly interfaces: string;
	
	constructor(object: {[id: string]: any}, name: string) {
		this.current = object;
		this.currentName = name;
		
		const type = this.createObjectType();
		
		this.interfaces = this.interfaceList.join('\n\n');
		this.mainType = type;
	}
	
	private createObjectType(type?) {
		const objectName = this.createUniqueName(type);
		
		this.interfaceList.unshift(`interface ${objectName} {
	${this.createObjectDefine()}
}`);
		
		return objectName;
	}
	
	private createDefineLine(i) {
		const key = TypescriptDeclarationGenerator.wrapKey(i);
		let type = '', comment = '';
		if (this.currentBasicType()) {
			type = this.currentBasicType();
			comment = ' // = ' + this.current;
		} else {
			type = this.currentComplexType();
		}
		
		return `${key}: ${type};${comment}`;
	}
	
	private createObjectDefine() {
		const fields = [];
		
		for (let i in this.current) {
			if (!this.current.hasOwnProperty(i)) {
				continue;
			}
			if (/^\./.test(i)) {
				continue;
			}
			
			this.moveIn(i);
			
			fields.push(this.createDefineLine(i));
			
			this.moveOut();
		}
		
		return fields.join('\n\t');
	}
	
	private moveIn(name, push = true) {
		if (push) {
			this.objectPathStack.push(this.currentName);
			this.currentName = name;
		} else {
			this.objectPathStack.push(this.currentName);
		}
		
		this.objectStack.push(this.current);
		this.current = this.current[name];
	}
	
	private moveOut(pop = true) {
		if (pop) {
			this.currentName = this.objectPathStack.pop();
		} else {
			this.objectPathStack.pop();
		}
		
		this.current = this.objectStack.pop();
	}
	
	private createUniqueName(type: string = 'Config') {
		let result = this.currentName;
		process.stderr.write(`[${this.objectPathStack.join(',')}]${result}:  `);
		const stack = this.objectPathStack.slice();
		let createdName = TypescriptDeclarationGenerator.wrapJsName(`${result}${type}`);
		while (this.nameRegistry[createdName]) {
			result = (stack.pop() || '') + '_' + result;
			createdName = TypescriptDeclarationGenerator.wrapJsName(`${result}${type}`);
		}
		console.error(createdName);
		
		this.nameRegistry[createdName] = true;
		return createdName;
	}
	
	private currentBasicType(): string {
		if (this.current === null) {
			return 'NullType';
		}
		if (this.current === undefined) {
			return 'UndefinedType';
		}
		if (Array.isArray(this.current) || typeof this.current === 'object') {
			return null;
		}
		return (typeof this.current).replace(/^[a-z]/, e => e.toUpperCase()) + 'Type';
	}
	
	private currentComplexType() {
		if (Array.isArray(this.current)) {
			if (this.current[0]) {
				let ret;
				this.moveIn(0, false);
				if (this.currentBasicType()) {
					ret = this.currentBasicType() + '[]';
				} else {
					ret = this.currentComplexType();
				}
				this.moveOut(false);
				return ret;
			} else {
				return 'any[]';
			}
		} else {
			return this.createObjectType();
		}
	}
	
	private static wrapKey(n) {
		if (/^[a-z_$][a-z_$0-9]*$/i.test(n)) {
			return n;
		} else {
			return JSON.stringify(n);
		}
	}
	
	private static wrapJsName(s: string) {
		s = ucfirst(s);
		s = s.replace(/[-_]([a-z])/g, function (m0, chr) {
			return chr.toUpperCase();
		});
		return 'I' + s;
	}
}
