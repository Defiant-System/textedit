
// rewrite from; https://github.com/iarna/rtf-parser

class ColorTable extends RtfGroup {

	constructor (parent) {
		super(parent);
		this.table = [];
		this.red = 0;
		this.blue = 0;
		this.green = 0;
	}

	addContent (text) {
		this.table.push({
			red: this.red,
			blue: this.blue,
			green: this.green
		});
		this.red = 0;
		this.blue = 0;
		this.green = 0;
	}
}
