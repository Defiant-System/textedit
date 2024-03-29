
// filetype: RTF
let Rtf = (exports => {

// RTF to Document object
@import "./rtf/htmlify.js"
@import "./rtf/group.js"
@import "./rtf/color-table.js"
@import "./rtf/document.js"
@import "./rtf/font-table.js"
@import "./rtf/font.js"
@import "./rtf/interpreter.js"
@import "./rtf/paragraph.js"
@import "./rtf/parser.js"
@import "./rtf/span.js"

let toHTML = str => {
	let doc = new RtfDocument;
	let interpreter = new RtfInterpreter(doc);
	let parser = new RtfParser(interpreter);

	// str = '{\\rtf1\\ansi\\b hi there\\b0}';
	let rtfdoc = parser.parse(str);
	let htmlify = new RtfHtmlify(rtfdoc);

	// console.log( rtfdoc );
	// console.log( htmlify.render() );

	return htmlify.render();
};

exports.toHTML = toHTML;
exports.fromHTML = inStr => inStr;

return exports;

})({});
