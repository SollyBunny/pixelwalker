export class Vec2 {
	static clone(other) {
		return new Vec2(other.x, other.y);
	}
	constructor(x, y) {
		this.x = x ?? 0;
		this.y = y ?? 0;
	}
	set(x, y) {
		this.x = x;
		this.y = y;
	}
	clone() {
		return new Vec2(this.x, this.y);
	}
	equals(other) {
		return this.x === other.x && this.y === other.y;
	}
}