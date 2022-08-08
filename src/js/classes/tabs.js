
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

	get length() {
		return Object.keys(this._stack).length;
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
		this._stack[tId] = { tId, tabEl, bodyEl, history, file };
		// focus on file
		this.focus(tId);
	}

	merge(ref) {
		let tId = ref.tId,
			file = ref.file,
			history = ref.history,
			bodyEl = ref.bodyEl.clone(true).addClass("hidden"),
			tabEl = this._spawn.tabs.add(file.base, tId, true);
		// clone & append original bodyEl
		bodyEl = this._content.append(bodyEl);
		// save reference to this spawns stack
		this._stack[tId] = { tId, tabEl, bodyEl, history, file };
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		if (this._active) {
			// save selection
			this.saveSelection();
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

	saveSelection() {
		let el = document.activeElement,
			elContent = $(el).parents("content");
		if (el.isContentEditable && this._content[0] === elContent[0]) {
			let sel = document.getSelection(),
				range = sel.getRangeAt(0),
				clone = range.cloneRange(),
				start;
			clone.selectNodeContents(el);
			clone.setEnd(range.startContainer, range.startOffset);
			start = clone.toString().length;
			// store selection
			this._active.selection = { el, start, end: start + range.toString().length };
		}
		// blur active element
		el.blur();
	}

	restoreSelection() {
		if (!this._active) return;

		if (this._active.selection) {
			let saved = this._active.selection,
				sel = document.getSelection(),
				range = document.createRange(),
				nodeStack = [saved.el],
				foundStart = false,
				stop = false,
				charIndex = 0,
				node;
			range.setStart(nodeStack[0], 0);
			range.collapse(true);
			while (!stop && (node = nodeStack.pop())) {
				if (node.nodeType == 3) {
					let nextCharIndex = charIndex + node.length;
					if (!foundStart && saved.start >= charIndex && saved.start <= nextCharIndex) {
						range.setStart(node, saved.start - charIndex);
						foundStart = true;
					}
					if (foundStart && saved.end >= charIndex && saved.end <= nextCharIndex) {
						range.setEnd(node, saved.end - charIndex);
						stop = true;
					}
					charIndex = nextCharIndex;
				} else {
					let i = node.childNodes.length;
					while (i--) {
						nodeStack.push(node.childNodes[i]);
					}
				}
			}
			// focus on element when blurred
			sel.removeAllRanges();
			sel.addRange(range);
		} else {
			this._active.bodyEl.focus();
		}
	}

	update() {
		let active = this._active;
		// unhide focused body
		active.bodyEl.removeClass("hidden");

		// update spawn window title
		this._spawn.title = active.file.base;
		
		// restore selection
		this.restoreSelection(active);
	}
}