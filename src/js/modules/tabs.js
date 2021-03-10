
// textedit.tabs

{
	init() {
		let editor = window.find("div[data-id='editor']");

		// fast references
		this.files = [];
		this.template = editor.clone();

		editor.remove();
	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.tabs,
			file,
			editor,
			undoStack,
			tab,
			index,
			data;
		switch (event.type) {
			case "new-file":
			case "tab-new":
				if (Self.active && Self.active.file.digest === "".sha1()) {
					console.log("Close empty file");
				}

				file = event.file || new defiant.File();
				file.digest = file.data.sha1();
				// undo stack
				undoStack = new window.History;

				// create new tab if needed
				if (Self.files.length) {
					tab = window.tabs.add(file.base);
					requestAnimationFrame(() => tab.trigger("click"));
				}
				// editor
				editor = APP.content.append(Self.template.clone());
				// add file text to editor
				data = file.kind === "txt" ? file.data.replace(/\n/g, "<br>") : $.md(file.data);
				editor.html(data);
				// save to files array
				Self.files.push({ editor, file, undoStack });

				Self.dispatch({
					type: "tab-clicked",
					el: tab || { index: () => 0 },
				});
				break;
			case "tab-clicked":
				if (Self.active) {
					Self.active.editor.addClass("hidden");
				}
				// update "active"
				index = event.el.index();
				Self.active = Self.files[index];
				Self.active.editor.removeClass("hidden");
				// Self.active.editor.focus();

				let selection = Self.active.selection;
				if (selection) {
					// restore selection
					APP.queryCommand.selection.restore(Self.active.editor[0], selection);
				}

				// set window title to active file name
				window.title = Self.active.file.base;
				break;
			case "tab-close":
				index = event.el.index();
				Self.files.splice(index, 1);
				break;
		}
	}
}
