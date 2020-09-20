
defiant.require("./undoStack.js");
defiant.require("./queryCommand.js");

const textEdit = {
	init() {
		// fast references
		this.content = window.find("content");
		this.tools = window.find("[data-click='format']");

		let el = window.find("div[data-id='editor']");
		this.template = el.clone();
		this.editors = [{ el, isDirty: false }];

		this.current = this.editors[0];

		el.html("test <b>text</b> banan");

		//this.format("styleWithCSS", true);
		//this.editor.focus();
		//undoStack.init(this.editor);

		this.dispatch({type: "new-tab"});

		setTimeout(() => window.dialog.save(), 400);
		//window.dialog.alert("hello");

		/*
		let clone = window.clone();
		//console.log(clone);
		this.dispatch({type: "merge-all-windows"});
		*/
	},
	async dispatch(event) {
		let self = textEdit,
			isDirty,
			index,
			clone,
			tab,
			el;
		switch (event.type) {
			case "open.file":
				let file = await event.open();
				this.editor.html(file.text);
				this.editor.focus();

				undoStack.init(this.editor);
				break;
			case "save-file":
				window.save();
				break;
			case "history":
				undoStack.dispatch(event);
				break;
			case "query-command-state":
			case "format":
			case "format-fontSize":
			case "format-fontName":
				queryCommand.dispatch(event);
				break;
			// tabs & clones
			case "new-clone-window":
				clone = window.clone();
				break;
			case "merge-all-windows":
				let keys = Object.keys(window.clones);
				keys.map(key => {

				});
				break;
			case "close-clone-window":
				window.close();
				break;
			case "new-tab":
				tab = window.tabs.add("New Document");
				
				// hide current editor element
				self.current.el.addClass("hidden");

				clone = self.template.clone();
				el = self.content.append(clone);
				
				self.editors.push({ el, isDirty: false });
				self.current = self.editors[self.editors.length - 1];
				break;
			case "active-tab":
				self.current.el.addClass("hidden");

				index = event.el.index();
				self.editors[index].el.removeClass("hidden");
				break;
			case "close-tab":
				// index = event.el.index();
				// isDirty = self.editors[index].isDirty;
				// return !isDirty;
				break;
		}
	}
};

window.exports = textEdit;
