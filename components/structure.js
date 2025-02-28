import { BufferReader, Types } from "../lib/bufferreader.js";

let Sharp;
if (typeof document === "undefined")
	Sharp = (await import("sharp")).default;

async function imageDataFromBuffer(data, maxsize) {
	if (Sharp) {
		const img = (new Sharp(data)).rotate().toColorspace("rgb8");
		const metadata = await img.metadata();
		const scale = maxsize / Math.max(metadata.width, metadata.height);
		let width = Math.round(metadata.width * scale);
		let height = Math.round(metadata.height * scale);
		if (Math.abs(width - height) <= 1)
			width = height = maxsize;
		return {
			width, height,
			channels: metadata.channels,
			raw: await img.resize(width, height).raw().toBuffer()
		};
	} else {
		const img = await createImageBitmap(new Blob([data]));
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d", { alpha: false });
		ctx.globalCompositeOperation = "copy";
		const scale = maxsize / Math.max(img.width, img.height);
		let width = Math.round(img.width * scale);
		let height = Math.round(img.height * scale);
		if (Math.abs(width - height) <= 1)
			width = height = maxsize;
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(img, 0, 0, width, height);
		const raw = ctx.getImageData(0, 0, width, height).data;
		return {
			width, height, raw,
			channels: raw.length / (width * height)
		};
	}
}
export const LAYER_BACKGROUND = 0;
export const LAYER_FOREGROUND = 1;
export const LAYER_COUNT = 2;

const specialBlocksNamed = {
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
	"portal": [{ name: "rotation", type: Types.Int32 }, { name: "id", type: Types.Int32 }, { name: "to", type: Types.Int32 }],
	"portal_invisible": [{ name: "rotation", type: Types.Int32 }, { name: "id", type: Types.Int32 }, { name: "to", type: Types.Int32 }],
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
};

export class BlockManager {
	constructor(client) {
		this.client = client;
		const name2idEntries = Object.entries(client.blockIds);
		this.name2id = new Map(name2idEntries);
		this.id2name = new Map(name2idEntries.map(([name, id]) => [id, name]));
		this.id2layer = new Map(name2idEntries.map(([name, id]) => [id, name.endsWith("_bg") ? LAYER_BACKGROUND : LAYER_FOREGROUND]));
		this.id2types = new Map(Object.entries(specialBlocksNamed).map(([name, value]) => [this.id(name), value]));
		this.id2color = client.blockColors;
	}
	id(name) {
		return this.name2id.get(name);
	}
	name(id) {
		return this.id2name.get(id);
	}
	types(id) {
		return this.id2types.get(id);
	}
	layer(id) {
		return this.id2layer.get(id);
	}
	color(id) {
		return this.id2color.get(id);
	}
}

