
let Test = {
	init(APP, spawn) {
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		// setTimeout(() => Spawn.find("content > div:nth(1)").html("test"), 310);

		// setTimeout(() => this.dialog(spawn), 300);

		setTimeout(() => APP.dispatch({ type: "select-text", spawn }), 200);
	},
	dialog(spawn) {
		spawn.dialog.open({
			txt: fsItem => console.log(fsItem),
		});
	}
};
