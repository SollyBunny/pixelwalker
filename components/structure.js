import Sharp from "sharp";

import { BufferReader, Types } from "./bufferreader.js";

export const LAYER_BACKGROUND = 0;
export const LAYER_FOREGROUND = 1;
export const LAYER_COUNT = 2;

export class BlockManager {
	specialBlocks = {
		"coin_gold_door": [{ name: "count", type: Types.Int32 }],
		"coin_blue_door": [{ name: "count", type: Types.Int32 }],
		"coin_gold_gate": [{ name: "count", type: Types.Int32 }],
		"coin_blue_gate": [{ name: "count", type: Types.Int32 }],
		"effects_jump_height": [{ name: "height", type: Types.Int32 }],
		"effects_fly": [{ name: "enabled", type: Types.Boolean }],
		"effects_speed": [{ name: "speed", type: Types.Int32 }],
		"effects_invulnerability": [{ name: "enabled", type: Types.Boolean }],
		"effects_curse": [{ name: "time", type: Types.Int32 }],
		"effects_zombie": [{ name: "time", type: Types.Int32 }],
		"effects_gravityforce": [{ name: "force", type: Types.Int32 }],
		"effects_multi_jump": [{ name: "count", type: Types.Int32 }],
		"tool_portal_world_spawn": [{ name: "id", type: Types.Int32 }],
		"sign_normal": [{ name: "text", type: Types.String }],
		"sign_red": [{ name: "text", type: Types.String }],
		"sign_green": [{ name: "text", type: Types.String }],
		"sign_blue": [{ name: "text", type: Types.String }],
		"sign_gold": [{ name: "text", type: Types.String }],
		"portal": [{ name: "from", type: Types.Int32 }, { name: "to", type: Types.Int32 }, { name: "rotation", type: Types.Int32 }],
		"portal_invisible": [{ name: "from", type: Types.Int32 }, { name: "to", type: Types.Int32 }, { name: "rotation", type: Types.Int32 }],
		"portal_world": [{ name: "worldId", type: Types.String }, { name: "spawnId", type: Types.Int32 }],
		"switch_local_toggle": [{ name: "id", type: Types.Int32 }],
		"switch_local_activator": [{ name: "id", type: Types.Int32 }, { name: "enabled", type: Types.Boolean }],
		"switch_local_resetter": [{ name: "id", type: Types.Boolean }],
		"switch_local_door": [{ name: "id", type: Types.Int32 }],
		"switch_local_gate": [{ name: "id", type: Types.Int32 }],
		"switch_global_toggle": [{ name: "id", type: Types.Int32 }],
		"switch_global_activator": [{ name: "id", type: Types.Int32 }, { name: "enabled", type: Types.Boolean }],
		"switch_global_resetter": [{ name: "id", type: Types.Boolean }],
		"switch_global_door": [{ name: "id", type: Types.Int32 }],
		"switch_global_gate": [{ name: "id", type: Types.Int32 }],
		"hazard_death_door": [{ name: "count", type: Types.Int32 }],
		"hazard_death_gate": [{ name: "count", type: Types.Int32 }],
	}
	static async fromClient(client) {
		return new BlockManager(client, await client.blockMappings());
	}
	constructor(client, name2id) {
		this.client = client;
		this.name2id = new Map(Object.entries(name2id));
		this.id2name = new Map(Object.entries(name2id).map(([key, value]) => [value, key]));
	}
	id(name) {
		return this.name2id.get(name);
	}
	name(id) {
		return this.id2name.get(id);
	}
}

