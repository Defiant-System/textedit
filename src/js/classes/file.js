
class File {
	constructor(fsFile, data) {
		// save reference to original FS file
		this.id = "f"+ Date.now();
		this._file = fsFile || new karaqu.File({ kind: "txt" });
	}

	get isDirty() {
		
	}

	get data() {
		let data = this._file.data;

		switch (this._file.kind) {
			case "txt":
				data = data.replace(/\n/g, "<br>");
				break;
			case "md" :
				data = $.md(data);
				console.log(data);
				break;
		}

		return data || "";
	}

	get kind() {
		return this._file.kind;
	}

	toBlob(opt={}) {
		let data = this._active.bodyEl.html(),
			// file kind, if not specified
			kind = opt.kind || this._file.kind,
			type;

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

	dispatch(event) {
		let name,
			value;
		switch (event.type) {
			// native events
			case "change":
				break;
		}
	}
}
