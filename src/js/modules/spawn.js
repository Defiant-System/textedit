
// textedit.spawn

{
	init() {

	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.spawn,
			Spawn = event.spawn,
			tabs,
			file,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);

				// temp
				// setTimeout(() => Self.dispatch({ type: "new-tab", spawn: Spawn }), 300);
				// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);
				break;
			case "spawn.blur":
				if (Spawn.data) Spawn.data.tabs.saveSelection();
				break;
			case "spawn.focus":
				if (Spawn.data) Spawn.data.tabs.restoreSelection();
				break;
			case "open.file":
				(event.files || [event]).map(async fHandle => {
					let file = await fHandle.open({ responseType: "text" });
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "new-tab" });
				});
				break;
			case "save-file":
				tabs = Spawn.data.tabs;
				if (!tabs.file.xNode) {
					return Self.dispatch({ ...event, type: "save-file-as" });
				}
				window.dialog.save(tabs.file, tabs.toBlob());
				break;
			case "save-file-as":
				tabs = Spawn.data.tabs;
				// pass on available file types
				Spawn.dialog.saveAs(tabs.file, {
					txt:  () => tabs.file.toBlob({ kind: "txt" }),
					html: () => tabs.file.toBlob({ kind: "html" }),
					md:   () => tabs.file.toBlob({ kind: "md" }),
				});
				break;

			// tab related events
			case "new-tab":
				file = event.file || new defiant.File({ kind: "txt", data: "" });
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
