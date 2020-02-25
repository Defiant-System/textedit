
const undoStack = {
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
		this.toolUndo = window.find(".toolbar-tool[data-click='undo']");
		this.toolRedo = window.find(".toolbar-tool[data-click='redo']");

		this.startValue = el.html();
		this.stack = new UndoStack(el[0]);
		this.stack.changed = this.changed.bind(this);
		this.observer = new MutationObserver(this.flush.bind(this));
		this.observer.observe(el[0], this.options);
	},
	dispatch(event) {
		let self = undoStack;
		switch (event.type) {
			case "history-undo":
				self.stack.undo();
				break;
			case "history-redo":
				self.stack.redo();
				break;
		}
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
};
