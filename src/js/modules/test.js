
let Test = {
	init(APP, spawn) {
		// return;
		// return setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// return setTimeout(() => spawn.find(`.sample:nth(2)`).trigger("click"), 300);

		// return setTimeout(() => spawn.updateTitle({ isDirty: true }), 300);
		// return setTimeout(() => APP.dispatch({ type: "save-file", spawn }), 300);
		
		setTimeout(() => {
				// let node = spawn.find(`div[contenteditable="true"]`)[0].childNodes[4].childNodes[0];
				let node = spawn.find(`div[contenteditable="true"]`)[1].childNodes[2].childNodes[0];
				APP.dispatch({ type: "editor.select-text", spawn, node, start: 1, len: 3 });
			}, 300);
		// setTimeout(() => APP.dispatch({ type: "editor.format", spawn, arg: "bold" }), 350);
	},
	dialog(spawn) {
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
		});
	}
};
