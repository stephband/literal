
let id = 0;

export default class TodoList {
	// Items is a data proxy of an array. Literal tracks mutations to this proxy
	// via a signal graph.
	items = Data.of([]);

	constructor() {

	}

	createItem(text) {
		this.items.push({
			id: ++id,
			completed: false,
			text
		});
	}

	destroyItem(id) {
		const i = this.items.findIndex(matches({ id }));
		if (i > -1) this.items.splice(i, 1);
	}
}