export class Block {
	static fromManager(manager, key, properties) {
		let name, id;
		if (typeof(key) === "number") {
			name = manager.name(key);
			id = key;
		} else {
			name = key;
			id = manager.id(key);
		}
		if (!properties)
			properties = {};
		const types = manager.specialBlocks[name];
		if (types) {
			for (const [name, type] of Object.entries(types)) {
				if (properties[name] === undefined) {
					switch (type) {
						case Types.Int32:
							properties[name] = 0;
							break;
						case Types.Boolean:
							properties[name] = false;
							break;
						case Types.String:
							properties[name] = "";
							break;
					}
				}
			}
		}
		return new Block(id, types, properties);
	}
	static fromRaw(manager, buffer) {
		const id = buffer.readInt32LE();
		const types = manager.specialBlocks[manager.name(id)];
		let properties;
		if (types) {
			properties = {};
			for (const { name, type } of types) {
				switch (type) {
					case Types.Int32:
						properties[name] = buffer.readInt32BE();
						break;
					case Types.Boolean:
						properties[name] = buffer.readUInt8() === 1;
						break;
					case Types.String:
						properties[name] = buffer.readString();
						break;
				}
			}
		}
		return new Block(id, types, properties);
	}
	static fromPacket(manager, packet) {
		const id = packet.blockId;
		const types = manager.specialBlocks[manager.name(id)];
		let properties;
		if (types) {
			const buffer = BufferReader.from(packet.extraFields);
			properties = {};
			for (const { name, type } of types) {
				const readType = buffer.readUInt8();
				if (readType != type) {
					console.warn("Invalid data");
					break;
				}
				switch (type) {
					case Types.Int32:
						properties[name] = buffer.readInt32BE();
						break;
					case Types.Boolean:
						properties[name] = buffer.readUInt8() === 1;
						break;
					case Types.String:
						properties[name] = buffer.readString();
						break;
				}
			}
		}
		return new Block(id, types, properties);
	}
	constructor(id, types, properties) {
		this.id = id ?? 0;
		this.types = types;
		this.properties = properties;
	}
	equals(other) {
		if (this.id !== other.id) return false;
		if (this.types !== other.types) return false;
		if (this.types) {
			for (const { name, type: _type } of this.types) {
				if (this.properties[name] !== other.properties[name])
					return false;
			}
		}
		return true;
	}
	serializeProperties() {
		if (!this.types)
			return new Uint8Array();
		let length = 0;
		for (const { name, type } of this.types) {
			length += 1;
			switch (type) {
				case Types.Int32:
					length += 4;
					break;
				case Types.Boolean:
					length += 1;
					break;
				case Types.String:
					length += BufferReader.lengthString(this.properties[name]);
					break;
			}
		}
		const out = BufferReader.alloc(length);
		for (const { name, type } of this.types) {
			out.writeUInt8(type);
			switch (type) {
				case Types.Int32:
					out.writeInt32BE(this.properties[name] ?? 0);
					break;
				case Types.Boolean:
					out.writeUInt8(this.properties[name] ? 1 : 0);
					break;
				case Types.String:
					out.writeString(this.properties[name]);
					break;
			}
		}
		return out.buffer;
	}
	clone() {
		return new Block(this.id, this.types, this.properties ? Object.assign({}, this.properties) : undefined);
	}
	empty() {
		return this.id === 0;
	}
}

