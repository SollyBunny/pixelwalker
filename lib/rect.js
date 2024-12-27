export class Rect {
	static clone(other) {
		return new Rect(other.x1, other.y1, other.x2, other.y2);
	}
	constructor(x1, y1, x2, y2) {
		x1 = x1 ?? 0;
		y1 = y1 ?? 0;
		x2 = x2 ?? 0;
		y2 = y2 ?? 0;
		if (x1 > x2) {
			const temp = x1;
			x1 = x2;
			x2 = temp;
		}
		if (y1 > y2) {
			const temp = y1;
			y1 = y2;
			y2 = temp;
		}
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	get x() {
		return this.x1;
	}
	set x(x) {
		return this.x1 = x;
	}
	get y() {
		return this.y1;
	}
	set y(y) {
		return this.y1 = y;
	}
	get w() {
		return this.x2 - this.x1;
	}
	set w(w) {
		this.x2 = this.x1 + w;
		return w;
	}
	get h() {
		return this.y2 - this.y1;
	}
	set h(h) {
		this.y2 = this.y1 + h;
		return h;
	}
	clone() {
		return new Rect(this.x1, this.y1, this.x2, this.yw);
	}
	equals(other) {
		return (
			this.x1 === other.x1 && this.y1 === other.y1 &&
			this.x2 === other.x2 && this.y2 === other.y2
		);
	}
	contains(other) {
		return (
			this.x1 <= other.x1 && this.y1 <= other.y1 &&
			this.x2 >= other.x2 && this.y2 >= other.y2
		);
	}
	containsPoint({ x, y }) {
		return (
			x >= this.x1 && x <= this.x2 &&
			y >= this.y1 && y <= this.y2
		);
	}
	intersects(other) {
		return (
			this.x1 < other.x2 && this.x2 > other.x1 &&
			this.y1 < other.y2 && this.y2 > other.y1
		);
	}
	intersect(other) {
		const x1 = Math.max(this.x1, other.x1);
		const y1 = Math.max(this.y1, other.y1);
		const x2 = Math.min(this.x2, other.x2);
		const y2 = Math.min(this.y2, other.y2);
		if (x1 <= x2 && y1 <= y2)
			return new Rect(x1, y1, x2, y2);
	}
}