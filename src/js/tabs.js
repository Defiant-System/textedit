
// textEdit.tabs

{
	init() {
		let editor = window.find("div[data-id='editor']");

		// fast references
		this.files = [];
		this.template = editor.clone();

		editor.remove();

		// default file
		this.file = { name: "New Document" };
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
				history = new window.History;
				if (Self.files.length) {
					tab = window.tabs.add(file.name);
					requestAnimationFrame(() => tab.trigger("click"));
				}
				editor = APP.content.append(Self.template.clone());
				
				// add file text to editor
				editor.html(file.text);

				Self.files.push({ tab, editor, file, history });
				break;
			case "tab-clicked":
				if (Self.currentFile) {
					Self.currentFile.editor.addClass("hidden");
				}

				let index = event.el.index();
				Self.currentFile = Self.files[index];
				Self.currentFile.editor.removeClass("hidden");
				break;
			case "tab-close":
				console.log(event);
				break;
		}
	}
}
