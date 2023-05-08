
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// fast references
		this.els = {
			content: spawn.find(`content`),
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
			toolSettings: spawn.find(`.toolbar-tool_[data-click="editor.settings"]`),
		};

		// editor template
		let editor = spawn.find(`content > div[data-id="editor"]`);
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
		bodyEl = this.els.content.append(bodyEl);
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
		bodyEl = this.els.content.append(bodyEl);
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

	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;
					
					let reader = new FileReader();

					reader.addEventListener("load", () => {
						// this will then display a text file
						file.data = reader.result;
						resolve(file);
					}, false);

					reader.readAsText(blob);
				})
				.catch(err => reject(err));
		});
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
		this.els.content.toggleClass("web-view", this._active.file.setup.pageView);
		this.els.content.toggleClass("page-view", !this._active.file.setup.pageView);
		this.els.content.toggleClass("show-ruler", this._active.file.setup.hideRulers);
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
		// update toolbar
		this.dispatch({ type: "update-toolbar", spawn: this._spawn });
	}

	saveSelection() {
		let el = document.activeElement,
			elContent = $(el).parents("content");
		if (el.isContentEditable && this.els.content[0] === elContent[0]) {
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
			Active = Tabs ? Tabs._active : false,
			editor = Active ? Active.bodyEl : false,
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
			case "show-blank-view":
				// update spawn title !?
				Spawn.title = "Text Edit";
				// disable toolbar
				Object.keys(Tabs.els)
					.filter(key => key.startsWith("tool"))
					.map(key => Tabs.els[key].removeClass("tool-active_").addClass("tool-disabled_"));
				// show blank view
				Tabs.els.content.addClass("show-blank-view");
				break;
			case "hide-blank-view":
				// hide blank view
				Tabs.els.content.removeClass("show-blank-view");
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
