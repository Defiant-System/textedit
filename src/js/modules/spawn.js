
// textedit.spawn

{
	init() {
		
	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.spawn,
			Spawn = event.spawn,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.init":
				break;
			case "open.file":
				console.log(event.files);
				break;
		}
	}
}
