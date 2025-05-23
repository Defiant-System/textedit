
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
			Tabs = Spawn.data ? Spawn.data.tabs : false,
			file,
			editor,
			editorEl,
			xNode,
			name,
			value,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new FileTabs(Self, Spawn);
				
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
				if (Spawn.data && Tabs.active) {
					Edit.saveSelection(Tabs.active);
				}
				// make sure tool obeys window state
				Tabs.els.toolColor.addClass("blurred");
				break;
			case "spawn.focus":
				if (Spawn.data && Tabs.active) {
					Edit.restoreSelection(Tabs.active);
				}
				// make sure tool obeys window state
				Tabs.els.toolColor.removeClass("blurred");
				break;
			case "spawn.keystroke":
				// temp
				Tabs.dispatch({ ...event, type: "auto-page-break" });
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
				// mark as "active", if color is among palette colors
				value = Edit.commandState.fgColor;
				xNode = event.xMenu.selectSingleNode(`.//Color[@arg="${value}"]`);
				if (xNode) xNode.setAttribute("active", 1);
				break;
			case "before-menu:font-families":
				// console.log("TODO:", event);
				break;
			case "before-menu:file-preferences":
				// file layout
				value = Tabs.els.content.hasClass("page-view") ? "page-view" : "web-view";
				event.xMenu.selectNodes(`./*[@check-group="file-layout"]`).map(xMenu => {
					if (xMenu.getAttribute("arg") === value) xMenu.setAttribute("is-checked", 1);
					else xMenu.removeAttribute("is-checked");
				});
				// toggle ruler
				xNode = event.xMenu.selectSingleNode(`./*[@click="toggle-ruler"]`);
				value = Tabs.els.content.hasClass("show-ruler");
				if (value) xNode.setAttribute("is-checked", 1);
				else xNode.removeAttribute("is-checked");
				break;

			// tab related events
			case "tab.new":
				Tabs.els.content.addClass("no-ruler-anim"); // prevent smooth animation
				if (event.file) Tabs.add(event.file);
				else Tabs.add({ new: "Blank" });
				requestAnimationFrame(() => Tabs.els.content.removeClass("no-ruler-anim")); // enable anim
				break;
			case "tab.clicked":
				Tabs.els.content.addClass("no-ruler-anim"); // prevent smooth animation
				Tabs.focus(event.el.data("id"));
				requestAnimationFrame(() => Tabs.els.content.removeClass("no-ruler-anim")); // enable anim
				break;
			case "tab.close":
				Tabs.els.content.addClass("no-ruler-anim"); // prevent smooth animation
				Tabs.remove(event.el.data("id"));
				requestAnimationFrame(() => Tabs.els.content.removeClass("no-ruler-anim")); // enable anim
				break;

			case "load-samples":
				// opening image file from application package
				event.samples.map(async name => {
					// let samples check
					let check = window.bluePrint.selectSingleNode(`//Data/Samples/*[@name="${name}"]`);
					if (check) name = check.getAttribute("path") + name;
					// forward event to app
					let file = await Tabs.openLocal(name);
					Self.dispatch({ ...event, type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// hide blank view
				Tabs.dispatch({ ...event, type: "hide-blank-view" });
				// open file with Files
				Tabs.add(event.file);
				break;

			// from menubar
			case "new-file":
				// blank file
				data = `<def>
							<meta name="view" value="page"/>
							<meta name="hideRulers" value="false"/>
							<meta name="indents" value="[2,2,14.75]"/>
						</def>`;
				file = new karaqu.File({ kind: "md", data });
				Self.dispatch({ ...event, type: "prepare-file", file });
				break;
			case "open-file":
				Spawn.dialog.open({
					txt: fsItem => Self.dispatch(fsItem),
					md: fsItem => Self.dispatch(fsItem),
					y: fsItem => Self.dispatch(fsItem),
				});
				break;
			case "save-file":
				if (Tabs.file.isNew) {
					return Self.dispatch({ ...event, type: "save-file-as" });
				}
				// remember; system file is wrapped with custom file class
				Spawn.dialog.save(Tabs.file, Tabs.toBlob());
				break;
			case "save-file-as":
				// pass on available file types
				Spawn.dialog.saveAs(Tabs.file, {
					txt: () => Tabs.toBlob({ kind: "txt" }),
					md: () => Tabs.toBlob({ kind: "md" }),
					y: () => Tabs.toBlob({ kind: "y" }),
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
				value = Tabs.length;
				if (event.delayed) {
					Tabs.removeDelayed();
				} else if (value > 1) {
					Tabs.active.tabEl.find(`[sys-click]`).trigger("click");
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
			case "toggle-view-mode":
				file = Tabs.active.file;
				value = event.el.hasClass("tool-active_");
				if (value) {
					el = file._el
							.removeClass("md-mode")
							.find(".page > div[data-id]");
					data = Markdown.toHTML(el.find(" > pre").text());
					el.html(data);
					// apply y-book code blocks
					Tabs.applyCodeBlocks(file, el);
				} else {
					// first revert codemirror code
					file._el.find(`pre > code[class*="language-y-"]`).map(elem => {
						let uuid = elem.getAttribute("data-uuid");
						elem.innerHTML = file._editors[uuid].doc.getValue();
					});
					// now, change HTML to markdown
					file
						.toBlob({ kind: "y" })
						.text().then(text => {
							file._el
								.addClass("md-mode")
								.find(".page > div[data-id]")
								.html(`<pre>${text}</pre>`);
						});
				}
				return !value;
			case "set-layout":
				Tabs.els.content.removeClass("page-view web-view y-book").addClass(event.arg);
				break;
			case "toggle-ruler":
				value = Tabs.els.content.hasClass("show-ruler");
				Tabs.els.content.toggleClass("show-ruler", value);
				break;

			case "yshader-play-toggle":
				event.el.toggleClass("running", !event.play);
				break;
			case "yshader-close":
				// restore icon
				event.el.removeClass("running");
				// delete referemce
				delete Self.yShaderDispatch;
				break;

			case "run-code":
				if (event.el.hasClass("running")) {
					// restore icon
					event.el.removeClass("running");
					// signal pause to yShader
					Self.yShaderDispatch({ type: "pause-shader" });
					return;
				}
				// change icon
				event.el.addClass("running");
				// prepare yShader for new shader code
				el = event.el.parents("code");
				editor = Tabs.active.file._editors[el.data("uuid")];
				data = {
					type: "run-shader",
					code: editor.doc.getValue(),
					callback: Self.dispatch,
					spawn: Spawn,
					el: event.el,
				};

				if (!Self.yShaderDispatch) {
					// start yshader in the background
					karaqu.shell(`win -o sys:yshader 998`)
						.then(resp => {
							// yShader dispatch function
							Self.yShaderDispatch = resp.result;
							// pipe code to yShader function
							Self.yShaderDispatch(data);
						});
				} else {
					// pipe code to yShader function
					Self.yShaderDispatch(data);
				}
				break;
			case "reset-code":
				el = event.el.parents("code");
				editor = Tabs.active.file._editors[el.data("uuid")];
				value = editor.getTextArea().value;
				editor.doc.setValue(value);
				break;

			default:
				if (event.type && event.type.startsWith("editor.")) {
					// proxy event
					return Tabs.dispatch(event);
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
	ruler: @import "./ruler.js",
	blankView: @import "./blank-view.js",
}
