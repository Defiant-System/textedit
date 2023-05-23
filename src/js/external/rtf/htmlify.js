
// rewrite from; https://github.com/iarna/rtf-to-html

class RtfHtmlify {
	constructor (doc) {
		this.doc = doc;

		this.genericFontMap = {
			roman: "serif",
			swiss: "sans-serif",
			script: "cursive",
			decor: "fantasy",
			modern: "sans-serif",
			tech: "monospace",
			bidi: "serif"
		};

		this.defaults = {
			font: doc.style.font || { name: "Times", family: "roman" },
			fontSize: doc.style.fontSize || 24,
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			foreground: { red: 0, blue: 0, green: 0 },
			background: { red: 255, blue: 255, green: 255 },
			firstLineIndent: doc.style.firstLineIndent || 0,
			indent: 0,
			align: "left",
			valign: "normal",
			paraBreaks: "\n\n",
			paraTag: "p",
		};
	}

	// def() {
	// 	let str = [];
	// 	str.push(`<meta name="pageView" value="true"/>`);
	// 	str.push(`<meta name="hideRulers" value="false"/>`);
	// 	str.push(`<meta name="indents" value="[2,2,14.75]"/>`);
	// 	return `<def>${str.join("")}</def>`;
	// }

	// outputTemplate() {
	// 	let content = this.doc.content
	// 					.map(para => {
	// 						// console.log( para );
	// 						return this.renderPara(para);
	// 					})
	// 					.filter(html => html != null).join(this.defaults.paraBreaks);

	// 	return `<!DOCTYPE html>
	// 		<html>
	// 			<head>
	// 				<meta charset="UTF-8">
	// 				<style>
	// 				body {
	// 					margin-left: ${this.doc.marginLeft / 20}pt;
	// 					margin-right: ${this.doc.marginRight / 20}pt;
	// 					margin-top: ${this.doc.marginTop / 20}pt;
	// 					margin-bottom: ${this.doc.marginBottom / 20}pt;
	// 					font-size: ${this.defaults.fontSize / 2}pt;
	// 					text-indent: ${this.defaults.firstLineIndent / 20}pt;
	// 				}
	// 				</style>
	// 			</head>
	// 			<body>
	// 				--${content.replace(/\n/g, '\n    ')}--
	// 			</body>
	// 		</html>
	// 		`;
	// }

	render() {
		let content = this.doc.content
						.map(para => this.renderPara(para))
						.filter(html => html != null)
						.join(this.defaults.paraBreaks);
		
		// content += this.def();

		return content;
	}

	font(ft) {
		let name = ft.name.replace(/-\w+$/, "");
		let family = this.genericFontMap[ft.family];
		if (name === "ZapfDingbatsITC") return "";
		return "font-family: " + name + (family ? `, ${family}` : "");
	}

	colorEq(a, b) {
		return a.red === b.red && a.blue === b.blue && a.green === b.green;
	}

	CSS(chunk) {
		let css = "";
		if (chunk.style.foreground != null && !this.colorEq(chunk.style.foreground, this.defaults.foreground)) {
			css += `color: rgb(${chunk.style.foreground.red}, ${chunk.style.foreground.green}, ${chunk.style.foreground.blue});`;
		}
		if (chunk.style.background != null && !this.colorEq(chunk.style.background, this.defaults.background)) {
			css += `background-color: rgb(${chunk.style.background.red}, ${chunk.style.background.green}, ${chunk.style.background.blue});`;
		}
		if (chunk.style.firstLineIndent != null && chunk.style.firstLineIndent > 0 && chunk.style.firstLineIndent !== this.defaults.firstLineIndent) {
			css += `text-indent: ${chunk.style.firstLineIndent / 20}pt;`;
		}
		if (chunk.style.indent != null && chunk.style.indent !== this.defaults.indent) {
			css += `padding-left: ${chunk.style.indent / 20}pt;`;
		}
		if (chunk.style.align != null && chunk.style.align !== this.defaults.align) {
			css += `text-align: ${chunk.style.align};`;
		}
		if (chunk.style.fontSize != null && chunk.style.fontSize !== this.defaults.fontSize) {
			css += `font-size: ${chunk.style.fontSize / 2}pt;`;
		}
		if (!this.defaults.disableFonts && chunk.style.font != null && chunk.style.font.name !== this.defaults.font.name) {
			css += this.font(chunk.style.font);
		}
		return css;
	}

	styleTags(chunk) {
		let open = "";
		let close = "";
		if (chunk.style.italic != null && chunk.style.italic !== this.defaults.italic) {
			open += "<em>";
			close = "</em>" + close;
		}
		if (chunk.style.bold != null && chunk.style.bold !== this.defaults.bold) {
			open += "<strong>";
			close = "</strong>" + close;
		}
		if (chunk.style.strikethrough != null && chunk.style.strikethrough !== this.defaults.strikethrough) {
			open += "<s>";
			close = "</s>" + close;
		}
		if (chunk.style.underline != null && chunk.style.underline !== this.defaults.underline) {
			open += "<u>";
			close = "</u>" + close;
		}
		if (chunk.style.valign != null && chunk.style.valign !== this.defaults.valign) {
			if (chunk.style.valign === "super") {
				open += "<sup>";
				close = "</sup>" + close;
			} else if (chunk.style.valign === "sub") {
				open += "<sup>";
				close = "</sup>" + close;
			}
		}

		return {open, close};
	}

	renderPara(para) {
		if (!para.content || para.content.length === 0) return;
		let style = this.CSS(para);
		let tags = this.styleTags(para);
		let pdefaults = Object.assign({}, this.defaults);
		for (let item of Object.keys(para.style)) {
			if (para.style[item] != null) pdefaults[item] = para.style[item];
		}
		let paraTag = this.defaults.paraTag;
		return `<${paraTag}${style ? ' style="' + style + '"' : ""}>${tags.open}${para.content.map(span => this.renderSpan(span, pdefaults)).join("")}${tags.close}</${paraTag}>`;
	}

	renderSpan(span, defaults) {
		let style = this.CSS(span, defaults);
		let tags = this.styleTags(span, defaults);
		let value = `${tags.open}${span.value}${tags.close}`;
		if (style) {
			return `<span style="${style}">${value}</span>`;
		} else {
			return value;
		}
	}
}
