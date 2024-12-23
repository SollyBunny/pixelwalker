// https://github.com/Anatoly03/pixelwalker.js/blob/main/src/util/buffer-reader.ts

export const Types = {
	String: 0,
	Byte: 1,
	Int16: 2,
	Int32: 3,
	Int64: 4,
	Float: 5,
	Double: 6,
	Boolean: 7,
	ByteArray: 8,
};

export class BufferReader {
	static from(from) {
		if (from instanceof BufferReader) return new BufferReader(from.buffer, from.offset);
		if (from instanceof Buffer) return new BufferReader(from);
		return new BufferReader(Buffer.from(from));
	}
	static alloc(amount) {
		return BufferReader.from(Buffer.alloc(amount));
	}
	constructor(buffer, offset) {
		this.buffer = buffer;
		this.offset = offset ?? 0;
	}
	// Uint8
	readUInt8() {
		return this.buffer.readUInt8(this.offset++);
	}
	writeUInt8(value) {
		this.buffer.writeUInt8(value, this.offset++);
	}
	// Int32LE
	readInt32LE() {
		const out = this.buffer.readInt32LE(this.offset);
		this.offset += 4;
		return out;
	}
	writeInt32LE(value) {
		this.buffer.writeInt32LE(value, this.offset);
		this.offset += 4;
	}
	// Int32BE
	readInt32BE() {
		const out = this.buffer.readInt32BE(this.offset);
		this.offset += 4;
		return out;
	}
	writeInt32BE(value) {
		this.buffer.writeInt32BE(value, this.offset);
		this.offset += 4;
	}
	// 7 Bit Integer
	read7BitInt() {
		let value = 0;
		let shift = 0;
		let byte = 0xff;
		while (byte & 0x80) {
			byte = this.readUInt8();
			value |= (byte & 0x7f) << shift;
			shift += 7;
		}
		return value;
	}
	write7BitInt(value) {
		while (value >= 128) {
			this.writeUInt8((value & 127) | 128, this.offset);
			value >>= 7;
		}
		this.writeUInt8(value);
	}
	static length7BitInt(value) {
		let size = 0;
		do {
			value >>= 7;
			++size;
		} while (value > 0);
		return size;
	}
	// String
	readString() {
		const length = this.read7BitInt();
		const out = this.buffer.subarray(this.offset, this.offset + length).toString("utf8");
		this.offset += length;
		return out;
	}
	writeString(value) {
		const strlen = value?.length || 0;
		this.write7BitInt(strlen);
		if (strlen) {
			this.buffer.write(value, this.offset, strlen, "utf8");
			this.offset += strlen;
		}
	}
	static lengthString(value) {
		const strlen = value?.length || 0;
		return this.length7BitInt(strlen) + strlen;
	}
}

