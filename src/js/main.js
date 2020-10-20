
let file = {
	"file-1.txt": { name: "file-1", ext: "txt", base: "file-1.txt", dir: "/fs/Desktop/test/", path: "/fs/Desktop/test/file-1.txt", text: "Lorem ipsum dolor sit amet." },
	"file-2.md": { name: "file-2", ext: "md", base: "file-2.md", dir: "/fs/Desktop/", path: "/fs/Desktop/file-2.md", text: `
## How to play
Othello is a simple game that you play on an 8 by 8 in checkered board with 64 double-sided black and white discs. The game is easy to learn, but it takes time to master and develop your strategies for winning the game.

### Object of the Game
The goal is to get the majority of colour discs on the board at the end of the game.
`}
};

// https://github.com/domchristie/turndown
defiant.require("./modules/turnDown.js");


const textEdit = {
	init() {
		// fast references
		this.content = window.find("content");

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		this.dispatch({ type: "tab-new" });

		// setTimeout(() => this.dispatch({ type: "save-file" }), 500);
	},
	async openFile(event) {
		// let file = await event.open();
		this.dispatch({ type: "tab-new", file: file[event.name] });
	},
	dispatch(event) {
		let Self = textEdit,
			file;
		// console.log(event);
		switch (event.type) {
			// system events
			case "open.file":
				// console.log(event);
				Self.openFile(event);
				break;
			// custom events
			case "save-file":
				file = Self.tabs.active.file;
				// update file
				file.text = Self.tabs.active.editor.html();
				// pass on available file types
				window.dialog.save({
					...file,
					types: {
						txt: () => file.text.stripHtml(),
						html: () => file.text,
						md: () => {
							let service = new TurndownService();
							return service.turndown(file.text);
						},
					}
				});
				break;
			case "tab-new":
			case "tab-clicked":
			case "tab-close":
				Self.tabs.dispatch(event);
				break;
			case "query-command-state":
			case "format":
			case "format-fontSize":
			case "format-fontName":
			case "window.keyup":
				Self.queryCommand.dispatch(event);
				break;
		}
	},
	tabs: defiant.require("./modules/tabs.js"),
	undoStack: defiant.require("./modules/undoStack.js"),
	queryCommand: defiant.require("./modules/queryCommand.js"),
};

window.exports = textEdit;
