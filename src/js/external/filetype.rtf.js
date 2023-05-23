
// filetype: RTF
let Rtf = (exports => {

// RTF to Document object
@import "./rtf/group.js"
@import "./rtf/color-table.js"
@import "./rtf/document.js"
@import "./rtf/font-table.js"
@import "./rtf/font.js"
@import "./rtf/interpreter.js"
@import "./rtf/paragraph.js"
@import "./rtf/parser.js"
@import "./rtf/span.js"

let toHTML = instr => {
	let doc = new RtfDocument;
	let interpreter = new RtfInterpreter(doc);
	let parser = new RtfParser(interpreter);

	console.log( parser );

	return "<p>Parsing...</p>";
};

exports.toHTML = toHTML;
exports.fromHTML = inStr => inStr;

return exports;

})({});
