
// rewrite from; https://github.com/iarna/rtf-parser

class RtfDocument extends RtfGroup {
	
	constructor() {
		super();
		this.charset = "ASCII";
		this.ignorable = false;
		this.marginLeft = 1800;
		this.marginRight = 1800;
		this.marginBottom = 1440;
		this.marginTop = 1440;
		this.style = {
			font: 0,
			fontSize: 24,
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			foreground: null,
			background: null,
			firstLineIndent: 0,
			indent: 0,
			align: "left",
			valign: "normal"
		};
	}

	get(name) {
		return this[name];
	}

	getFont(num) {
		return this.fonts[num];
	}

	getColor(num) {
		return this.colors[num];
	}

	getStyle(name) {
		if (!name) return this.style;
		return this.style[name];
	}

	addContent(node) {
		if (node instanceof RtfParagraph) {
			while (this.content.length && !(this.content[this.content.length - 1] instanceof RtfParagraph)) {
				node.content.unshift(this.content.pop());
			}
			super.addContent(node);
			if (node.content.length) {
				let initialStyle = node.content[0].style;
				let style = {};
				style.font = this.getFont(initialStyle.font);
				style.foreground = this.getColor(initialStyle.foreground);
				style.background = this.getColor(initialStyle.background);
				for (let prop of Object.keys(initialStyle)) {
					if (initialStyle[prop] == null) continue;
					let match = true;
					for (let span of node.content) {
						if (initialStyle[prop] !== span.style[prop]) {
							match = false;
							break;
						}
					}
					if (match) style[prop] = initialStyle[prop];
				}
				node.style = style;
			}
		} else {
			super.addContent(node);
		}
	}
}
