
// textedit.blankView

{
	init(spawn) {
		// fast references
		this.els = {
			content: spawn.find("content"),
			el: spawn.find(".blank-view"),
		};
		
		// get settings, if any
		let xList = $.xmlFromString(`<Recents/>`);
		let xSamples = window.bluePrint.selectSingleNode(`//Samples`);
		this.xRecent = window.settings.getItem("recents") || xList.documentElement;

		Promise.all(this.xRecent.selectNodes("./*").map(async xItem => {
				let filepath = xItem.getAttribute("filepath"),
					check = await karaqu.shell(`fs -f '${filepath}'`);
				if (!check.result) {
					xItem.parentNode.removeChild(xItem)
				}
			}))
			.then(() => {
				// add recent files in to data-section
				xSamples.parentNode.append(this.xRecent);

				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target: this.els.el
				});
			});
	},
	dispatch(event) {
		let APP = textedit,
			Spawn = event.spawn,
			Self = APP.blankView,
			file,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "new-file":
				APP.spawn.dispatch({ ...event, type: "new-file" });
				break;
			case "open-filesystem":
				APP.spawn.dispatch({ ...event, type: "open-file" });
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-sample":
				el = $(event.target);
				if (!el.hasClass("sample")) return;

				// close "current tab"
				APP.spawn.dispatch({ type: "close-tab", spawn: Spawn, delayed: true });
				
				// send event to APP for proxy down to spawn
				let filepath = el.data("path") + el.find("span").text();
				APP.dispatch({ ...event, type: "load-samples", samples: [filepath] });
				break;
			case "select-recent-file":
				el = $(event.target);
				if (!el.hasClass("recent-file")) return;

				// close "current tab"
				APP.spawn.dispatch({ type: "close-tab", spawn: Spawn, delayed: true });
				
				karaqu.shell(`fs -o '${el.data("path")}' null`)
					.then(exec => APP.dispatch({ ...exec.result, spawn: Spawn }));
				break;
				break;
			case "add-recent-file":
				if (!event.file.path || !event.file.xNode) return;
				let str = `<i kind="${event.file.kind}" name="${event.file.base}" path="${event.file.path}"/>`,
					xFile = $.nodeFromString(str),
					xExist = Self.xRecent.selectSingleNode(`//Recents/*[@path="${event.file.path}"]`);
				// remove entry if already exist
				if (xExist) xExist.parentNode.removeChild(xExist);
				// insert new entry at first position
				Self.xRecent.insertBefore(xFile, Self.xRecent.firstChild);
				break;
		}
	}
}