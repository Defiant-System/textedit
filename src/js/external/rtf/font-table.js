
// rewrite from; https://github.com/iarna/rtf-parser

class FontTable extends RtfGroup {
	
	constructor (parent) {
		super(parent);
		this.table = [];
		this.currentFont = { family: "roman", charset: "ASCII", name: "Serif" };
	}

	addContent (text) {
		this.currentFont.name += text.value.replace(/;\s*$/, "");
	}
}
