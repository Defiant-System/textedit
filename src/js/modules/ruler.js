
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
				let snap = 9,
					cEl = Tabs.els.content,
					el = $(event.target),
					indent = el.prop("className").split("-")[1],
					clickX = event.clientX - +el.prop("offsetLeft") - snap,
					pageW = parseInt(cEl.cssProp("--pW"), 10),
					limit = {},
					key = "",
					min_ = Math.min,
					max_ = Math.max,
					round_ = Math.round;
				// calc constraints
				switch (indent) {
					case "firstline":
						key = "--iF",
						limit.min = 0;
						limit.max = pageW - (snap * 19);
						break;
					case "left":
						key = "--iL",
						limit.min = 0;
						limit.max = pageW - (snap * 19);
						break;
					case "right":
						key = "--iR",
						limit.min = snap * 19;
						limit.max = pageW;
						break;
				}
				// helper line; add to elements to be moved
				el.push(Tabs.els.indentLine[0]);
				// drag object
				Self.drag = { el, cEl, key, snap, indent, clickX, limit, min_, max_, round_ };
				// prevent mouse from triggering mouseover
				Tabs.els.content.addClass("indent-move");
				// auto trigger mousemove, in order to show line on mouse down
				Self.dispatch({ type: "mousemove", clientX: event.clientX });
				// bind event handlers
				Tabs.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let left = event.clientX - Drag.clickX;
				left -= left % Drag.snap; // snap math
				left = Drag.min_(Drag.max_(left, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ left });
				// transfer value to page content
				let data = {};
				data[Drag.key] = Drag.round_(left / Drag.snap) / 4;
				Drag.cEl.css(data);
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