export class Structure {
	static fromBuffer(width, height, manager, buffer) {
		const layers = LAYER_COUNT;
		const data = new Array(width * height * layers);
		buffer = BufferReader.from(buffer);
		for (let i = 0; i < width * height * layers; ++i) {
			const layer = Math.floor(i / (width * height));
			const x = Math.floor((i % (width * height)) / height);
			const y = i % height;
			const block = Block.fromRaw(manager, buffer);
			data[(y * width + x) * layers + layer] = block;
		}
		return new Structure(width, height, data);
	}
	static async fromImage(manager, path, maxsize, colors) {
		const img = Sharp(path).rotate(90).flip(true);
		const metadata = await img.metadata();
		const scale = maxsize / Math.max(metadata.width, metadata.height);
		let width = Math.round(metadata.width * scale);
		let height = Math.round(metadata.height * scale);
		if (Math.abs(width - height) <= 1)
			width = height = maxsize;
		const raw = await img.resize(width, height).raw().toBuffer();
		const data = [];
		function bestColor(r, g, b) {
			let best = 0;
			let bestDist = Infinity;
			for (const [id, color] of Object.entries(colors)) {
				const dist = Math.abs(r - color[0]) + Math.abs(g - color[1]) + Math.abs(b - color[2]);
				if (dist < bestDist) {
					best = id;
					bestDist = dist;
				}
			}
			return best;
		}
		for (let i = 0; i < raw.length; i += metadata.channels) {
			const key = bestColor(raw[i], raw[i + 1], raw[i + 2]);
			const block = Block.fromManager(manager, key);
			if (!block) {
				data.push(new Block());
				data.push(new Block());
				continue;
			}
			if (manager.name(block.id).indexOf("bg") === -1) {
				data.push(new Block());
				data.push(block);
			} else {
				data.push(block);
				data.push(new Block());
			}
		}
		return new Structure(width, height, data);
	}
	constructor(width, height, data) {
		this.width = width;
		this.height = height;
		this.layers = LAYER_COUNT;
		this.data = data;
		if (this.data.length !== this.width * this.height * this.layers)
			throw new Error(`Data length does not match width, height, and layers (${this.data.length} != ${this.width * this.height * this.layers})`);
	}
	empty() {
		return this.data.every(block => block.empty());
	}
	trim() {
		let trimTop, trimBottom, trimLeft, trimRight;
		let x, y, layer;
		loopTrimTop: for (trimTop = 0; trimTop < this.height; ++trimTop) {
			for (x = 0; x < this.width; ++x) for (layer = 0; layer < this.layers; ++layer) {
				if (!this.get(x, trimTop, layer).empty())
					break loopTrimTop;
			}
		}
		loopTrimBottom: for (trimBottom = 0; trimBottom < this.height; ++trimBottom) {
			for (x = 0; x < this.width; ++x) for (layer = 0; layer < this.layers; ++layer) {
				if (!this.get(x, this.height - 1 - trimBottom, layer).empty())
					break loopTrimBottom;
			}
		}
		loopTrimLeft: for (trimLeft = 0; trimLeft < this.width; ++trimLeft) {
			for (y = 0; y < this.height; ++y) for (layer = 0; layer < this.layers; ++layer) {
				if (!this.get(trimLeft, y, layer).empty())
					break loopTrimLeft;
			}
		}
		loopTrimRight: for (trimRight = 0; trimRight < this.width; ++trimRight) {
			for (y = 0; y < this.height; ++y) for (layer = 0; layer < this.layers; ++layer) {
				if (!this.get(this.width - 1 - trimRight, y, layer).empty())
					break loopTrimRight;
			}
		}
		return this.getSub(trimLeft, trimTop, this.width - trimRight, this.height - trimBottom);
	}
	index(x, y, layer) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height || layer < 0 || layer >= this.layers)
			return undefined;
		return (y * this.width + x) * this.layers + layer;
	}
	get(x, y, layer) {
		let index;
		if (y === undefined)
			index = x;
		else
			index = this.index(x, y, layer);
		return index === undefined ? undefined : this.data[index];
	}
	set(x, y, layer, block) {
		let index;
		if (layer === undefined) {
			index = x;
			block = y;
		} else {
			index = this.index(x, y, layer);
		}
		return index === undefined ? undefined : this.data[index] = block.clone();
	}
	getSub(x1, y1, x2, y2) {
		const width = x2 - x1;
		const height = y2 - y1;
		const data = [];
		for (let y = 0; y < height; ++y) for (let x = 0; x < width; ++x) for (let layer = 0; layer < this.layers; ++layer)
			data.push(this.get(x + x1, y + y1, layer));
		return new Structure(width, height, data);
	}
	setSub(x1, y1, structure) {
		for (let y = 0; y < structure.height; ++y) for (let x = 0; x < structure.width; ++x) for (let layer = 0; layer < structure.layers; ++layer)
			this.set(x + x1, y + y1, layer, structure.get(x, y, layer));
	}
	setArea(x1, y1, x2, y2, layer, block) {
		for (let y = y1; y < y2; ++y) for (let x = x1; x < x2; ++x)
			this.set(x, y, layer, block.clone());
	}
}