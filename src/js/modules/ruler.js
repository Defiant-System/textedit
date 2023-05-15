
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
					limit = {
						min: 0,
						max: 250
					};
				// drag object
				Self.drag = { el, indent, clickX, limit };

				// prevent mouse from triggering mouseover
				Tabs.els.content.addClass("cover");
				// bind event handlers
				Tabs.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				let left = event.clientX - Drag.clickX;
				Drag.el.css({ left });
				break;
			case "mouseup":
				// prevent mouse from triggering mouseover
				Tabs.els.content.removeClass("cover");
				// unbind event handlers
				Tabs.els.doc.off("mousemove mouseup", Self.dispatch);
				break;
		}
	}
}