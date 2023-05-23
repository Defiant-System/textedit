
@import "./classes/selection.js"
@import "./classes/file.js"
@import "./classes/file-tabs.js"

@import "./modules/color.js"
@import "./modules/edit.js"
@import "./modules/test.js"


@import "./modules/filetype.md.js"
@import "./modules/filetype.rtf.js"


const textedit = {
	init() {
		
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
