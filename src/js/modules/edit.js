
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
	},
	updateState() {
		// update command state
		Object.keys(this.commandState).map(key => {
			this.commandState[key] = document.queryCommandState(key);
		});
	},
	execCommand(editor, name, value) {
		// execute command
		document.execCommand( name, false, value );
		// trigger event
		editor.trigger("change");
	},
	getCurrentRange() {
		let sel = window.getSelection(),
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
			let selection = window.getSelection();
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
