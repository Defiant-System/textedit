
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// fast references
		this.els = {
			toolBold: spawn.find(`.toolbar-tool_[data-arg="bold"]`),
			toolItalic: spawn.find(`.toolbar-tool_[data-arg="italic"]`),
			toolUnderline: spawn.find(`.toolbar-tool_[data-arg="underline"]`),
		}

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
			settings = {
				pageView: file.kind === "md",
				hideRulers: false,
			},
			tabEl = this._spawn.tabs.add(file.base, tId),
			bodyEl = this._template.clone(),
			data = file.data || "";

		switch (file.kind) {
			case "txt" : data = data.replace(/\n/g, "<br>"); break;
			case "md"  : data = $.md(data); break;
		}

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId }).html(data);
		bodyEl = this._content.append(bodyEl);
		// bind event handler
		bodyEl.on("change mouseup", e => this.dispatch({ type: "change", spawn: this._spawn }));
		// save reference to tab
		this._stack[tId] = { tId, tabEl, bodyEl, history, settings, file };
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
		// remove element from DOM tree
		this._stack[tId].bodyEl.remove();
		// delete references
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
		// file UI
		this._content.toggleClass("web-view", !this._active.settings.pageView);
		this._content.toggleClass("page-view", this._active.settings.pageView);
		this._content.toggleClass("show-ruler", this._active.settings.hideRulers);
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

		// update spawn window title
		this._spawn.title = active.file.base;
		
		// restore selection
		this.restoreSelection(active);
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

	dispatch(event) {
		let Spawn = event.spawn,
			Tabs = Spawn.data.tabs,
			Active = Tabs._active,
			editor = Active.bodyEl,
			name,
			value;
		switch (event.type) {
			// native event
			case "change":
				// update command states
				Edit.updateState();
				// update toolbar
				Tabs.els.toolBold.toggleClass("tool-active_", !Edit.commandState.bold);
				Tabs.els.toolItalic.toggleClass("tool-active_", !Edit.commandState.italic);
				Tabs.els.toolUnderline.toggleClass("tool-active_", !Edit.commandState.underline);

				break;
			// edit related events
			case "editor.select-text":
				let sel = document.getSelection(),
					range = document.createRange();
				range.setStart(event.node, event.start);
				range.setEnd(event.node, event.start + event.len);
				// focus on element when blurred
				sel.removeAllRanges();
				sel.addRange(range);
				break;
			case "editor.undo":
			case "editor.redo":
				break;
			case "editor.format":
				name = event.arg;
				value = event.val;
				Edit.execCommand(editor, name);
				break;
		}
	}
}
