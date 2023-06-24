
let Test = {
	init(APP, spawn) {
		// TODO: Test with TABLE between pages

		// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 300);

		// return setTimeout(() => this.setupForCursorPages(APP, spawn), 500);
		// return setTimeout(() => this.deleteParagraphs(APP, spawn), 500);

		// SpellCheck.load("en_US");
		// SpellCheck.load("de_DE");
		// return setTimeout(() => this.spellCheckTest(APP, spawn), 500);

		return;
		// return setTimeout(() => APP.dispatch({ type: "toggle-ruler", spawn }), 500);
		// return setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 500);


		// return setTimeout(() => $(`.def-desktop_`).trigger("mousedown").trigger("mouseup"), 350);

		// return setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// return setTimeout(() => spawn.find(`.sample:nth(2)`).trigger("click"), 300);

		// return setTimeout(() => APP.dispatch({ type: "set-layout", arg: "page-view", spawn }), 300);

		// return setTimeout(() => spawn.updateTitle({ isDirty: true }), 300);
		// return setTimeout(() => APP.dispatch({ type: "save-file", spawn }), 300);
		
		setTimeout(() => {
				let node = spawn.find(`div[contenteditable="true"] p:nth(1)`)[0].childNodes[1].childNodes[0];
				APP.dispatch({ type: "editor.select-text", spawn, node, start: 2, length: 5 });
			}, 300);
		// setTimeout(() => APP.dispatch({ type: "editor.format-fontSize", spawn, value: 18 }), 350);
		// setTimeout(() => APP.dispatch({ type: "editor.format-fontName", spawn, value: "Arial Black" }), 350);

		setTimeout(() => spawn.find(`.toolbar-tool_[data-menu="font-color"]`).trigger("mousedown"), 310);
		// setTimeout(() => spawn.find(`.toolbar-selectbox_[data-menu="font-families"]`).trigger("mousedown"), 310);
	},
	spellCheckTest(APP, spawn) {

		// console.log( SpellCheck.check("autostraße") );
		// console.log( SpellCheck.check("world") );
		// console.log( SpellCheck.suggest("wordl", 3) );

	},
	setupForCursorPages(APP, spawn) {
		// position: bottom of page 1
		// let node = spawn.find(`div[contenteditable="true"] p:nth(4)`)[0];
		// APP.dispatch({ type: "editor.select-text", spawn, node, start: 230, length: 0 });

		// position: top of page 2
		let node = spawn.find(`div[contenteditable="true"] p:nth(5)`)[0];
		APP.dispatch({ type: "editor.select-text", spawn, node, start: 3, length: 0 });

		spawn.find(".file").scrollTop(400);
	},
	deleteParagraphs(APP, spawn) {
		// let node = spawn.find(`div[contenteditable="true"] p:nth(0)`)[0];
		// APP.dispatch({ type: "editor.select-text", spawn, node, start: 0, length: 699 });

		spawn.find(`div[contenteditable="true"] p:nth(0)`).remove();
		// spawn.find(`div[contenteditable="true"] p:nth(0)`).remove();
		// spawn.find(`div[contenteditable="true"] p:nth(0)`).remove();

		spawn.data.tabs.dispatch({ type: "auto-page-break", spawn });

		setTimeout(() => spawn.find(".file").scrollTop(1050), 350);
	},
	dialog(spawn) {
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
		});
	}
};
