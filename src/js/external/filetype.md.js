
// filetype: Markdown
let Markdown = (exports => {

// markdown support
@import "./md/turnup.js"
@import "./md/turndown.js"
@import "./md/turndown-plugin-gfm.js"

let service = new TurndownService();
service.use(turndownPluginGfm.gfm);

exports.toHTML = turnUp;
exports.fromHTML = service.turndown.bind(service);

return exports;

})({});

