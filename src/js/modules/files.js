
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
			editor;
		switch (event.type) {
			case "new-file":
			case "open-file":
				// editor
				editor = Self.content.append(Self.template.clone());
				// wrap filesystem file with custom File object
				file = event.file || new defiant.File({ kind: event.kind || "txt" });
				// create new tab if needed
				window.tabs.add(file.base, file.id);
				// save to files array
				Self.open(file, editor);
				break;
			case "tab-clicked":
				Self.select(event.el.data("id"));
				break;
			case "tab-close":
				Self.close(event.el.data("id"));
				break;
		}
	},
	getFileByPath(filepath) {
		let file = this.stack.find(file => file._file.path === filepath);
		if (file) {
			this.select(file._file.id);
			return true;
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
		if (this.activeFile) {
			// hide current active file
			this.activeFile._editor.addClass("hidden");
		}
		// reference to active file
		this.activeFile = this.stack.find(f => f._file.id === id);
		// show active file
		this.activeFile._editor.removeClass("hidden");
		// focus editor
		if (this.activeFile.selection) {
			// restore selection
			// QueryCommand.selection.restore(Self.activeFile._editor[0], this.activeFile.selection);
		} else {
			// no previous selection - move cursor to begining of file
			this.activeFile._editor.focus();
		}
		// make atab active
		window.tabs.setActive(this.activeFile._file.id);
		// set window title to active file name
		window.title = this.activeFile._file.base;
	}
};

// auto init
Files.init();
