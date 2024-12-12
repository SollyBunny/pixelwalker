import { EventEmitter } from "events";
import { Structure, Block } from "./structure.js";

function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time * 1000));
}

function splitIntoChunks(arr, chunkSize) {
	const result = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		result.push(arr.slice(i, i + chunkSize));
	}
	return result;
}

function hashTwoNumbers(a, b) {
	let hash = 0;
	hash ^= (a & 0xffff) ^ ((a >> 16) & 0xffff);
	hash ^= (b << 5) ^ (b >> 3);
	hash ^= (hash >> 17);
	return Math.abs(hash) >>> 0;
}

export class World extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.addDefaultListeners();
		this._setBuffer = new Map();
		this._setBufferPos = new Map();
		this.intervalSetBufferPlace = setInterval(() => this._setBufferPlace(), 200);
	}
	[Symbol.dispose]() {
		clearInterval(this.intervalSetBufferPlace);
		this.intervalSetBufferPlace = undefined;
	}
	addDefaultListeners() {
		this.room.on("playerInitPacket", async packet => {
			this.globalSwitches = Uint8Array.from(packet.globalSwitchState);
			this.structure = Structure.fromBuffer(packet.worldWidth, packet.worldHeight, await this.room.client.blockManager(), packet.worldData);
		});
		this.room.on("worldBlockPlacedPacket", async packet => {
			const block = Block.fromPacket(await this.room.client.blockManager(), packet);
			const player = this.room.players.get(packet.playerId);
			block.player = player;
			if (packet.positions[0] === undefined)
				packet.positions = [packet.positions];
			for (const { x, y } of packet.positions)
				this.emit("blockPlaced", { player, block, x, y, layer: packet.layer });
			this.emit("blockPlacedFinish", { player, block, positions: packet.positions, layer: packet.layer });
		});
		this.on("blockPlacedFinish", ({ block, positions, layer }) => {
			for (const { x, y } of positions)
				this.structure.set(x, y, layer, block);
		});
		this.room.on("globalSwitchChangedPacket", packet => {
			this.globalSwitches[packet.switchId] = packet.enabled;
			this.emit("globalSwitch", { player: this.room.players.get(packet.playerId), id: packet.switchId, enabled: packet.enabled });
		});
	}
	get width() {
		return this.structure.width;
	}
	get height() {
		return this.structure.height;
	}
	index(x, y, layer) {
		return this.structure.index(x, y, layer);
	}
	get(x, y, layer) {
		return this.structure.get(x, y, layer);
	}
	getSub(x1, y1, x2, y2) {
		return this.structure.getSub(x1, y1, x2, y2);
	}
	_setMany(positions, layer, block) {
		// for (const { x, y } of positions) {
		// 	const index = this.structure.index(x, y, layer);
		// 	if (!index) continue;
		// 	this.structure.set(index, block);
		// }
		this.room.send("worldBlockPlacedPacket", {
			isFillOperation: false,
			extraFields: block.serializeProperties(),
			positions: positions,
			layer: layer,
			blockId: block.id
		});
		return block;
	}
	_setBufferPlace() {
		const MAX_SIZE = 128;
		for (const bucket of this._setBuffer.values()) {
			for (const { index, positions } of bucket) {
				if (positions.length >= MAX_SIZE) {
					this._setMany(positions.splice(0, MAX_SIZE), index.layer, index.block);
					return;
				}
			}
		}
		for (const [key, bucket] of this._setBuffer.entries()) {
			for (let i = 0; i < bucket.length; ++i) {
				const { index, positions } = bucket[i];
				this._setMany(positions, index.layer, index.block);
				if (bucket.length <= 1)
					this._setBuffer.delete(key);
				else
					bucket.splice(i, 1);
				return;
			}
		}
	}
	set(x, y, layer, block) {
		const index = this.structure.index(x, y, layer);
		if (!index) return;
		if (this._setBufferPos.has(index)) {
			const blockOld = this._setBufferPos.get(index);
			if (blockOld.equals(block)) return;
			const hash = hashTwoNumbers(layer, blockOld.id);
			const bucket = this._setBuffer.get(hash);
			if (bucket) {
				for (const { index, positions } of bucket) {
					if (index.layer === layer && index.block.equals(block)) {
						for (let i = 0; i < positions.length; ++i) {
							if (positions[i].x === index.x && positions[i].y === index.y) {
								positions.splice(i, 1);
								break;
							}
						}
						break;
					}
				}
			}
		}
		this._setBufferPos.set(index, block);
		const hash = hashTwoNumbers(layer, block.id);
		if (!this._setBuffer.has(hash))
			this._setBuffer.set(hash, []);
		const bucket = this._setBuffer.get(hash);
		let positions;
		for (const { index, positions: bucketPositions } of bucket) {
			if (index.layer === layer && index.block.equals(block)) {
				positions = bucketPositions;
				break;
			}
		}
		if (!positions) {
			positions = [];
			bucket.push({ index: { layer, block }, positions });
		}
		positions.push({ x, y });
	}
	setSub(x1, y1, structure) {
		for (let x = 0; x < structure.width; ++x) for (let y = 0; y < structure.height; ++y) for (let layer = 0; layer < structure.layers; ++layer) {
			const block = structure.get(x, y, layer);
			if (!block) continue;
			this.set(x1 + x, y1 + y, layer, block);
		}
	}
	setArea(x1, y1, x2, y2, layer, block) {
		for (let x = x1; x <= x2; ++x) for (let y = y1; y <= y2; ++y)
			this.set(x, y, layer, block);
	}
	waitForBlockPlaced(blockStr, player, timeout) { return new Promise(async (resolve, reject) => {
		timeout = timeout ?? 30;
		let id;
		if (blockStr !== undefined) {
			id = (await this.room.client.blockManager()).id(blockStr);
			if (id === undefined) {
				reject(new Error(`Invalid block string ${blockStr}`));
				return;
			}
		}
		let rejectTimeout;
		const blockPlacedEvent = ({ player: blockPlacedEventPLayer, block, x, y, layer }) => {
			if (player && player.id !== blockPlacedEventPLayer.id)
				return;
			if (id !== undefined && block.id !== id)
				return;
			clearTimeout(rejectTimeout);
			const blockOld = this.get(x, y, layer);
			console.log(blockOld, block);
			resolve({ block, blockOld, x, y, layer });
		};
		rejectTimeout = setTimeout(() => {
			this.removeListener("blockPlaced", blockPlacedEvent);
			reject(new Error(`Block ${blockStr} not placed within ${timeout} seconds`));
		}, timeout * 1000);
		this.on("blockPlaced", blockPlacedEvent);
	}); }
}