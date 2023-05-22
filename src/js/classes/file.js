
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
		str.push(`<meta name="indents" value="[2,2,14.75]"/>`);
		return `<def>${str.join("")}</def>`;
	}

	get data() {
		let data = this._file.data;

		switch (this.kind) {
			case "rtf": data = "parse RTF file"; break;
			case "txt": data = data.replace(/\n/g, "<br>"); break;
			case "md": data = service.turnup(data); break;
		}

		return data || "";
	}

	autoPageBreak() {
		if (!this.setup.pageView) return;

		// freeze scrollbar
		let sTop = this._el.scrollTop();
		this._el.addClass("freeze-scroll");

		// save cursor position
		let selection = new Selection;
		selection.save();

		let range = document.createRange(),
			pages = this._el.find(".page > div"),
			appendPage = (pageContent) => {
				let lastPage = pageContent.parentNode,
					pageCopy = $(lastPage.cloneNode(true)),
					index = +pageCopy.data("index") + 1,
					newPage;
				// update page index
				pageCopy.data({ index });
				// delete page contents
				pageCopy.find(`> div > *`).remove();
				// append after last page
				pageCopy = lastPage.parentNode.appendChild(pageCopy[0]);
				// mutate pages array & for-loop
				newPage = pageCopy.childNodes[1];
				pages.push(newPage);
				pl++;
				// return page
				return newPage; // <-- first child is white space text node
			},
			p, pl;
		// restitch split paragraphs if exists, from previous
		for (p=0, pl=pages.length; p<pl; p++) {
			let currPage = pages[p],
				nextPage = pages[p+1],
				pageRect = currPage.getBoundingClientRect(),
				pageDim = pageRect.top + pageRect.height;
			if (nextPage) {
				// check for (previously) splited paragraphs
				// ...test only the last node on page
				let textNodes = currPage.selectNodes(`.//text()`),
					lastNode = textNodes[textNodes.length-1],
					pNode = lastNode.parentNode;
				if (pNode.classList.contains("_split-start_")) {
					// reset class name
					pNode.classList.remove("_split-start_");
					// stitch text node together with original text
					let newTextNode = document.createTextNode(lastNode.textContent + nextPage.firstChild.childNodes[0].textContent);
					pNode.replaceChild(newTextNode, pNode.firstChild);
					// update reference to last node
					lastNode = newTextNode;
					// delete split-end paragraph
					nextPage.removeChild(nextPage.firstChild);
				}
				while (nextPage.childNodes.length) {
					// update range, in order to measure textnode
					range.selectNodeContents(lastNode);
					// measure available height
					let lastRect = range.getBoundingClientRect(),
						availableSpace = pageDim - (lastRect.top + lastRect.height),
						nextPageFirstItem = nextPage.selectSingleNode(`.//text()`),
						nextPageFirstLineHeight;
					range.selectNodeContents(nextPageFirstItem);
					nextPageFirstLineHeight = range.getClientRects()[0].height;
					if (availableSpace < nextPageFirstLineHeight) break;
					// pull in next page first item
					currPage.appendChild(nextPageFirstItem.parentNode);
					// update variable references
					textNodes = currPage.selectNodes(`.//text()`);
					lastNode = textNodes[textNodes.length-1];
				}
				// delete next page, if empty
				if (!nextPage.childNodes.length) {
					nextPage.parentNode.parentNode.removeChild(nextPage.parentNode);
				}
			}
		}
		// refresh pages variable
		pages = this._el.find(".page > div");
		// loop pages
		for (p=0, pl=pages.length; p<pl; p++) {
			let currPage = pages[p],
				nextPage = pages[p+1],
				pageRect = currPage.getBoundingClientRect(),
				pageDim = pageRect.top + pageRect.height,
				textNodes = currPage.selectNodes(`.//text()`).reverse(), // for performance, start from end
				tl = textNodes.length,
				t = 0;

			for (; t<tl; t++) {
				// put text node in range, in order to measure it
				range.selectNodeContents(textNodes[t]);

				let textRect = range.getBoundingClientRect(),
					firstLineHeight = range.getClientRects()[0].height;
				if (pageDim < textRect.top + firstLineHeight) { // <-- expand check 1
					// add new page, if needed
					if (!nextPage) {
						nextPage = appendPage(currPage);
					}
					// prepend this textNode to that page
					nextPage.insertBefore(textNodes[t].parentNode, nextPage.firstChild);
				} else if (pageDim < (textRect.top + textRect.height)) { // <-- expand check 2
					// add new page, if needed
					if (!nextPage) nextPage = appendPage(currPage);

					let cloneStr;
					// split element if it is "paragraph" 
					if (textNodes[t].parentNode.nodeName === "P") {
						let words = textNodes[t].textContent.split(" "),
							total = textNodes[t].textContent.length,
							cut = textNodes[t].textContent.length,
							newRect = range.getBoundingClientRect();
						
						while (pageDim < (newRect.top + newRect.height)) {
							let word = words.pop();
							cut -= word.length + 1; // preceding space character
							range.setEnd(textNodes[t], cut);
							newRect = range.getBoundingClientRect();
						}

						range.setStart(textNodes[t], cut + 1); // removes first space character
						range.setEnd(textNodes[t], total);
						cloneStr = range.toString();
						range.deleteContents();
					}
					// tag element; has been splited
					textNodes[t].parentNode.classList.add("_split-start_");
					if (cloneStr) {
						// prepend this textNode to that page
						let clone = nextPage.insertBefore(textNodes[t].parentNode.cloneNode(), nextPage.firstChild);
						clone.classList.remove("_split-start_");
						clone.classList.add("_split-end_");
						clone.innerHTML = cloneStr;
					}
				}
			}
		}

		// unfreeze scrollbar
		this._el.removeClass("freeze-scroll").scrollTop(sTop);

		// restore cursor position
		selection.restore();
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
