
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "txt" });
		this._el = el.data({ kind: this.kind });

		this.id = "f"+ Date.now();
		this.setup = {
			pageView: true, // file.kind === "md",
			hideRulers: false,
		};
	}

	get kind() {
		return this._file.kind;
	}

	get isNew() {
		return !this._file.xNode;
	}

	get isDirty() {
		// TODO:
	}

	get def() {
		let str = [];
		str.push(`<meta name="pageView" value="true"/>`);
		str.push(`<meta name="hideRulers" value="false"/>`);
		return `<def>${str.join("")}</def>`;
	}

	get data() {
		let data = this._file.data;

		switch (this._file.kind) {
			case "txt":
				data = data.replace(/\n/g, "<br>");
				break;
			case "md" :
				data += this.def; // temp
				data = service.turnup(data);
				break;
		}

		return data || "";
	}

	toBlob(opt={}) {
		let data = this._el.html(),
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
		// console.log( data );
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
