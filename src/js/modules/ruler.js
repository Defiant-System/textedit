
// textedit.spawn.ruler

{
	init(Spawn) {
		// shortcut
		this.tabs = Spawn.data.tabs;
		// bind event handlers
		Spawn.find(".rulerw i").on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = textedit,
			Self = APP.spawn.ruler,
			Tabs = Self.tabs,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				let el = $(event.target),
					size = 9,
					indent = el.prop("className").split("-")[1],
					clickX = event.clientX - +el.prop("offsetLeft") - size,
					pageW = parseInt(Tabs.els.content.cssProp("--pW"), 10),
					lineEl = Tabs.els.indentLine,
					limit = {},
					min_ = Math.min,
					max_ = Math.max;
				// calc constraints
				switch (indent) {
					case "firstline":
					case "left":
						limit.min = 0;
						limit.max = pageW - (size * 20);
						break;
					case "right":
						limit.min = size * 20;
						limit.max = pageW;
						break;
				}
				// drag object
				Self.drag = { el, lineEl, indent, clickX, limit, min_, max_ };
				// prevent mouse from triggering mouseover
				Tabs.els.content.addClass("indent-move");
				// auto trigger mousemove, in order to show line on mouse down
				Self.dispatch({ type: "mousemove", clientX: event.clientX });
				// bind event handlers
				Tabs.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let left = event.clientX - Drag.clickX;
				left -= left % 9; // snap math
				left = Drag.min_(Drag.max_(left, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ left });
				// helper line
				Drag.lineEl.css({ left });
				break;
			case "mouseup":
				// prevent mouse from triggering mouseover
				Tabs.els.content.removeClass("indent-move");
				// unbind event handlers
				Tabs.els.doc.off("mousemove mouseup", Self.dispatch);
				break;
		}
	}
}