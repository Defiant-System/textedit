
// https://github.com/domchristie/turndown
@import "./modules/turnDown.js";


const textEdit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// this.dispatch({ type: "tab-new" });

		setTimeout(() => this.dispatch({ type: "save-file-as" }), 500);
	},
	dispatch(event) {
		let Self = textEdit,
			file;
		// console.log(event);
		switch (event.type) {
			// system events
			case "open.file":
				event.open().then(file =>
					Self.dispatch({ type: "tab-new", file }));
				break;
			// custom events
			case "save-file":
				file = Self.tabs.active.file;
				// update file
				file.text = Self.tabs.active.editor.html();
				file.save();
				// window.dialog.save({ ...file, silent: true });
				break;
			case "save-file-as":
				file = Self.tabs.active.file;
				// update file
				file.text = Self.tabs.active.editor.html();
				// pass on available file types
				window.dialog.save({
					...file,
					types: {
						txt: () => file.text.stripHtml(),
						html: () => file.text,
						md: () => {
							let service = new TurndownService();
							return service.turndown(file.text);
						},
					}
				});
				break;
			case "new-file":
			case "tab-new":
			case "tab-clicked":
			case "tab-close":
				Self.tabs.dispatch(event);
				break;
			case "query-command-state":
			case "format":
			case "format-fontSize":
			case "format-fontName":
			case "select-all":
			case "window.keyup":
				Self.queryCommand.dispatch(event);
				break;
		}
	},
	tabs:         @import "./modules/tabs.js",
	undoStack:    @import "./modules/undoStack.js",
	queryCommand: @import "./modules/queryCommand.js",
};

window.exports = textEdit;
