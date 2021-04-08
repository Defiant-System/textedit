
@import "./external/turnDown.js";
@import "./modules/queryCommand.js"
@import "./modules/file.js"
@import "./modules/tabs.js"


const textedit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init objects
		QueryCommand.init();
		Tabs.init();

		// start with blank file
		Tabs.dispatch({ type: "new-file" });

		// setTimeout(() => this.dispatch({ type: "save-file-as" }), 700);
		// setTimeout(() => this.dispatch({ type: "open-file" }), 700);
	},
	async dispatch(event) {
		let Self = textedit,
			active,
			blob;
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
					txt: item => item.open({ responseType: "text" })
									.then(file => Self.dispatch({ type: "tab-new", file })),
					md: item => item.open({ responseType: "text" })
									.then(file => Self.dispatch({ type: "tab-new", file }))
				});
				break;
			case "save-file":
				active = Tabs.active;
				// update file
				blob = active.toBlob();
				window.dialog.save(active._file, blob);
				break;
			case "save-file-as":
				active = Tabs.active;
				// pass on available file types
				window.dialog.saveAs(active._file, {
					txt:  () => active.toBlob("txt"),
					html: () => active.toBlob("html"),
					md:   () => active.toBlob("md"),
				});
				break;
			case "new-file":
			case "tab-new":
			case "tab-clicked":
			case "tab-close":
				Tabs.dispatch(event);
				break;
			case "query-command-state":
			case "format":
			case "format-fontSize":
			case "format-fontName":
			case "select-all":
			case "window.keyup":
				QueryCommand.dispatch(event);
				break;
		}
	}
};

window.exports = textedit;
