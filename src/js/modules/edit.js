
let Edit = {
	selectedRange: null,
	cleanHtml(o) {

	},
	execCommand(editor, commandWithArgs, valueArg) {
		var commandArr = commandWithArgs.split( " " ),
			command = commandArr.shift(),
			args = commandArr.join( " " ) + ( valueArg || "" ),
			parts = commandWithArgs.split( "-" );

		if ( parts.length === 1 ) {
			document.execCommand( command, false, args );
		} else if ( parts[ 0 ] === "format" && parts.length === 2 ) {
			document.execCommand( "formatBlock", false, parts[ 1 ] );
		}

		editor.trigger( "change" );

		// TODO: updateToolbar

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
		if ( document.queryCommandSupported( "hiliteColor" ) ) {
			document.execCommand( "hiliteColor", false, color || "transparent" );
		}
		this.saveSelection();
	}
};
