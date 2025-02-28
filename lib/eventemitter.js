export class EventEmitter {
	constructor() {
		this._events = {};
	}
	on(event, listener) {
		if (!this._events[event])
			this._events[event] = [];
		this._events[event].push(listener);
	}
	once(event, listener) {
		const wrapper = (...args) => {
			listener(...args);
			this.off(event, wrapper);
		};
		this.on(event, wrapper);
	}
	off(event, listener) {
		if (!this._events[event]) return;
		this._events[event] = this._events[event].filter(l => l !== listener);
	}
	emit(event, ...args) {
		if (!this._events[event]) return;
		this._events[event].forEach(listener => listener(...args));
	}
}
