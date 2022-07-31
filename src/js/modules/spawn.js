
// textedit.spawn

{
	init() {
		
	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.spawn,
			Spawn = event.spawn,
			file,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);
				break;
			case "open.file":
				event.files.map(async fHandle => {
					let file = await fHandle.open({ responseType: "text" });
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "new-tab" });
				});
				break;

			// tab related events
			case "new-tab":
				file = event.file || new defiant.File({ kind: "txt" });
				Spawn.data.tabs.add(file);
				break;
			case "tab-clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab-close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;
		}
	}
}
