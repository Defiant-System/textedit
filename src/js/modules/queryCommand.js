
const QueryCommand = {
	init() {
		// fast references
		this.content = window.find("content");
		this.tools = window.find("[data-click='format']");

		// bind event handlers
		this.content.on("keypress", this.dispatch);

		this.format("styleWithCSS", true);
	},
	dispatch(event) {
		let APP = textedit,
			Self = QueryCommand,
			selection,
			str;
		// console.log(event);
		switch (event.type) {
			// native events
			case "keypress":
				if (event.which === 13) {
					// insert return key
					document.execCommand("insertHTML", false, "<br>");
				}
				break;
			case "window.keyup":
			case "query-command-state":
				// save selection
				Self.selection.save();
				// update toolbar item based on state
				Self.state();
				break;
			case "select-all":
			case "format":
				Self.format(event.arg);
				break;
			case "format-fontSize":
				selection = document.getSelection();
				str = `<span style="font-size: ${event.arg};">${selection}</span>`;
				Self.format("insertHTML", str);
				break;
			case "format-fontName":
				Self.format("fontName", event.arg);
				break;
		}
	},
	state() {
		this.tools.map(tool => {
			let command = tool.getAttribute("data-arg");
			let state = document.queryCommandState(command);
			$(tool).toggleClass("tool-active_", !state);
		});
		
		let state = document.queryCommandValue("fontName").replace(/"/g, "");
		window.menuBar.update(`//Menu[@name="${state}"]`, {"is-checked": 1});
	},
	format(command, value) {
		document.execCommand(command, false, value || null);
		this.state();
	},
	selection: {
		save() {
			let selection = document.getSelection();
			if (selection.rangeCount === 0) return;
			let Active = Tabs.active,
				editor = Active._editor[0],
				range = selection.getRangeAt(0),
				preSelectionRange = range.cloneRange();
			
			preSelectionRange.selectNodeContents(editor);
			preSelectionRange.setEnd(range.startContainer, range.startOffset);
			
			let start = preSelectionRange.toString().length;
			// store selection
			Active._selection = { start, end: start + range.toString().length };
		},
		restore(editor, saved) {
			let range = document.createRange(),
				nodeStack = [editor],
				foundStart = false,
				stop = false,
				charIndex = 0,
				node;

			range.setStart(editor, 0);
			range.collapse(true);

			while (!stop && (node = nodeStack.pop())) {
				if (node.nodeType == 3) {
					let nextCharIndex = charIndex + node.length;
					if (!foundStart && saved.start >= charIndex && saved.start <= nextCharIndex) {
						range.setStart(node, saved.start - charIndex);
						foundStart = true;
					}
					if (foundStart && saved.end >= charIndex && saved.end <= nextCharIndex) {
						range.setEnd(node, saved.end - charIndex);
						stop = true;
					}
					charIndex = nextCharIndex;
				} else {
					let i = node.childNodes.length;
					while (i--) {
						nodeStack.push(node.childNodes[i]);
					}
				}
			}

			let sel = document.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
};

// auto init
QueryCommand.init();
