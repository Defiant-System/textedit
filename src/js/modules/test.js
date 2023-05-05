
let Test = {
	init(APP, spawn) {
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// setTimeout(() => this.dialog(spawn), 300);

		setTimeout(() => {
				let node = spawn.find(`div[contenteditable="true"]`)[0].childNodes[2];
				APP.dispatch({type: "editor.select-text", spawn, node, start: 7, len: 10 });
			}, 200);
		setTimeout(() => APP.dispatch({ type: "editor.format", spawn, arg: "bold" }), 300);
	},
	dialog(spawn) {
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
		});
	}
};
