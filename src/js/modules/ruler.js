
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
					indent = el.prop("className").split("-")[1],
					clickX = event.clientX - +el.prop("offsetLeft"),
					lineEl = Tabs.els.indentLine,
					lineOffset = 138,
					limit = {
						snap: 9,
						min: 0,
						max: 550
					},
					min_ = Math.min,
					max_ = Math.max;
				// drag object
				Self.drag = { el, lineEl, lineOffset, indent, clickX, limit, min_, max_ };

				// prevent mouse from triggering mouseover
				Tabs.els.content.addClass("indent-move");
				// bind event handlers
				Tabs.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let left = event.clientX - Drag.clickX;
				left -= left % Drag.limit.snap;
				left = Drag.min_(Drag.max_(left, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ left });

				left += Drag.lineOffset;
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