
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
				
				// init all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].init === "function")
					.map(i => Self[i].init(Spawn));

				// auto show "blank view"
				Spawn.data.tabs.dispatch({ ...event, type: "show-blank-view" });

				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;
			case "spawn.init":
				Self.dispatch({ ...event, type: "tab.new" });
				break;
			case "spawn.blur":
				if (Spawn.data && Spawn.data.tabs.active) {
					Edit.saveSelection(Spawn.data.tabs.active);
				}
				// make sure tool obeys window state
				Spawn.data.tabs.els.toolColor.addClass("blurred");
				break;
			case "spawn.focus":
				if (Spawn.data && Spawn.data.tabs.active) {
					Edit.restoreSelection(Spawn.data.tabs.active);
				}
				// make sure tool obeys window state
				Spawn.data.tabs.els.toolColor.removeClass("blurred");
				break;
			case "open.file":
				(event.files || [event]).map(async fHandle => {
					let file = await fHandle.open({ responseType: "text" });
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "tab.new" });
				});
				break;

			case "before-menu:font-color":
				// simple "reset" for now
				event.xMenu.selectNodes(`.//Color[@active]`).map(xMenu =>
					xMenu.removeAttribute("active"));
				break;
			case "before-menu:font-families":
				// console.log("TODO:", event);
				break;

			// tab related events
			case "tab.new":
				if (event.file) Spawn.data.tabs.add(event.file);
				else Spawn.data.tabs.add({ new: "Blank" });
				break;
			case "tab.clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;

			case "load-samples":
				// opening image file from application package
				event.samples.map(async name => {
					// forward event to app
					let file = await Spawn.data.tabs.openLocal(`~/samples/${name}`);
					Self.dispatch({ ...event, type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// hide blank view
				Spawn.data.tabs.dispatch({ ...event, type: "hide-blank-view" });
				// open file with Files
				Spawn.data.tabs.add(event.file);
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
				if (tabs.active.file.isNew) {
					return Self.dispatch({ ...event, type: "save-file-as" });
				}
				return tabs.active.file.toBlob();
				window.dialog.save(tabs.active.file, tabs.active.file.toBlob());
				break;
			case "save-file-as":
				tabs = Spawn.data.tabs;
				// pass on available file types
				Spawn.dialog.saveAs(tabs.file, {
					txt:  () => tabs.active.file.toBlob({ kind: "txt" }),
					html: () => tabs.active.file.toBlob({ kind: "html" }),
					md:   () => tabs.active.file.toBlob({ kind: "md" }),
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
				if (event.delayed) {
					Spawn.data.tabs.removeDelayed();
				} else if (value > 1) {
					Spawn.data.tabs.active.tabEl.find(`[sys-click]`).trigger("click");
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
