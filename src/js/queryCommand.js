
// textEdit.queryCommand

{
	init() {
		// fast references
		this.tools = window.find("[data-click='format']");
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.queryCommand;
		switch (event.type) {
			case "query-command-state":
				Self.state();
				break;
			case "format":
				Self.format(event.arg);
				break;
			case "format-fontSize":
				Self.format("fontSize", event.arg);
				break;
			case "format-fontName":
				Self.format("fontName", event.arg);
				break;
		}
	},
	state() {
		this.tools.map(tool => {
			let command = tool.getAttribute("data-arg");
			let state = document.queryCommandState(command);
			$(tool).toggleClass("down", !state).removeClass("active");
		});
		
		let state = document.queryCommandValue("fontName").replace(/"/g, "");
		window.menuBar.update(`//Menu[@name="${state}"]`, {"is-checked": 1});
	},
	format(command, value) {
		document.execCommand(command, false, value || null);
		this.state();
	}
}
