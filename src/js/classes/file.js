
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "txt" });
		this._el = el.parent().parent().data({ kind: this.kind });

		this.id = "f"+ Date.now();
		this.setup = {
			pageView: false, // file.kind === "md",
			hideRulers: true,
		};

		switch (this.kind) {
			case "txt": break;
			case "md":
				if (this._file.data.endsWith("</def>")) {
					// parse defs
					let i = this._file.data.lastIndexOf(`<def>`),
						def = this._file.data.slice(i);
					// update file data
					this._file.data = this._file.data.slice(0, -def.length);
					// extract defs
					$(def).find(`meta`).map(meta => {
						let name = meta.getAttribute("name"),
							value = meta.getAttribute("value").guessType();
						this.setup[name] = value;
					});
				}
				break;
		}

		// console.log( this._file );
	}

	get kind() {
		return this._file.kind;
	}

	get base() {
		return this._file.base;
	}

	get isNew() {
		return !this._file.xNode;
	}

	get isDirty() {
		// TODO:
	}

	get def() {
		let str = [];
		str.push(`<meta name="pageView" value="true"/>`);
		str.push(`<meta name="hideRulers" value="false"/>`);
		return `<def>${str.join("")}</def>`;
	}

	get data() {
		let data = this._file.data;

		switch (this.kind) {
			case "txt": data = data.replace(/\n/g, "<br>"); break;
			case "md": data = service.turnup(data); break;
		}

		return data || "";
	}

	appendPage(pageContent) {
		let lastPage = pageContent.parentNode,
			pageCopy = $(lastPage.cloneNode(true)),
			index = +pageCopy.data("index") + 1;
		// update page index
		pageCopy.data({ index });
		// delete page contents
		pageCopy.find(`> div > *`).remove();
		// append after last page
		pageCopy = lastPage.parentNode.appendChild(pageCopy[0]);
		// return new page
		return pageCopy.childNodes[1]; // <-- first child is white space text node
	}

	autoPageBreak() {
		if (!this.setup.pageView) return;

		let range = document.createRange(),
			pages = this._el.find(".page > div"),
			checkAgain = false;

		for (let p=0, pl=pages.length; p<pl; p++) {
			let currPage = pages[p],
				nextPage = pages[p+1],
				pageRect = currPage.getBoundingClientRect(),
				pageHeight = pageRect.top + pageRect.height,
				textNodes = currPage.selectNodes(`.//text()`).reverse(); // for performance, start from end

			// console.log( "page height: ", pageHeight );
			for (let t=0, tl=textNodes.length; t<tl; t++) {
				// put text node in range, in order to measure it
				range.selectNodeContents(textNodes[t]);

				let textRect = range.getBoundingClientRect();
				if (pageHeight < (textRect.top + textRect.height)) {
					// add new page, if needed
					if (!nextPage) nextPage = this.appendPage(currPage);

					// console.log( "old height: ", textRect.top + textRect.height );

					// split element if it is "paragraph" 
					if (textNodes[t].parentNode.nodeName === "P") {
						let words = textNodes[t].textContent.split(" "),
							total = textNodes[t].textContent.length,
							cut = textNodes[t].textContent.length,
							newRect = range.getBoundingClientRect();
						
						while (pageHeight < (newRect.top + newRect.height)) {
							cut -= words.pop().length + 1;
							range.setEnd(textNodes[t], cut);
							newRect = range.getBoundingClientRect();
						}

						range.setStart(textNodes[t], cut);
						range.setEnd(textNodes[t], total);
						range.deleteContents();
					}

					// prepend this textNode to that page
					// nextPage.insertBefore(textNodes[t].parentNode, nextPage.firstChild);
					// this is to recursively call this function again
					checkAgain = true;
				} else {
					break; // for performance; exit loop if text node is visible
				}
			}
		}
	}

	toBlob(opt={}) {
		let data = this._el.html(),
			// file kind, if not specified
			kind = opt.kind || this.kind,
			type;

		switch (kind) {
			case "txt":
				type = "text/plain";
				data = data.replace(/<br>|<br\/>/g, "\n").stripHtml();
				break;
			case "htm":
			case "html":
				type = "text/html";
				break;
			case "md":
				// TODO: if in page view mode, concat string from page-elements
				type = "text/markdown";
				data = service.turndown(data);
				// console.log( this._file.data === data );
				// console.log( 1, this._file.data );
				// console.log( 2, this._el.html() );
				// console.log( 3, data );
				break;
		}
		// console.log( data );
		return new Blob([data], { type });
	}

	dispatch(event) {
		let name,
			value;
		switch (event.type) {
			// native events
			case "change":
				break;
		}
	}
}
