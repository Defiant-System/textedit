
// File Document Setup

var turndownPluginFds = (function (exports) {

var rules = {};

function fds (turndownService) {
	turndownService.use([
		taskListItems
	]);
}

exports.fds = fds;

return exports;

}({}));
