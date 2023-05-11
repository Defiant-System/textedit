
let Test = {
	init(APP, spawn) {
		// return;

		// return setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// return setTimeout(() => spawn.find(`.sample:nth(2)`).trigger("click"), 300);

		// return setTimeout(() => spawn.updateTitle({ isDirty: true }), 300);
		// return setTimeout(() => APP.dispatch({ type: "save-file", spawn }), 300);
		
		setTimeout(() => {
				let node = spawn.find(`div[contenteditable="true"]`)[1].childNodes[2].childNodes[0];
				APP.dispatch({ type: "editor.select-text", spawn, node, start: 5, len: 9 });
			}, 300);
		setTimeout(() => APP.dispatch({ type: "editor.format-fontSize", spawn, value: 10 }), 350);
		// setTimeout(() => APP.dispatch({ type: "editor.format-fontName", spawn, value: "Arial Black" }), 350);

		// setTimeout(() => spawn.find(`.toolbar-selectbox_[data-menu="font-families"]`).trigger("mousedown"), 310);
	},
	dialog(spawn) {
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
		});
	}
};
