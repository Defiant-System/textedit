
let Edit = {
	selectedRange: null,
	commandState: {
		bold: false,
		italic: false,
		underline: false,
		justifyleft: false,
		justifycenter: false,
		justifyright: false,
		justifyfull: false,
		fontFamily: false,
		fontSize: false,
	},
	updateState() {
		// update command state
		Object.keys(this.commandState)
			.map(key => {
				this.commandState[key] = document.queryCommandState(key);
			});
		// font family & size
		let sel = document.getSelection();
		if (sel.anchorNode === null) return;

		let node = sel.focusNode.nodeType === Node.TEXT_NODE ? sel.focusNode.parentNode : sel.focusNode,
			cStyle = getComputedStyle(node),
			value = cStyle.fontFamily.split(",")[0];
		if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
		this.commandState.fontFamily = value;
		this.commandState.fontSize = parseInt(cStyle.fontSize, 10);
		this.commandState.fgColor = Color.rgbToHex(cStyle.color);
	},
	execCommand(editor, name, value) {
		// execute command
		document.execCommand( name, false, value );

		// post-command-execution fixes
		let selection = this.getCurrentRange(),
			node;
		switch (name) {
			case "fontSize":
				// start container node
				node = selection.startContainer.parentNode;
				node.style.fontSize = value +"px";
				// end container node
				node = selection.endContainer.parentNode;
				node.style.fontSize = value +"px";
				break;
		}

		// trigger event
		requestAnimationFrame(() => editor.trigger("change"));
	},
	getCurrentRange() {
		let sel = document.getSelection(),
			range;
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
		}
		return range;
	},
	saveSelection(tab) {
		tab.selectedRange = this.getCurrentRange();
	},
	restoreSelection(tab) {
		if ( tab.selectedRange ) {
			let selection = document.getSelection();
			selection.removeAllRanges();
			selection.addRange( tab.selectedRange );
		} else {
			// put cursor at start
			let Tabs = textedit.spawn.ruler.tabs;
			let node = tab.fileEl.find(".page > div")[0].selectSingleNode(`.//text()`);
			Tabs.dispatch({ type: "editor.select-text", spawn: Tabs._spawn, node, start: 0, length: 0 });
		}
	},
	markSelection(color, options) {
		this.restoreSelection();
		if (document.queryCommandSupported( "hiliteColor")) {
			document.execCommand("hiliteColor", false, color || "transparent");
		}
		this.saveSelection();
	},
	cleanHtml(o) {

	}
};
