
{
	blocked: false,
	options: {
		//attributeOldValue: true,
		//attributeFilter: true,
		characterDataOldValue: true,
		characterData: true,
		attributes: true,
		childList: true,
		subtree: true,
	},
	init() {
		
	},
	changed() {
		
	},
	flush(mutations) {
		if (this.blocked) {
			this.blocked = false;
			return;
		}
		let newValue = this.el.html();
		this.stack.execute(new EditCommand(this, this.el[0], this.startValue, newValue));
		this.startValue = newValue;
	}
}
