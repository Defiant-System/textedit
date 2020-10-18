
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
			text: `<b>Lorem</b> <i>ipsum</i> <u>dolor</u> <strike>sit</strike> amet, consectetur <i>adipisicing elit. Necessi</i><br>tatibus natus vero voluptatem aliquam molestias dicta <br>aperiam dignissimos laudantium accusamus saepe!`,
		};
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.tabs,
			file,
			editor,
			undoStack,
			tab,
			index;
		switch (event.type) {
			case "tab-new":
				file = {
					...Self.file,
					...event.file,
				};
				// undo stack
				undoStack = new window.History;

				// create new tab if needed
				if (Self.files.length) {
					tab = window.tabs.add(file.name);
					requestAnimationFrame(() => tab.trigger("click"));
				}
				// editor
				editor = APP.content.append(Self.template.clone());
				// add file text to editor
				editor.html( file.ext === "txt" ? file.text : $.md(file.text) );
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
				window.title = Self.active.file.name;
				break;
			case "tab-close":
				index = event.el.index();
				Self.files.splice(index, 1);
				break;
		}
	}
}
