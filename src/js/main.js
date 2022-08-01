
@import "./classes/tabs.js"


@import "./external/turnDown.js";
let service = new TurndownService();


const textedit = {
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispatch(event) {
		let Self = textedit,
			spawn,
			el;
		// proxy spawn events
		if (event.spawn) return Self.spawn.dispatch(event);
		
		switch (event.type) {
			// system events
			case "window.init":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "open.file":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, spawn });
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
		}
	},
	spawn: @import "./modules/spawn.js",
};

window.exports = textedit;
