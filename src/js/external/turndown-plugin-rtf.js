
// Rich Text Formatting

var turndownPluginRtf = (function (exports) {

var rules = {};

function strikethrough (turndownService) {
	turndownService.addRule("strikethrough", {
		filter: ["del", "s", "strike"],
		replacement: function (content) {
			return '~' + content + '~'
		}
	});
}

function rtf (turndownService) {
	turndownService.use([
		strikethrough
	]);
}

exports.rtf = rtf;

return exports;

}({}));
