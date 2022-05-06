
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
			name,
			value,
			el;
		switch (event.type) {
			case "new-file":
			case "open-file":
				// editor element
				el = Self.content.append(Self.template.clone());
				// wrap filesystem file with custom File object
				file = event.file || new defiant.File({ kind: event.kind || "txt" });
				// create new tab if needed
				window.tabs.add(file.base, file.id);
				// save to files array
				Self.open(file, el);
				break;
			case "tab-clicked":
				Self.select(event.el.data("id"));
				break;
			case "tab-close":
				Self.close(event.el.data("id"));
				break;
			case "format":
				// forward to file
				name = event.el.data("arg");
				Self.activeFile._edit.format(name, value);
				// update toolbar
				setTimeout(() => Self.activeFile._edit.state(), 10);
				break;
			case "query-command-state":
			case "window.keystroke":
				// forward to file
				Self.activeFile._edit.state();
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

		// temp
		setTimeout(() => {
			let docEl = $(`div[data-id="editor"]`);
			docEl.html(`Lorem <b>ipsum används ofta</b> som exempeltext inom trycksaksframställning och grafisk design för att visa hur till exempel ett dokument kommer att se ut när väl den riktiga texten är på plats. Lorem ipsum visar hur layout, teckensnitt och typografi samspelar, utan att texten, undermedvetet genom ordens betydelse, ska påverka betraktaren.`);

			let anchor = docEl.find("b")[0],
				sel = new $election(anchor, 3, 7);
		}, 100);
	},
	close(id) {
		this.activeFile.dispatch({ type: "close-file" });
	},
	select(id) {
		if (this.activeFile) {
			// hide current active file
			this.activeFile._el.addClass("hidden");
		}
		// reference to active file
		this.activeFile = this.stack.find(f => f._file.id === id);
		// show active file
		this.activeFile._el.removeClass("hidden");
		// focus editor
		if (this.activeFile._selection) {
			// restore selection
			// QueryCommand.selection.restore(Self.activeFile._el[0], this.activeFile._selection);
		} else {
			// no previous selection - move cursor to begining of file
			this.activeFile._el.focus();
		}
		// make atab active
		window.tabs.setActive(this.activeFile._file.id);
		// set window title to active file name
		window.title = this.activeFile._file.base;
	}
};

// auto init
Files.init();
