
// textedit.blankView

{
	init() {
		
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