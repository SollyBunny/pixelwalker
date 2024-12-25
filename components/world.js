import { EventEmitter } from "../lib/eventemitter.js";
import { CustomMap, hash2 } from "../lib/custommap.js";

import { Structure, Block, LAYER_COUNT, LAYER_FOREGROUND, LAYER_BACKGROUND } from "./structure.js";

export class World extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.room.workqueue.sourceAdd(this._workqueueSource.bind(this));
		this._workqueue = new CustomMap(
			({ layer, block }) => hash2(layer, block.id),
			({ layer: layerA, block: blockA }, { layer: layerB, block: blockB }) => layerA === layerB && blockA.equals(blockB)
		);
		this.addDefaultListeners();
	}
	addDefaultListeners() {
		this.room.on("playerInitPacket", async ({ globalSwitchState, worldWidth, worldHeight, worldData, worldMeta }) => {
			this.globalSwitches = Uint8Array.from(globalSwitchState);
			this.structure = Structure.fromBuffer(worldWidth, worldHeight, await this.room.client.blockManager(), worldData);
			this._updateMeta(worldMeta);
		});
		this.room.on("worldMetaUpdatePacket", ({ meta })	 => {
			this._updateMeta(meta);
		});
		this.room.on("worldClearedPacket", async () => {
			this.structure.setArea(0, 0, this.structure.width, this.structure.height, LAYER_BACKGROUND, new Block());
			this.structure.setArea(1, 1, this.structure.width - 1, this.structure.height - 1, LAYER_FOREGROUND, new Block());
			const block = Block.fromManager(await this.room.client.blockManager(), "basic_gray");
			for (let x = 0; x < this.structure.width; ++x) {
				this.structure.set(x, 0, LAYER_FOREGROUND, block);
				this.structure.set(x, this.structure.height - 1, LAYER_FOREGROUND, block);
			}
			for (let y = 1; y < this.structure.height - 1; ++y) {
				this.structure.set(0, y, LAYER_FOREGROUND, block);
				this.structure.set(this.structure.width - 1, y, LAYER_FOREGROUND, block);
			}
		});
		this.room.on("worldBlockPlacedPacket", async packet => {
			const { layer, playerId } = packet;
			const block = Block.fromPacket(await this.room.client.blockManager(), packet);
			const player = this.room.players.get(playerId);
			if (packet.positions[0] === undefined)
				packet.positions = [packet.positions];
			for (const { x, y } of packet.positions) {
				this.emit("blockPlaced", { player, block, x, y, layer, blockOld: this.structure.get(x, y, layer), allPositions: packet.positions });
				this.structure.set(x, y, layer, block);
			}
		});
		this.room.on("globalSwitchChangedPacket", ({ switchId, enabled, playerId }) => {
			this.emit("globalSwitch", { player: this.room.players.get(playerId), id: switchId, enabled, enabledOld: this.globalSwitches[id] });
			this.globalSwitches[id] = enabled;
		});
		this.room.on("globalSwitch", ({ enabled, playerId }) => {
			this.emit("globalSwitchReset", { player: this.room.players.get(playerId), enabled, enabledOld: Uint8Array.from(this.globalSwitches) });
			this.globalSwitches.fill(enabled);
		});
	}
	_updateMeta(meta) {
		this.title = meta.title;
		this.plays = meta.plays;
		this.description = meta.description;
		this.ownerName = meta.owner;
		this.ownerRole = meta.ownerRole;
		this.visibility = meta.visibility;
		this.worldType = meta.worldType;
		this.hasUnsavedChanges = meta.hasUnsavedChanges;
		this.minimapEnabled = meta.minimapEnabled;
		this.emit("meta");
	}
	setTitle(title) {
		this.room.chat.send(`/title ${title}`);
	}
	setVisibility(visibility) {
		if (["public", "unlisted", "friends", "private"].indexOf(visibility) === -1)
			throw "Invalid visiblity level";
		this.room.chat.send(`/visibility ${visibility}`);
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
	_workqueueSource(add) {
		const MAXPOSITIONS = 100;
		for (const [{ layer, block }, positions] of this._workqueue) {
			const blockId = block.id;
			const extraFields = block.serializeProperties();
			if (positions.length > MAXPOSITIONS) {
				for (let i = 0; i < positions.length; i += 100)
					add("worldBlockPlacedPacket", {
						isFillOperation: false,
						positions: positions.slice(i, i + 100),
						layer, blockId, extraFields
					});
			} else {
				add("worldBlockPlacedPacket", {
					isFillOperation: false,
					positions, layer, blockId, extraFields
				});
			}
		}
		this._workqueue.clear();
	}
	_workqueueAdd(positions, layer, block) {
		const key = { layer, block };
		const positionsB = this._workqueue.get(key);
		if (positionsB) {
			// way faster to .push if under certain size
			if (positions.length < 32) {
				for (const position of positions)
					positionsB.push(position);
			} else
				this._workqueue.set(key, positionsB.concat(positions));
		} else
			this._workqueue.set(key, positions);
	}
	setMany(positions, layer, block) {
		if (!block) return;
		this._workqueueAdd(positions, layer, block);
		return block;
	}
	setManyNow(positions, layer, block) {
		if (!block) return;
		const blockId = block.id;
		const extraFields = block.serializeProperties();
		this.room.sendNow("worldBlockPlacedPacket", {
			isFillOperation: false,
			positions, layer, blockId, extraFields
		});
		return block;
	}
	set(x, y, layer, block) {
		const index = this.structure.index(x, y, layer);
		if (!index) return;
		if (!block) return;
		return this.setMany([{ x, y }], layer, block);
	}
	setNow(x, y, layer, block) {
		const index = this.structure.index(x, y, layer);
		if (!index) return;
		if (!block) return;
		return this.setManyNow([{ x, y }], layer, block);
	}
	setSub(x1, y1, structure) {
		for (let x = 0; x < structure.width; ++x) for (let y = 0; y < structure.height; ++y) for (let layer = 0; layer < LAYER_COUNT; ++layer) {
			const block = structure.get(x, y, layer);
			if (!block) continue;
			this.set(x1 + x, y1 + y, layer, block);
		}
	}
	setArea(x1, y1, x2, y2, layer, block) {
		if (!block) return;
		for (let x = x1; x <= x2; ++x) for (let y = y1; y <= y2; ++y)
			this.set(x, y, layer, block);
	}
	waitForBlockPlaced(player, blockStr, timeout) { return new Promise(async (resolve, reject) => {
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
		const blockPlacedEvent = ({ player: blockPlacedEventPLayer, block, blockOld, x, y, layer }) => {
			if (player && player.id !== blockPlacedEventPLayer.id)
				return;
			if (id !== undefined && block.id !== id)
				return;
			clearTimeout(rejectTimeout);
			resolve({ block, blockOld, x, y, layer });
		};
		rejectTimeout = setTimeout(() => {
			this.off("blockPlaced", blockPlacedEvent);
			if (blockStr)
				reject(new Error(`Block ${blockStr} not placed within ${timeout} seconds`));
			else
				reject(new Error(`Block not placed within ${timeout} seconds`));
		}, timeout * 1000);
		this.on("blockPlaced", blockPlacedEvent);
	}); }
	async select(player, blockStr, timeout) {
		let { x, y, layer, blockOld } = await this.waitForBlockPlaced(player, blockStr, timeout);
		this.set(x, y, layer, blockOld);
		return { x, y, layer, blockOld };
	}
	async selectSub(player, blockStr, timeout) {
		this.room.chat.whisper(player, "Place 2 blocks to select rectangular region");
		let { x: x1, y: y1, layer: layer1, blockOld: blockOld1 } = await this.select(player, blockStr, timeout);
		this.room.chat.whisper(player, `Selected first position: ${x1}, ${y1}`);
		let { x: x2, y: y2, layer: layer2, blockOld: blockOld2 } = await this.select(player, blockStr, timeout);
		this.room.chat.whisper(player, `Selected second position: ${x2}, ${y2}`);
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
		return { x1, y1, x2, y2, width, height, size, layer1, blockOld1, layer2, blockOld2 };
	}
}