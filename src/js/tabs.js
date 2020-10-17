
// textEdit.tabs

{
	init() {
		let editor = window.find("div[data-id='editor']");

		// fast references
		this.files = [];
		this.template = editor.clone();

		editor.remove();

		// default file
		this.file = {
			name: "New Document",
			text: "",
		};
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.tabs,
			file,
			editor,
			history,
			tab;
		switch (event.type) {
			case "tab-new":
				file = {
					...Self.file,
					...event.file,
				};
				// undo history
				history = new window.History;

				// create new tab if needed
				if (Self.files.length) {
					tab = window.tabs.add(file.name);
					requestAnimationFrame(() => tab.trigger("click"));
				}
				// editor
				editor = APP.content.append(Self.template.clone());
				// add file text to editor
				editor.html(file.text);
				// save to files array
				Self.files.push({ tab, editor, file, history });
				break;
			case "tab-clicked":
				if (Self.currentFile) {
					Self.currentFile.editor.addClass("hidden");
				}
				// update "currentFile"
				Self.currentFile = Self.files[event.el.index()];
				Self.currentFile.editor.removeClass("hidden");
				break;
			case "tab-close":
				let index = event.el.index();
				Self.files.splice(index, 1);
				break;
		}
	}
}
