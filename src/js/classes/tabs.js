
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

	add(file) {
		let tId = "f"+ Date.now(),
			history = new window.History,
			tabEl = this._spawn.tabs.add(file.base, tId),
			bodyEl = this._template.clone(),
			state = {};

		bodyEl.attr({ "data-id": tId }).html(file.data);
		bodyEl = this._content.append(bodyEl);

		// save reference to tab
		this._stack[tId] = { tabEl, bodyEl, history, file };

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

	update() {
		let active = this._active;
		// unhide focused body
		active.bodyEl.removeClass("hidden");

		this._spawn.title = active.file.base;
	}
}
