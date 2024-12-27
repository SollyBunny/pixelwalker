// Wrapper for map to support non primative keys

export function hash2(a, b) {
	const prime1 = 73856093;
	const prime2 = 19349663;
	return (a * prime1 + b * prime2) >>> 0;
}

export function hash3(a, b, c) {
	const prime1 = 73856093;
	const prime2 = 19349663;
	const prime3 = 83492791;
	return (a * prime1 + b * prime2 + c * prime3) >>> 0;
}

export function hash4(a, b, c, d) {
	const prime1 = 73856093;
	const prime2 = 19349663;
	const prime3 = 83492791;
	const prime4 = 15485863;
	return (a * prime1 + b * prime2 + c * prime3 + d * prime4) >>> 0;
}

export class CustomMap {
	constructor(fnhash, fnequal) {
		this.fnhash = fnhash;
		this.fnequal = fnequal;
		this.size = 0;
		this._map = new Map();
	}
	set(key, value) {
		const hash = this.fnhash(key);
		let bucket = this._map.get(hash);
		if (bucket === undefined) {
			bucket = [];
			this._map.set(hash, bucket);
		}
		for (let i = 0; i < bucket.length; ++i) {
			const [keyB, _] = bucket[i];
			if (this.fnequal(key, keyB)) {
				bucket[i] = [key, value];
				return value;
			}
		}
		bucket.push([key, value]);
		this.size += 1;
		return value;
	}
	get(key) {
		const hash = this.fnhash(key);
		let bucket = this._map.get(hash);
		if (bucket === undefined)
			return undefined;
		for (const [keyB, valueB] of bucket) {
			if (this.fnequal(key, keyB))
				return valueB;
		}
		return undefined;
	}
	has(key) {
		const hash = this.fnhash(key);
		let bucket = this._map.get(hash);
		if (bucket === undefined)
			return false;
		for (const [keyB, valueB] of bucket)
			if (this.fnequal(key, keyB))
				return true;
		return false;
	}
	delete(key) {
		const hash = this.fnhash(key);
		let bucket = this._map.get(hash);
		if (bucket === undefined) {
			bucket = [];
			this._map.set(hash, bucket);
		}
		for (let i = 0; i < bucket.length; ++i) {
			const [keyB, _] = bucket[i];
			if (this.fnequal(key, keyB)) {
				this.size -= 1;
				if (bucket.length === 1)
					this._map.delete(hash);
				else
					bucket.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	clear() {
		this._map.clear();
		this.size = 0;
	}
	*items() {
		for (const bucket of this._map.values()) {
			for (const item of bucket)
				yield item;
		}
	}
	[Symbol.iterator]() {
		return this.items();
	}
	*values() {
		for (const bucket of this._map.values()) {
			for (const [_, value] of bucket)
				yield value;
		}
	}
	*keys() {
		for (const bucket of this._map.values()) {
			for (const [key, _] of bucket)
				yield key;
		}
	}
}
