
// textEdit.tabs

{
	init() {
		// fast references
		this.template = window.find("div[data-id='editor']").clone();
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.tabs,
			el;
		switch (event.type) {
			case "tab-new":
				el = window.tabs.add("New Document");
				break;
			case "tab-clicked":
				break;
			case "tab-close":
				break;
		}
	}
}
