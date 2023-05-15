
class FileTabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// fast references
		this.els = {
			doc: $(document),
			content: spawn.find(`content`),
			toolUndo: spawn.find(`.toolbar-tool_[data-click="editor.undo"]`),
			toolRedo: spawn.find(`.toolbar-tool_[data-click="editor.redo"]`),
			toolSelFamily: spawn.find(`.toolbar-selectbox_[data-menu="font-families"]`),
			toolSelSize: spawn.find(`.toolbar-selectbox_[data-menu="font-size"]`),
			toolColor: spawn.find(`.toolbar-tool_[data-menu="font-color"]`),
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
		let file = spawn.find(`content > .file`),
			editor = file.find(`> div[data-id="editor"]`);
		Edit.execCommand(editor, "styleWithCSS", true);
		this._template = file.clone(true);
		file.remove();
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	get active() {
		return this._active;
	}

	toBlob(opt={}) {
		return this._active.file.toBlob(this._active.bodyEl, opt);
	}

	add(fsFile) {
		if (fsFile.new) {
			let tId = "f"+ Date.now(),
				bodyEl = this.els.content,
				// add tab to tab row
				tabEl = this._spawn.tabs.add(fsFile.new, tId);
			// reference to tab element
			this._stack[tId] = { tabEl, bodyEl };
			// reset view / show blank view
			this.dispatch({ type: "show-blank-view", spawn: this._spawn });
			// reference to active tab
			this._active = this._stack[tId];
			// focus on file
			this.focus(tId);
		} else {
			let fileEl = this.els.content.append(this._template.clone(true)),
				bodyEl = fileEl.find(`> div[data-id="editor"]`),
				file = new File(fsFile, bodyEl),
				history = new window.History,
				tabEl = this._spawn.tabs.add(fsFile.base, file.id),
				fnHandler = e => this.dispatch({ type: "change", spawn: this._spawn });

			// add element to DOM + append file contents
			fileEl.data({ id: file.id });
			bodyEl.html(file.data);
			// bind event handler
			bodyEl.on("change keyup mouseup", fnHandler);
			// save reference to tab
			this._stack[file.id] = { tabEl, bodyEl, fnHandler, history, file };
			// focus on file
			this.focus(file.id);
		}
	}

	merge(ref) {
		let tId = ref.tId,
			file = ref.file,
			history = ref.history,
			bodyEl = ref.bodyEl.clone(true).parent().addClass("hidden"),
			tabEl = this._spawn.tabs.add(file.base, tId, true);
		// clone & append original bodyEl
		bodyEl = this.els.content.append(bodyEl);
		// save reference to this spawns stack
		this._stack[tId] = { tId, tabEl, bodyEl, history, file };
	}

	removeDelayed() {
		let el = this._active.tabEl;
		this._spawn.tabs.wait(el);
	}

	remove(tId) {
		let item = this._stack[tId],
			nextTab = item.tabEl.parent().find(`.tabbar-tab_:not([data-id="${tId}"])`);
		
		if (item.bodyEl[0] !== this.els.content[0]) {
			// unbind event handlers
			item.bodyEl.off("change keyup mouseup", item.fnHandler);
			// remove element from DOM tree
			item.bodyEl.remove();
			// delete references
			this._stack[tId] = false;
			delete this._stack[tId];
		}
		
		if (nextTab.length) {
			this.focus(nextTab.data("id"));
		}
	}

	focus(tId) {
		if (this._active) {
			// save selection
			Edit.saveSelection(this._active);

			this.els.content.find(`> .file`).map(elem => {
				let el = $(elem);
				if (el.data("id") !== tId) el.addClass("hidden");
			});

			if (this._active.bodyEl) {
				// hide blurred body
				// this._active.bodyEl.parent().addClass("hidden");
			}
		}
		// reference to active tab
		this._active = this._stack[tId];

		if (this._active.file) {
			// reset view / show blank view
			this.dispatch({ type: "hide-blank-view", spawn: this._spawn });
			// file UI
			this.els.content.toggleClass("web-view", this._active.file.setup.pageView);
			this.els.content.toggleClass("page-view", !this._active.file.setup.pageView);
			this.els.content.toggleClass("show-ruler", this._active.file.setup.hideRulers);

			// file indents
			let indents = this._active.file.setup.indents || "2,2,15".split(",");
			let keys = "iF,iL,iR".split(",");
			let data = {};
			indents.map((k,i) => data[`--${keys[i]}`] = +k);
			this.els.content.parent().css(data);

			// UI update
			this.update();
		} else {
			// reset view / show blank view
			this.dispatch({ type: "show-blank-view", spawn: this._spawn });
		}
	}

	update() {
		let active = this._active;
		// unhide focused body
		active.bodyEl.parent().removeClass("hidden");
		// update spawn window title
		this._spawn.title = active.file.base;
		// restore selection
		Edit.restoreSelection(active);
		// update toolbar
		this.dispatch({ type: "update-toolbar", spawn: this._spawn });
	}

	dispatch(event) {
		let Spawn = event.spawn,
			Tabs = Spawn.data.tabs,
			Active = Tabs ? Tabs._active : false,
			editor = Active ? Active.bodyEl : false,
			name,
			value;
		// console.log(event);
		switch (event.type) {
			// native events
			case "change":
			case "update-toolbar":
				// update command states
				Edit.updateState();
				// update toolbar
				if (Edit.commandState.fontFamily) Tabs.els.toolSelFamily.val(Edit.commandState.fontFamily);
				if (Edit.commandState.fontSize) Tabs.els.toolSelSize.val(Edit.commandState.fontSize);

				Tabs.els.toolColor.css({ "--fg-color": Edit.commandState.fgColor || "#333" });

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
				Tabs.els.content.removeClass("web-view page-view show-ruler").addClass("show-blank-view");
				break;
			case "hide-blank-view":
				// disable toolbar
				Object.keys(Tabs.els)
					.filter(key => key.startsWith("tool"))
					.map(key => Tabs.els[key].removeClass("tool-disabled_"));
				// hide blank view
				Tabs.els.content.removeClass("show-blank-view");
				break;
			// edit related events
			case "editor.set-color":
				name = "foreColor";
				value = event.arg;
				Edit.execCommand(editor, name, value);
				break;
			case "editor.select-text":
				new Selection(event.node, event.start, event.length);
				// update toolbar
				Tabs.dispatch({ ...event, type: "update-toolbar" });
				break;
			// OLD
			// case "editor.select-text":
			// 	let sel = document.getSelection(),
			// 		range = document.createRange();
			// 	range.setStart(event.node, event.start);
			// 	range.setEnd(event.node, event.start + event.len);
			// 	// focus on element when blurred
			// 	sel.removeAllRanges();
			// 	sel.addRange(range);
			// 	// update toolbar
			// 	Tabs.dispatch({ ...event, type: "update-toolbar" });
			// 	break;
			case "editor.undo":
			case "editor.redo":
				break;
			case "editor.format-fontSize":
			case "editor.format-fontName":
				name = event.type.split("-")[1];
				value = event.value || event.xMenu.getAttribute("name");
				Edit.execCommand(editor, name, value);
				break;
			case "editor.format":
				name = event.arg;
				Edit.execCommand(editor, name);
				break;
		}
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
}
