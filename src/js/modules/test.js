
let Test = {
	init(APP, spawn) {
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// setTimeout(() => this.dialog(spawn), 300);

		return;
		
		return setTimeout(() => APP.dispatch({ type: "save-file", spawn }), 300);

		setTimeout(() => {
				// let node = spawn.find(`div[contenteditable="true"]`)[0].childNodes[4].childNodes[0];
				let node = spawn.find(`div[contenteditable="true"]`)[0].childNodes[2].childNodes[0];
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
