
// filetype: Markdown
let Markdown = (exports => {

// markdown support
@import "./md/turnup.js"
@import "./md/turndown.js"
@import "./md/turndown-plugin-gfm.js"

let opt = {
		hr: "---",
		fence: "```",
		codeBlockStyle: "fenced",
	};
let service = new TurndownService(opt);
service.use(turndownPluginGfm.gfm);

exports.toHTML = turnUp;
exports.fromHTML = service.turndown.bind(service);

return exports;

})({});

