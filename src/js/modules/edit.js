
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
		if (!sel.baseNode) return;

		let node = sel.baseNode.nodeType === 3 ? sel.baseNode.parentNode : sel.baseNode,
			cStyle = getComputedStyle(node),
			value = cStyle.fontFamily.split(",")[0];
		if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
		this.commandState.fontFamily = value;
		this.commandState.fontSize = parseInt(cStyle.fontSize, 10);
		// console.log( Color.rgbToHex( cStyle.color ) );
	},
	execCommand(editor, name, value) {
		// execute command
		document.execCommand( name, false, value );
		// trigger event
		requestAnimationFrame(() => editor.trigger("change"));
	},
	getCurrentRange() {
		let sel = document.getSelection(),
			range;
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt( 0 );
		}
		return range;
	},
	saveSelection() {
		this.selectedRange = this.getCurrentRange();
	},
	restoreSelection() {
		if ( this.selectedRange ) {
			let selection = document.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.selectedRange );
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
