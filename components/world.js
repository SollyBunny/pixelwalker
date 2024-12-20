import { EventEmitter } from "events";
import { Structure, Block } from "./structure.js";

function muxInt16(x, y) {
	return (x << 16) | y;
}

function demuxInt16(i) {
	const x = (i >> 16) & 0xFFFF;
	const y = i & 0xFFFF;
	return { x, y };
}

export class World extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.addDefaultListeners();
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
		this.room.on("globalSwitchChangedPacket", ({ switchId, enabled, playerId }) => {
			const data = { player: this.room.players.get(playerId), id: switchId, enabled };
			this.emit("globalSwitch", data);
			this.emit("globalSwitchFinish", data);
		});
		this.on("globalSwitchFinish", ({ id, enabled }) => {
			this.globalSwitches[id] = enabled;
		});
		this.room.on("globalSwitch", ({ enabled, playerId }) => {
			data = { player: this.room.players.get(playerId), enabled };
			this.emit("globalSwitchReset", data);
			this.emit("globalSwitchResetFinish", data);
		});
		this.on("globalSwitchResetFinish", ({ enabled }) => {
			this.globalSwitches.fill(enabled);
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
		const blockId = block.id;
		const extraFields = block.serializeProperties();
		const positionsHash = new Set(positions.map(({x, y}) => muxInt16(x, y)));
		this.room.sendFilter(({ name, value }) => {
			// For each pending packet
			// 1. Ignore if not a worldBlockPlacedPacket packet
			if (name !== "worldBlockPlacedPacket") return true;
			const { positions: positionsQ, layer: layerQ, blockId: blockIdQ, extraFields: extraFieldsQ } = value;
			// 2. Look for matching block / layer
			//    Add to positions, remove from queue (if less than 100 blocks in packet)
			if (positionsQ.length < 100 && blockId === blockIdQ && layer === layerQ && extraFields.equals(extraFieldsQ)) {
				for (const position of positionsQ) {
					const hash = muxInt16(position.x, position.y);
					if (!positionsHash.has(hash)) {
						positionsHash.add(hash);
						positions.push(position);
						if (positionsQ.length >= 100)
							break;
					}
				}
				return false;
			}
			// 3. Look for matching positions
			//    Remove them, if empty remove from queue
			for (let i = 0; i < positionsQ.length; ++i) {
				const { x, y } = positionsQ[i];
				if (positionsHash.has(muxInt16(x, y))) {
					positionsQ.splice(i, 1);
					--i; // Adjust the index to check the next element after removal
				}
			}
			return positionsQ.length > 0;
		});
		this.room.send("worldBlockPlacedPacket", {
			isFillOperation: false,
			positions, layer, blockId, extraFields
		});
		return block;
	}
	_setManyNow(positions, layer, block) {
		const blockId = block.id;
		const extraFields = block.serializeProperties();
		const positionsHash = new Set(positions.map(({x, y}) => muxInt16(x, y)));
		function pred({ name, value }) {
			// For each pending packet
			// 1. Ignore if not a worldBlockPlacedPacket packet
			if (name !== "worldBlockPlacedPacket") return true;
			const { positions: positionsQ, layer: layerQ, blockId: blockIdQ, extraFields: extraFieldsQ } = value;
			// 2. Look for matching positions
			//    Remove them, if empty remove from queue
			for (let i = 0; i < positionsQ.length; ++i) {
				const { x, y } = positionsQ[i];
				if (positions.has(muxInt16(x, y))) {
					positionsQ.splice(i, 1);
					--i; // Adjust the index to check the next element after removal
				}
			}
			return positionsQ.length > 0;
		}
		this.room.sendNow("worldBlockPlacedPacket", {
			isFillOperation: false,
			positions, layer, blockId, extraFields
		});
		return block;
	}
	set(x, y, layer, block) {
		const index = this.structure.index(x, y, layer);
		if (!index) return;
		return this._setMany([{ x, y }], layer, block);
	}
	setNow(x, y, layer, block) {
		const index = this.structure.index(x, y, layer);
		if (!index) return;
		return this._setManyNow([{ x, y }], layer, block);
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
	select(blockStr, player, timeout) { return new Promise(async (resolve, reject) => {
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
			resolve({ block, blockOld, x, y, layer });
		};
		rejectTimeout = setTimeout(() => {
			this.removeListener("blockPlaced", blockPlacedEvent);
			if (blockStr)
				reject(new Error(`Block ${blockStr} not placed within ${timeout} seconds`));
			else
				reject(new Error(`Block not placed within ${timeout} seconds`));
		}, timeout * 1000);
		this.on("blockPlaced", blockPlacedEvent);
	}); }
	async selectSub(blockStr, player, timeout) {
		this.room.chat.whisper(player, "Place 2 blocks to select rectangular region");
		let { x: x1, y: y1, layer: layer1, blockOld: blockOld1 } = await this.select(blockStr, player, timeout);
		this.room.chat.whisper(player, `Selected first position ${x1}, ${y1}`);
		this.set(x1, y1, layer1, blockOld1);
		let { x: x2, y: y2, layer: layer2, blockOld: blockOld2 } = await this.select(blockStr, player, timeout);
		this.room.chat.whisper(player, `Selected second position ${x2}, ${y2}`);
		this.room.world.set(x2, y2, layer2, blockOld2);
		if (x1 > x2) {
			const temp = x2;
			x2 = x1;
			x1 = temp;
		}
		if (y1 > y2) {
			const temp = y2;
			y2 = y1;
			y1 = temp;
		}
		const width = x2 - x1;
		const height = y2 - y1;
		const size = width * height;
		if (size === 0)
			throw new Error("Region empty");
		this.room.chat.whisper(player, `Selected region: ${x1}, ${y1} to ${x2}, ${y2}. Size: ${width}x${height} (${size} blocks)`);
		return { x1, y1, x2, y2, width, height, size };
	}
}