export class Block {
	static fromManager(manager, key, properties) {
		let id;
		if (typeof(key) === "number") {
			id = key;
		} else {
			if (key === "empty")
				return new Block(0, LAYER_FOREGROUND);
			else if (key === "empty_bg")
				return new Block(0, LAYER_FOREGROUND);
			id = manager.id(key);
		}
		const types = manager.types(id);
		if (types) {
			properties = properties ?? {};
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
		return new Block(id, manager.layer(id), types, properties);
	}
	static fromRaw(layer, manager, buffer) {
		const id = buffer.readInt32LE();
		const types = manager.types(id);
		let properties;
		if (types) {
			properties = {};
			for (const { name, type } of types) {
				switch (type) {
					case Types.Int32:
						properties[name] = buffer.readInt32LE();
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
		return new Block(id, layer, types, properties);
	}
	static fromPacket(manager, packet) {
		const id = packet.blockId;
		const types = manager.types(id);
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
		return new Block(id, packet.layer, types, properties);
	}
	constructor(id, layer, types, properties) {
		this.id = id ?? 0;
		this.layer = layer ?? LAYER_BACKGROUND;
		this.types = types;
		this.properties = properties;
	}
	equals(other) {
		if (!other) return false;
		if (this.id !== other.id) return false;
		if (this.layer !== other.layer) return false;
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
			return Buffer.alloc(0);
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
		return new Block(this.id, this.layer, this.types, this.properties ? Object.assign({}, this.properties) : undefined);
	}
	empty() {
		return this.id === 0;
	}
}

export class Structure {
	static fromBuffer(buffer, width, height, manager) {
		const data = new Array(width * height * LAYER_COUNT);
		buffer = BufferReader.from(buffer);
		for (let i = 0; i < width * height * LAYER_COUNT; ++i) {
			const layer = Math.floor(i / (width * height));
			const x = Math.floor((i % (width * height)) / height);
			const y = i % height;
			const block = Block.fromRaw(layer, manager, buffer);
			data[(y * width + x) * LAYER_COUNT + layer] = block;
		}
		return new Structure(width, height, data);
	}
	static async fromImage(buffer, maxsize, manager, colors) {
		const { raw, channels, width, height } = await imageDataFromBuffer(buffer, maxsize);
		const data = new Array(width * height * LAYER_COUNT);
		colors = colors ?? manager.id2color;
	
		function bestColor(r, g, b, a) {
			let best = "";
			let bestDist = Infinity;
			let bestColor = [0, 0, 0];
			for (const [id, color] of colors.entries()) {
				if (color[3] === 0) continue; // Ignore fully transparent colors
				if (a !== 255) { // alpha picks layer
					const layer = manager.layer(id);
					if (
						(a > 128 && layer === LAYER_BACKGROUND) ||
						(a <= 128 && layer === LAYER_FOREGROUND)
					) continue;
				}
				const dist = Math.abs(r - color[0]) + Math.abs(g - color[1]) + Math.abs(b - color[2]);
				if (dist < bestDist) {
					best = id;
					bestDist = dist;
					bestColor = color;
				}
			}
			return { id: best, color: bestColor };
		}
	
		// Helper to clamp values between 0 and 255
		function clamp(value) {
			return Math.max(0, Math.min(255, value));
		}
	
		// Floyd-Steinberg Dithering weights
		const weights = [
			{ x: 1, y: 0, factor: 7 / 16 },
			{ x: -1, y: 1, factor: 3 / 16 },
			{ x: 0, y: 1, factor: 5 / 16 },
			{ x: 1, y: 1, factor: 1 / 16 }
		];
	
		const errorBuffer = new Float32Array(raw.length); // Store accumulated errors
		errorBuffer.fill(0);
	
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const indexRaw = (y * width + x) * channels;
				if (raw[indexRaw + 3] < 1) continue;
			
				const indexError = (y * width + x) * 3;
				const r = clamp(raw[indexRaw + 0] + errorBuffer[indexError + 0]);
				const g = clamp(raw[indexRaw + 1] + errorBuffer[indexError + 1]);
				const b = clamp(raw[indexRaw + 2] + errorBuffer[indexError + 2]);
				const { id, color } = bestColor(r, g, b, raw[indexRaw + 3]);
				const block = Block.fromManager(manager, id);
				if (!block) continue; // Skip unknown blocks

				const indexData = (y * width + x) * LAYER_COUNT;
				if (block.layer === LAYER_FOREGROUND) {
					data[indexData + LAYER_FOREGROUND] = block;
				} else {
					data[indexData + LAYER_BACKGROUND] = block;
					data[indexData + LAYER_FOREGROUND] = new Block(0, LAYER_FOREGROUND);
				}
	
				// Calculate quantization error
				const errorR = r - color[0];
				const errorG = g - color[1];
				const errorB = b - color[2];
	
				// Distribute the error to neighboring pixels
				for (const { x: dx, y: dy, factor } of weights) {
					const nx = x + dx;
					const ny = y + dy;
					if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
						const indexError = (ny * width + nx) * 3;
						errorBuffer[indexError + 0] += errorR * factor;
						errorBuffer[indexError + 1] += errorG * factor;
						errorBuffer[indexError + 2] += errorB * factor;
					}
				}
			}
		}
	
		return new Structure(width, height, data);
	}
	constructor(width, height, data) {
		this.width = width;
		this.height = height;
		this.data = data ?? new Array(this.width * this.height * LAYER_COUNT);
		if (this.data.length !== this.width * this.height * LAYER_COUNT)
			throw new Error(`Data length does not match width, height, and LAYER_COUNT (${this.data.length} != ${this.width * this.height * LAYER_COUNT})`);
	}
	empty() {
		return this.data.every(block => block && block.empty());
	}
	clone() {
		return new Structure(this.width, this.height, [...this.data])
	}
	trim() {
		if (this.width === 0 || this.height === 0)
			return this.clone();
		let trimTop, trimBottom, trimLeft, trimRight;
		let x, y, layer;
		loopTrimTop: for (trimTop = 0; trimTop < this.height; ++trimTop) {
			for (x = 0; x < this.width; ++x) for (layer = 0; layer < LAYER_COUNT; ++layer) {
				const block = this.get(x, trimTop, layer);
				if (block && !block.empty()) break loopTrimTop;
			}
		}
		if (trimTop >= this.height)
			return new Structure(0, 0, []);
		loopTrimBottom: for (trimBottom = 0; trimBottom < this.height; ++trimBottom) {
			for (x = 0; x < this.width; ++x) for (layer = 0; layer < LAYER_COUNT; ++layer) {
				const block = this.get(x, this.height - 1 - trimBottom, layer);
				if (block && !block.empty()) break loopTrimBottom;
			}
		}
		loopTrimLeft: for (trimLeft = 0; trimLeft < this.width; ++trimLeft) {
			for (y = 0; y < this.height; ++y) for (layer = 0; layer < LAYER_COUNT; ++layer) {
				const block = this.get(trimLeft, y, layer);
				if (block && !block.empty()) break loopTrimLeft;
			}
		}
		loopTrimRight: for (trimRight = 0; trimRight < this.width; ++trimRight) {
			for (y = 0; y < this.height; ++y) for (layer = 0; layer < LAYER_COUNT; ++layer) {
				const block = this.get(this.width - 1 - trimRight, y, layer);
				if (block && !block.empty()) break loopTrimRight;
			}
		}
		return this.getSub(trimLeft, trimTop, this.width - trimRight, this.height - trimBottom);
	}
	rotate(degrees) {
		if ([1, 2, 3].indexOf(degrees) === -1)
			throw new Error("Degrees must be 1 (90deg), 2 (180deg), or 3 (270deg)");

		let width, height;
		if (degrees === 1 || degrees === 3) {
			width = this.height;
			height = this.width;
		} else {
			width = this.width;
			height = this.height;
		}

		const structure = new Structure(width, height);
		for (let y = 0; y < this.height; ++y) for (let x = 0; x < this.width; ++x) {
			let xNew, yNew;
			if (degrees === 1) {
				xNew = y;
				yNew = this.width - 1 - x;
			} else if (degrees === 2) {
				xNew = this.width - 1 - x;
				yNew = this.height - 1 - y;
			} else if (degrees === 3) {
				xNew = this.height - 1 - y;
				yNew = x;
			}

			for (let layer = 0; layer < LAYER_COUNT; ++layer)
				structure.set(xNew, yNew, this.get(x, y, layer));
		}

		return structure;
	}
	index(x, y, layer) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height || layer < 0 || layer >= LAYER_COUNT)
			return undefined;
		return (y * this.width + x) * LAYER_COUNT + layer;
	}
	get(x, y, layer) {
		const index = this.index(x, y, layer);
		if (!index) return;
		return this.data[index];
	}
	set(x, y, block) {
		if (!block) return;
		const index = this.index(x, y, block.layer);
		if (!index) return;
		return this.data[index] = block.clone();
	}
	getSub(x1, y1, x2, y2) {
		const width = x2 - x1;
		const height = y2 - y1;
		const data = [];
		for (let y = 0; y < height; ++y) for (let x = 0; x < width; ++x) for (let layer = 0; layer < LAYER_COUNT; ++layer)
			data.push(this.get(x + x1, y + y1, layer));
		return new Structure(width, height, data);
	}
	setSub(x1, y1, structure) {
		for (let x = 0; x < structure.width; ++x) for (let y = 0; y < structure.height; ++y) for (let layer = 0; layer < LAYER_COUNT; ++layer) {
			const block = structure.get(x, y, layer);
			if (!block) continue;
			this.set(x1 + x, y1 + y, block);
		}
	}
	setArea(x1, y1, x2, y2, block) {
		if (!block) return;
		for (let x = x1; x <= x2; ++x) for (let y = y1; y <= y2; ++y)
			this.set(x, y, block);
	}
	setAreaClear(x1, y1, x2, y2) {
		for (let layer = 0; layer < LAYER_COUNT; ++layer)
			this.setArea(x1, y1, x2, y2, new Block(0, layer));
	}
	setAreaOutline(x1, y1, x2, y2, block) {
		for (let x = x1; x <= x2; ++x) {
			this.set(x, y1, block);
			this.set(x, y2, block);
		}
		for (let y = y1 + 1; y <= y2 - 1; ++y) {
			this.set(x1, y, block);
			this.set(x2, y, block);
		}
	}
	setAreaClearOutline(x1, y1, x2, y2, block) {
		this.setAreaClear(x1 - 1, y1 - 1, x2 + 1, y2 + 1);
		this.setAreaOutline(x1, y1, x2, y2, block);
	}
}
