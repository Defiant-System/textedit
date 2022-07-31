
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// editor template
		let editor = spawn.find(`content > div[data-id="editor"]`);
		this._content = spawn.find("content");
		this._template = editor.clone();
		editor.remove();
	}

	get file() {
		return this._active.file;
	}

	add(file) {
		let tId = "f"+ Date.now(),
			history = new window.History,
			tabEl = this._spawn.tabs.add(file.base, tId),
			bodyEl = this._template.clone(),
			data = file.data;

		switch (file.kind) {
			case "txt" : data = data.replace(/\n/g, "<br>"); break;
			case "md"  : data = $.md(data); break;
		}

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId }).html(data);
		bodyEl = this._content.append(bodyEl);
		// save reference to tab
		this._stack[tId] = { tabEl, bodyEl, history, file };
		// focus on file
		this.focus(tId);
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		if (this._active) {
			// hide blurred body
			this._active.bodyEl.addClass("hidden");
		}
		// reference to active tab
		this._active = this._stack[tId];
		// UI update
		this.update();
	}

	toBlob(opt={}) {
		let data = this._active.bodyEl.html(),
			// file kind, if not specified
			kind = opt.kind || this._active.file.kind,
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

	update() {
		let active = this._active;
		// unhide focused body
		active.bodyEl.removeClass("hidden");

		active.bodyEl.focus();

		this._spawn.title = active.file.base;
	}
}
