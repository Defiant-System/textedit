
@import "./classes/file.js"
@import "./classes/tabs.js"

@import "./modules/color.js"
@import "./modules/edit.js"
@import "./modules/test.js"

// markdown support
@import "./external/turnup.js"
@import "./external/turndown.js";
let service = new TurndownService();
// custom extending with "turnup"
service.turnup = turnup;


const textedit = {
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		// setTimeout(() => this.dispatch({ type: "open-help" }), 250);
	},
	dispose(event) {
		if (event.spawn) {
			return this.spawn.dispose(event);
		}
	},
	dispatch(event) {
		let Self = textedit,
			spawn,
			el;
		// proxy spawn events
		if (event.spawn) return Self.spawn.dispatch(event);
		
		switch (event.type) {
			// system events
			case "new-spawn":
			case "window.init":
				spawn = window.open("spawn");
				// Self.spawn.dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "open.file":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, spawn });
				break;
		}
	},
	spawn: @import "./modules/spawn.js",
};

window.exports = textedit;
