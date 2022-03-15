
const Files = {
	init() {
		// fast references
		this.content = window.find("content");
		// file stack
		this.stack = [];
		this.activeFile = null;

		// editor template
		let editor = window.find("div[data-id='editor']");
		this.template = editor.clone();
		editor.remove();
	},
	dispatch(event) {
		let APP = textedit,
			Self = Files,
			file,
			editor,
			el;
		switch (event.type) {
			case "new-file":
			case "open-file":
				// editor
				editor = Self.content.append(Self.template.clone());
				// wrap filesystem file with custom File object
				file = event.file || new defiant.File({ kind: event.kind || "txt" });
				// save to files array
				Self.open(file, editor);
				break;
		}
	},
	open(fsFile, opt) {
		// create file
		let file = new File(fsFile, opt);
		let xNode = file._file.xNode;
		let fileId = file._file.id;

		// add to stack
		this.stack.push(file);

		// select newly added file
		this.select(fileId);
	},
	close(id) {
		this.activeFile.dispatch({ type: "close-file" });
	},
	select(id) {
		// reference to active file
		this.activeFile = this.stack.find(f => f._file.id === id);
		// focus editor
		if (this.activeFile.selection) {
			// restore selection
			
			// QueryCommand.selection.restore(Self.activeFile._editor[0], this.activeFile.selection);
		} else {
			// no previous selection - move cursor to begining of file
			this.activeFile._editor.focus();
		}
		// set window title to active file name
		window.title = this.activeFile._file.base;
	}
};

// auto init
Files.init();
