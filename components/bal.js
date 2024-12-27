export class Bal {
	constructor(client, room) {
		this.client = client;
		this.room = room;
		this._enabled = false;
		this._state = undefined;
	}
	get state() {
		return this._enabled ? this._state : "Off";
	}
	set state(state) {
		if (!this.enabled)
			return;
		this._state = state;
		this.room.world.setTitleState(state);
	}
	get enabled() {
		return this._enabled;
	}
	set enabled(enabled) {
		if (this._enabled === enabled)
			return;
		this._enabled = enabled;
		if (this._enabled) {
			this.state = "On";
			if (this.init) this.init();
		} else {
			this.state = "Off";
			if (this.deinit) this.deinit();
		}
	}
}