
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
			text: `<b>Lorem</b> <i>ipsum</i> <u>dolor</u> <strike>sit</strike> amet, consectetur <i>adipisicing elit. Necessi</i>tatibus natus vero voluptatem aliquam molestias dicta aperiam dignissimos laudantium accusamus saepe!`,
		};
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.tabs,
			file,
			editor,
			history,
			tab,
			index;
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
				Self.files.push({ editor, file, history });

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
				Self.active.editor.focus();

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
