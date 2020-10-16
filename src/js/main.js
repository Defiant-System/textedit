
const textEdit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());
	},
	async dispatch(event) {
		let Self = textEdit;
		// console.log(event);
		switch (event.type) {
			// system events
			case "open.file":
				break;
			case "save-file":
				break;
			// custom events
			case "tab-new":
			case "tab-clicked":
			case "tab-close":
				Self.tabs.dispatch(event);
				break;
			case "query-command-state":
			case "format":
			case "format-fontSize":
			case "format-fontName":
				Self.queryCommand.dispatch(event);
				break;
		}
	},
	tabs: defiant.require("./tabs.js"),
	queryCommand: defiant.require("./queryCommand.js"),
};

window.exports = textEdit;
