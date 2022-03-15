
@import "./external/turnDown.js";

@import "./classes/file.js"
@import "./classes/edit.js"
@import "./classes/selection.js"

@import "./modules/files.js"
// @import1 "./modules/queryCommand.js"
// @import1 "./modules/tabs.js"


const textedit = {
	init() {
		// fast references
		this.content = window.find("content");

		// setTimeout(() => this.dispatch({ type: "save-file-as" }), 700);
		// setTimeout(() => this.dispatch({ type: "open-file" }), 700);
	},
	async dispatch(event) {
		let Self = textedit,
			file = Files.activeFile,
			active,
			blob;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				// reset app by default - show initial view
				Files.dispatch({ type: "new-file" });
				break;
			case "open.file":
				event.open({ responseType: "text" })
					.then(file => Files.dispatch({ type: "open-file", file }));
				break;
			// custom events
			case "new-file":
				break;
			case "open-file":
				break;
			case "save-file":
				// update file
				blob = file.toBlob();
				window.dialog.save(file._file, blob);
				break;
			case "save-file-as":
				break;
		}
	}
};

window.exports = textedit;
