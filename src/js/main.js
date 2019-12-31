
const textEdit = {
	init() {
		this.editor = window.find("div[data-id='editor']");
		this.tools = window.find(".toolbar-tool[data-click='format']");

		//this.format("styleWithCSS", true);
		this.editor.focus();
		this.history.init(this.editor);
	},
	async dispatch(event) {
		switch (event.type) {
			case "open.file":
				let file = await event.open();
				this.editor.html(file.text);
				this.editor.focus();

				this.history.init(this.editor);
				break;
			case "history":
				textEdit.history.stack[event.arg]();
				break;
			case "query-command-state":
				this.queryCommandState();
				break;
			case "format":
				this.format(event.arg);
				break;
			case "format-fontSize":
				this.format("fontSize", event.arg);
				break;
			case "format-fontName":
				this.format("fontName", event.arg);
				break;
		}
	},
	queryCommandState() {
		this.tools.map(tool => {
			const command = tool.getAttribute("data-arg");
			const state = document.queryCommandState(command);
			$(tool).toggleClass("down", !state).removeClass("active");
		});
		
		let state = document.queryCommandValue("fontName").replace(/"/g, "");
		window.updateMenu(`name="${state}"`, {"is-checked": 1});
	},
	format(command, value) {
		document.execCommand(command, false, value || null);
		this.queryCommandState();
	},
	history: {
		blocked: false,
		options: {
			//attributeOldValue: true,
			//attributeFilter: true,
			characterDataOldValue: true,
			characterData: true,
			attributes: true,
			childList: true,
			subtree: true,
		},
		init(el) {
			// fast references
			this.el = el;
			this.toolUndo = window.find(".toolbar-tool[data-arg='undo']");
			this.toolRedo = window.find(".toolbar-tool[data-arg='redo']");

			this.startValue = el.html();
			this.stack = new UndoStack(el[0]);
			this.stack.changed = this.changed.bind(this);
			this.observer = new MutationObserver(this.flush.bind(this));
			this.observer.observe(el[0], this.options);
		},
		changed() {
			this.toolUndo.toggleClass("disabled", this.stack.canUndo());
			this.toolRedo.toggleClass("disabled", this.stack.canRedo());
			
			window.updateTitle({
				name: "Text Edit",
				isDirty: this.stack.dirty()
			});
		},
		flush(mutations) {
			if (this.blocked) {
				this.blocked = false;
				return;
			}
			let newValue = this.el.html();
			this.stack.execute(new EditCommand(this, this.el[0], this.startValue, newValue));
			this.startValue = newValue;
		}
	}
};

window.exports = textEdit;
