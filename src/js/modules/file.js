
class File {

	constructor(fsFile, editor) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();
		this._editor = editor;
		this._bourne = Date.now();

		// editor
		let data = this._file.data || "";
		switch (this._file.kind) {
			case "html":
			case "htm" : break;
			case "txt" : data = data.replace(/\n/g, "<br>"); break;
			case "md"  : data = $.md(data); break;
		}
		this._editor.html(data);

		// to keep track if file is dirty
		this.digest = data.sha1();
		// undo stack
		this.undoStack = new window.History;
	}

	toBlob(type) {
		let data = this._editor.html();
		let blob = new Blob([data], { type });
		return blob;
	}

	get isDirty() {
		return this.digest === this._editor.html().sha1();
	}

	undo() {
		
	}

	redo() {
		
	}

}
