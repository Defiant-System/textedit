
// filetype: Markdown
let Markdown = (exports => {

// markdown support
@import "../external/turnup.js"
@import "../external/turndown.js"
@import "../external/turndown-plugin-gfm.js"

let service = new TurndownService();
service.use(turndownPluginGfm.gfm);

exports.toHTML = turnUp;
exports.fromHTML = service.turndown;

return exports;

})({});
