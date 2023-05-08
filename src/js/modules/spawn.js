
// textedit.spawn

{
	init() {

	},
	dispose(event) {
		let Spawn = event.spawn;
		let cmd = { type: "open.file", files: [] };
		for (let key in Spawn.data.tabs._stack) {
			let tab = Spawn.data.tabs._stack[key];
			if (tab.file.xNode) cmd.files.push(tab.file.path);
		}
		return cmd.files.length ? cmd : {};
	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.spawn,
			Spawn = event.spawn,
			tabs,
			file,
			editorEl,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);
				
				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;
			case "spawn.init":
				Self.dispatch({ ...event, type: "tab.new" });
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
					Self.dispatch({ ...event, file, type: "tab.new" });
				});
				break;

			case "before-menu:font-families":
				// TODO:
				console.log(event);
				break;

			// tab related events
			case "tab.new":
				Spawn.data.tabs.dispatch({ ...event, type: "show-blank-view" });

				// file = event.file || new karaqu.File({ kind: "txt", data: "" });
				// Spawn.data.tabs.add(file);
				break;
			case "tab.clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;

			// from menubar
			case "open-file":
				Spawn.dialog.open({
					txt: fsItem => Self.dispatch(fsItem),
					html: fsItem => Self.dispatch(fsItem),
					md: fsItem => Self.dispatch(fsItem),
				});
				break;
			case "save-file":
				tabs = Spawn.data.tabs;
				if (tabs._active.file.isNew) {
					return Self.dispatch({ ...event, type: "save-file-as" });
				}
				return tabs._active.file.toBlob();
				window.dialog.save(tabs._active.file, tabs._active.file.toBlob());
				break;
			case "save-file-as":
				tabs = Spawn.data.tabs;
				// pass on available file types
				Spawn.dialog.saveAs(tabs.file, {
					txt:  () => tabs._active.file.toBlob({ kind: "txt" }),
					html: () => tabs._active.file.toBlob({ kind: "html" }),
					md:   () => tabs._active.file.toBlob({ kind: "md" }),
				});
				break;
			case "new-spawn":
				APP.dispatch({ type: "new-spawn" });
				break;
			case "merge-all-windows":
				Spawn.siblings.map(oSpawn => {
					for (let key in oSpawn.data.tabs._stack) {
						let ref = oSpawn.data.tabs._stack[key];
						Spawn.data.tabs.merge(ref);
					}
					// close sibling spawn
					oSpawn.close();
				});
				break;
			case "close-tab":
				value = Spawn.data.tabs.length;
				if (value > 1) {
					Spawn.data.tabs._active.tabEl.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					Self.dispatch({ ...event, type: "close-spawn" });
				}
				break;
			case "close-spawn":
				// system close window / spawn
				karaqu.shell("win -c");
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			default:
				if (event.type.startsWith("editor.")) {
					// proxy event
					return Spawn.data.tabs.dispatch(event);
				}
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "./blank-view.js",
}
