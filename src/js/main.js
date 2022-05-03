
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
			fnOpen,
			active,
			blob;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				// show initial view: new file
				Self.dispatch({ type: "new-file" });
				break;
			case "open.file":
				if (!Files.getFileByPath(event.path)) {
					event.open({ responseType: "text" })
						.then(file => Files.dispatch({ type: "open-file", file }));
				}
				break;
			// custom events
			case "new-file":
				// reset app by default - show initial view
				Files.dispatch({ type: "new-file" });
				break;
			case "open-file":
				fnOpen = item => item.open({ responseType: "text" })
									.then(file => Files.dispatch({ type: "open-file", file }));
				window.dialog.open({
					txt: fnOpen,
					md: fnOpen,
				});
				break;
			case "save-file":
				if (!file._file.xNode) {
					return Self.dispatch({ type: "save-file-as" });
				}
				// update file
				blob = file.toBlob();
				window.dialog.save(file._file, blob);
				break;
			case "save-file-as":
				// pass on available file types
				window.dialog.saveAs(file._file, {
					txt:  () => file.toBlob("txt"),
					html: () => file.toBlob("html"),
					md:   () => file.toBlob("md"),
				});
				break;
			case "tab-new":
			case "tab-clicked":
			case "tab-close":
				Files.dispatch(event);
				break;
		}
	}
};

window.exports = textedit;
