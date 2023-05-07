
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// fast references
		this.els = {
			toolUndo: spawn.find(`.toolbar-tool_[data-click="editor.undo"]`),
			toolRedo: spawn.find(`.toolbar-tool_[data-click="editor.redo"]`),

			toolSelFamily: spawn.find(`.toolbar-selectbox_[data-menu="sys:font-families"]`),
			toolSelSize: spawn.find(`.toolbar-selectbox_[data-menu="font-size"]`),

			toolBold: spawn.find(`.toolbar-tool_[data-arg="bold"]`),
			toolItalic: spawn.find(`.toolbar-tool_[data-arg="italic"]`),
			toolUnderline: spawn.find(`.toolbar-tool_[data-arg="underline"]`),

			toolJustifyleft: spawn.find(`.toolbar-tool_[data-arg="justifyleft"]`),
			toolJustifycenter: spawn.find(`.toolbar-tool_[data-arg="justifycenter"]`),
			toolJustifyright: spawn.find(`.toolbar-tool_[data-arg="justifyright"]`),
			toolJustifyfull: spawn.find(`.toolbar-tool_[data-arg="justifyfull"]`),
		};

		// editor template
		let editor = spawn.find(`content > div[data-id="editor"]`);
		this._content = spawn.find("content");
		this._template = editor.clone();
		editor.remove();
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	toBlob(opt={}) {
		return this._active.file.toBlob(this._active.bodyEl, opt);
	}

	add(fsFile) {
		let bodyEl = this._template.clone(),
			file = new File(fsFile, bodyEl),
			history = new window.History,
			tabEl = this._spawn.tabs.add(fsFile.base, file.id),
			fnHandler = e => this.dispatch({ type: "change", spawn: this._spawn });

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": file.id }).html(file.data);
		bodyEl = this._content.append(bodyEl);
		// bind event handler
		bodyEl.on("change keyup mouseup", fnHandler);
		// save reference to tab
		this._stack[file.id] = { tabEl, bodyEl, fnHandler, history, file };
		// focus on file
		this.focus(file.id);
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
		let item = this._stack[tId];
		// unbind event handlers
		item.bodyEl.off("change keyup mouseup", item.fnHandler);
		// remove element from DOM tree
		item.bodyEl.remove();
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
		this._content.toggleClass("web-view", this._active.file.setup.pageView);
		this._content.toggleClass("page-view", !this._active.file.setup.pageView);
		this._content.toggleClass("show-ruler", this._active.file.setup.hideRulers);
		// UI update
		this.update();
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
			// native events
			case "change":
			case "update-toolbar":
				// update command states
				Edit.updateState();
				// update toolbar
				Tabs.els.toolSelFamily.val(Edit.commandState.fontFamily);
				Tabs.els.toolSelSize.val(Edit.commandState.fontSize);

				Tabs.els.toolBold.toggleClass("tool-active_", !Edit.commandState.bold);
				Tabs.els.toolItalic.toggleClass("tool-active_", !Edit.commandState.italic);
				Tabs.els.toolUnderline.toggleClass("tool-active_", !Edit.commandState.underline);

				Tabs.els.toolJustifyleft.toggleClass("tool-active_", !Edit.commandState.justifyleft);
				Tabs.els.toolJustifycenter.toggleClass("tool-active_", !Edit.commandState.justifycenter);
				Tabs.els.toolJustifyright.toggleClass("tool-active_", !Edit.commandState.justifyright);
				Tabs.els.toolJustifyfull.toggleClass("tool-active_", !Edit.commandState.justifyfull);
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
				// update toolbar
				Tabs.dispatch({ ...event, type: "update-toolbar" });
				break;
			case "editor.undo":
			case "editor.redo":
				break;
			case "editor.format-fontSize":
				// console.log(event);
				break;
			case "editor.format":
				name = event.arg;
				value = event.val;
				Edit.execCommand(editor, name);
				break;
		}
	}
}
