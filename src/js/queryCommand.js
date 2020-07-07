
const queryCommand = {
	dispatch(event) {
		let self = queryCommand;
		switch (event.type) {
			case "query-command-state":
				self.state();
				break;
			case "format":
				self.format(event.arg);
				break;
			case "format-fontSize":
				self.format("fontSize", event.arg);
				break;
			case "format-fontName":
				self.format("fontName", event.arg);
				break;
		}
	},
	state() {
		textEdit.tools.map(tool => {
			const command = tool.getAttribute("data-arg");
			const state = document.queryCommandState(command);
			$(tool).toggleClass("down", !state).removeClass("active");
		});
		
		let state = document.queryCommandValue("fontName").replace(/"/g, "");
		window.menuBar.update(`//Menu[@name="${state}"]`, {"is-checked": 1});
	},
	format(command, value) {
		document.execCommand(command, false, value || null);
		this.state();
	}
};
