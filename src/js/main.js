
const textEdit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());
	},
	async openFile(event) {
		// let file = await event.open();
		let file = {
			"file-1.txt": { "name": "file-1.txt", "text": "Lorem ipsum dolor sit amet, <b>consectetur adipiscing elit</b>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
			"file-2.txt": { "name": "file-2.txt", "text": "text 2" }
		};
		this.dispatch({ type: "tab-new", file: file[event.name] });
	},
	dispatch(event) {
		let Self = textEdit;
		// console.log(event);
		switch (event.type) {
			// system events
			case "open.file":
				Self.openFile(event);
				break;
			// custom events
			case "save-file":
				// window.dialog.save();
				break;
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
