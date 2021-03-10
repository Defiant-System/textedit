
// https://github.com/domchristie/turndown
@import "./modules/turnDown.js";


const textedit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// let file = new defiant.File();
		// this.dispatch({ type: "tab-new", file });

		// setTimeout(() => this.dispatch({ type: "save-file-as" }), 700);
		// setTimeout(() => this.dispatch({ type: "open-file" }), 700);
	},
	async dispatch(event) {
		let Self = textedit,
			file;
		// console.log(event);
		switch (event.type) {
			// system events
			case "open.file":
				event.open({ responseType: "text" })
					.then(file => Self.dispatch({ type: "tab-new", file }));
				break;
			// custom events
			case "open-file":
				window.dialog.open({
					txt: item =>
						item.open({ responseType: "text" })
							.then(file => Self.dispatch({ type: "tab-new", file })),
					md: item =>
						item.open({ responseType: "text" })
							.then(file => Self.dispatch({ type: "tab-new", file }))
				});
				break;
			case "save-file":
				file = Self.tabs.active.file;
				// update file
				file.data = Self.tabs.active.editor.html();
				file.save();
				break;
			case "save-file-as":
				file = Self.tabs.active.file;
				// update file
				file.data = Self.tabs.active.editor.html();
				// pass on available file types
				window.dialog.saveAs(file, {
					txt: () => new Blob([file.data.stripHtml()], { type: "text/plain" }),
					html: () => new Blob([file.data], { type: "text/html" }),
					md: () => {
						let service = new TurndownService();
						let blob = new Blob([service.turndown(file.data)], { type: "text/markdown" })
						return blob;
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

window.exports = textedit;
