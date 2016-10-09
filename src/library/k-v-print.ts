export class KeyValuePrinter {
	private _tag = [];
	private _value = [];
	private max = 0;
	
	tag(t) {
		t += ': ';
		this._tag.push(t);
		this.max = Math.max(this.max, t.length);
	}
	
	value(v) {
		this._value.push(v);
	}
	
	line(t, v) {
		this.tag(t);
		this.value(v);
	}
	
	out() {
		this._tag.forEach((tag, i) => {
			const space = (new Array(this.max - tag.length)).fill(' ').join('');
			
			console.log('%s%s%s', tag, space, this._value[i]);
		});
	}
}
