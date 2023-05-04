
class Edit {
	constructor(opt) {
		this.selectedRange = null;
	}

	readFileIntoDataUrl(fileInfo) {

	}

	cleanHtml(o) {

	}

	updateToolbar(editor, toolbarBtnSelector, options) {

	}

	execCommand(commandWithArgs, valueArg, editor, options, toolbarBtnSelector) {
		var commandArr = commandWithArgs.split( " " ),
			command = commandArr.shift(),
			args = commandArr.join( " " ) + ( valueArg || "" );

		var parts = commandWithArgs.split( "-" );

		if ( parts.length === 1 ) {
			document.execCommand( command, false, args );
		} else if ( parts[ 0 ] === "format" && parts.length === 2 ) {
			document.execCommand( "formatBlock", false, parts[ 1 ] );
		}

		( editor ).trigger( "change" );
		this.updateToolbar( editor, toolbarBtnSelector, options );
	}

	getCurrentRange() {
		let sel = window.getSelection(),
			range;
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt( 0 );
		}
		return range;
	}

	saveSelection() {
		this.selectedRange = this.getCurrentRange();
	}

	restoreSelection() {
		if ( this.selectedRange ) {
			let selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.selectedRange );
		}
	}

	toggleHtmlEdit(editor) {

	}

	insertFiles(files, options, editor, toolbarBtnSelector) {

	}

	markSelection(color, options) {
		this.restoreSelection();
		if ( document.queryCommandSupported( "hiliteColor" ) ) {
			document.execCommand( "hiliteColor", false, color || "transparent" );
		}
		this.saveSelection();
	}

	bindToolbar(editor, toolbar, options, toolbarBtnSelector) {

	}

	initFileDrops(editor, options, toolbarBtnSelector) {

	}	
}
