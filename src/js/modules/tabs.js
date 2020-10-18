
// textEdit.tabs

{
	init() {
		let editor = window.find("div[data-id='editor']");

		// fast references
		this.files = [];
		this.template = editor.clone();

		editor.remove();

		// default file
		this.file = {
			name: "New Document",
			text: `<b>Lorem</b> <i>ipsum</i> <u>dolor</u> <strike>sit</strike> amet, consectetur <i>adipisicing elit. Necessi</i>tatibus natus vero voluptatem aliquam molestias dicta aperiam dignissimos laudantium accusamus saepe!`,
		};
	},
	dispatch(event) {
		let APP = textEdit,
			Self = APP.tabs,
			file,
			editor,
			history,
			tab,
			index;
		switch (event.type) {
			case "tab-new":
				file = {
					...Self.file,
					...event.file,
				};
				// undo history
				history = new window.History;

				// create new tab if needed
				if (Self.files.length) {
					tab = window.tabs.add(file.name);
					requestAnimationFrame(() => tab.trigger("click"));
				}
				// editor
				editor = APP.content.append(Self.template.clone());
				// add file text to editor
				editor.html( file.ext === "txt" ? file.text : $.md(file.text) );
				// save to files array
				Self.files.push({ editor, file, history });

				Self.dispatch({
					type: "tab-clicked",
					el: tab || { index: () => 0 },
				});
				break;
			case "tab-clicked":
				if (Self.active) {
					Self.active.editor.addClass("hidden");
				}
				// update "active"
				index = event.el.index();
				Self.active = Self.files[index];
				Self.active.editor.removeClass("hidden");
				// Self.active.editor.focus();

				let selection = Self.active.selection;
				if (selection) {
					Self.selection.restore(selection);
				}

				// set window title to active file name
				window.title = Self.active.file.name;
				break;
			case "tab-close":
				index = event.el.index();
				Self.files.splice(index, 1);
				break;
		}
	},
	selection: {
		save() {
			let Active = textEdit.tabs.active,
				editor = Active.editor[0],
				range = document.getSelection().getRangeAt(0),
				preSelectionRange = range.cloneRange();
			
			preSelectionRange.selectNodeContents(editor);
			preSelectionRange.setEnd(range.startContainer, range.startOffset);
			
			let start = preSelectionRange.toString().length;

			Active.selection = {
				start,
				end: start + range.toString().length
			};
		},
		restore(saved) {
			let editor = textEdit.tabs.active.editor[0],
				charIndex = 0, range = document.createRange(),
				nodeStack = [editor],
				foundStart = false,
				stop = false,
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
}
