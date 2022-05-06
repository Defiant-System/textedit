
class File {

	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();
		this._el = el;
		this._selection = null;
		this._edit = new Edit({ file: this, el });

		// editor
		let data = this._file.data || "";
		switch (this._file.kind) {
			case "html":
			case "htm" : break;
			case "txt" : data = data.replace(/\n/g, "<br>"); break;
			case "md"  : data = $.md(data); break;
		}
		this._el.html(data);

		// to keep track if file is dirty
		this.digest = data.sha1();
		// undo stack
		this.undoStack = new window.History;
	}

	dispatch(event) {
		let APP = textedit,
			str;
		switch (event.type) {
			case "close-file":
				// check if dirty
				break;
		}
	}

	toBlob(kind) {
		let data = this._el.html();
		let type;

		// fallback on file kind
		kind = kind || this._file.kind;

		switch (kind) {
			case "txt":
				type = "text/plain";
				data = data.replace(/<br>|<br\/>/g, "\n").stripHtml();
				break;
			case "htm":
			case "html":
				type = "text/html";
				break;
			case "md":
				type = "text/markdown";
				data = service.turndown(data);
				break;
		}

		return new Blob([data], { type });
	}

	get isDirty() {
		return this.digest === this._el.html().sha1();
	}

	focus() {
		
	}

	blur() {
		
	}

	undo() {
		
	}

	redo() {
		
	}

}
