
// Declaring custom Selection class - is this OK?
class Selection {

	constructor(node, startOffset, endOffset) {
		this._selection = document.getSelection();
		// select if provided
		if (node && startOffset !== false) this.select(...arguments);
		// reference to root node
		this._root = this.getRoot();
	}

	expand(unit) {
		switch (unit) {
			case "word":
				// remember
				this._selection.collapseToStart();
				this._selection.modify("move", "backward", "word");
				this._selection.modify("extend", "forward", "word");
				break;
		}
	}

	get container() {
		let el = this._selection.focusNode;
		if (el.nodeType == Node.TEXT_NODE) el = el.parentNode;
		return el;
	}

	get collapsed() {
		return this._selection.getRangeAt(0).collapsed;
	}

	get type() {
		return this._selection.type;
	}

	collapse(node, offset) {
		if (this.collapsed) return;
		node = node || this._anchorNode;
		offset = offset || this._anchorOffset;
		this._selection.collapse(node, offset);
	}

	toString() {
		return this._selection.toString();
	}

	save() {
		let textNodes = this.getOnlyTextNodes(this._root),
			anchorNode = this._selection.anchorNode,
			anchorOffset = Math.min(this._selection.anchorOffset, this._selection.focusOffset),
			len = textNodes.indexOf(anchorNode) + 1,
			offset = 0,
			str;
		// calculate "start" offset
		while (len--) {
			str = textNodes[len].nodeValue.toString();
			if (textNodes[len] === anchorNode) {
				str = str.slice(0, anchorOffset);
			}
			offset += str.length;
		}
		this._startOffset = offset;
		// calculate "end" offset
		str = this._selection.toString().replace(/\n/g, "");
		this._endOffset = str.length;
		// console.log(this._startOffset, this._endOffset);
	}

	restore() {
		if (!this._root) return;
		this.select(this._root, this._startOffset, this._endOffset);
	}

	select(node, startOffset, endOffset) {
		let range = document.createRange(),
			textNodes = node.nodeType === Node.TEXT_NODE ? [node] : this.getOnlyTextNodes(node),
			anchorNode,
			anchorOffset = startOffset,
			focusNode,
			focusOffset = endOffset,
			il = textNodes.length,
			i = 0,
			str;
		for (; i<il; i++) {
			anchorNode = textNodes[i];
			if (anchorNode.nodeValue.length >= anchorOffset) break;
			anchorOffset -= anchorNode.nodeValue.length;
		}
		if (endOffset) {
			for (; i<il; i++) {
				focusNode = textNodes[i];
				str = focusNode.nodeValue;
				if (focusNode === anchorNode) str = str.slice(anchorOffset);
				if (str.length >= focusOffset) break;
				focusOffset -= str.length;
			}
			if (anchorNode === focusNode) focusOffset += anchorOffset;
			// else focusOffset += 1;
		} else {
			focusNode = anchorNode;
			focusOffset = anchorOffset;
		}
		range.setStart(anchorNode, anchorOffset);
		range.setEnd(focusNode, focusOffset);
		this._selection.removeAllRanges();
		this._selection.addRange(range);
	}

	static isOnFirstLine(edit) {
		let rect = edit.getBoundingClientRect(),
			r1 = document.createRange(),
			sel = document.getSelection(),
			r2 = sel.getRangeAt(0),
			r1h;
		r1.selectNodeContents(edit.childNodes[0]);
		r1h = r1.getClientRects()[0].height;
		return Math.abs(rect.top - r2.getClientRects()[0].top) < r1h;
	}

	static getCaretPosition() {
		let x = 0,
			y = 0,
			sel = document.getSelection();
		if (sel.rangeCount) {
			let range = sel.getRangeAt(0).cloneRange();
			if (range.getClientRects()) {
				range.collapse(true);
				let rect = range.getClientRects()[0];
				if(rect) {
					y = rect.top;
					x = rect.left;
				}
			}
		}
		return { x, y };
	}

	getOnlyTextNodes(node) {
		let arr = [];
		// get all text nodes with in node
		node.childNodes.map(node => {
			// console.log(node);
			switch (node.nodeType) {
				case Node.TEXT_NODE:
					arr.push(node);
					break;
				case Node.ELEMENT_NODE:
					arr.push(...this.getOnlyTextNodes(node));
					break;
			}
		});
		return arr;
	}

	getRoot() {
		let node = this._selection.baseNode;
		if (!node) return;
		// climb to root node
		while (node.nodeType !== Node.ELEMENT_NODE || !node.getAttribute("contenteditable")) {
			node = node.parentNode;
		}
		return node;
	}

}
