// TODO make this a linked list queue or circular queue, stop being lazy

export class WorkQueue {
	constructor(callback, hz) {
		this.callback = callback;
		this._hz = hz;
		this._data = [];
		this._interval = undefined;
		this._closed = false;
	}
	get hz() {
		return this._hz;
	}
	set hz(hz) {
		this._hz = hz;
		this._stop();
		this._start();
	}
	_loop() {
		const data = this._data.shift()
		if (data === undefined)
			this._stop();
		else
			this.callback(data);
	}
	_start() {
		if (this._interval !== undefined) return;
		if (this._data.length === 0) return;
		this._interval = setInterval(this._loop.bind(this), 1000 / this._hz)
	}
	_stop() {
		if (this._interval === undefined) return;
		clearInterval(this._interval);
		this._interval = undefined;
	}
	close() {
		this._closed = true;
		this._data = [];
		this._stop();
	}
	push(data) {
		if (this._closed) return;
		this._data.push(data);
		this._start();
	}
	filter(pred) {
		if (this._closed) return;
		this._data = this._data.filter(pred);
	}
}