
// textedit.blankView

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			el: window.find(".blank-view"),
		};
	},
	dispatch(event) {
		let APP = textedit,
			Spawn = event.spawn,
			Self = APP.blankView,
			file,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "open-filesystem":
				APP.spawn.dispatch({ ...event, type: "open-file" });
				break;
		}
	}
}