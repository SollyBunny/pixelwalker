import { EventEmitter } from "../lib/eventemitter.js";
import { CustomMap, hash2 } from "../lib/custommap.js";

import { Structure, Block, LAYER_COUNT, LAYER_FOREGROUND, LAYER_BACKGROUND } from "./structure.js";

export class World extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.room.workqueue.sourceAdd(this._workqueueSource.bind(this));
		this._workqueue = new CustomMap(
			block => hash2(block.layer, block.id),
			(blockA, blockB) => blockA.equals(blockB)
		);
		this.addDefaultListeners();
	}
	addDefaultListeners() {
		this.room.on("playerInitPacket", async ({ globalSwitchState, worldWidth, worldHeight, worldData, worldMeta }) => {
			this.globalSwitches = Uint8Array.from(globalSwitchState);
			this.structure = Structure.fromBuffer(worldData, worldWidth, worldHeight, this.room.client.blockManager);
			this._updateMeta(worldMeta);
		});
		this.room.on("worldMetaUpdatePacket", ({ meta }) => {
			this._updateMeta(meta);
		});
		this.room.on("worldClearedPacket", async () => {
			const block = Block.fromManager(this.room.client.blockManager, "basic_gray");
			this.structure.setAreaClearOutline(0, 0, this.width, this.height, block);
		});
		this.room.on("worldBlockPlacedPacket", async packet => {
			const { layer, playerId } = packet;
			const block = Block.fromPacket(this.room.client.blockManager, packet);
			const player = this.room.players.get(playerId);
			if (packet.positions[0] === undefined)
				packet.positions = [packet.positions];
			for (const { x, y } of packet.positions) {
				this.emit("blockPlaced", { player, block, x, y, blockOld: this.structure.get(x, y, layer), allPositions: packet.positions });
				this.structure.set(x, y, block);
			}
			this.emit("blockPlacedGroup", { player, block, positions: packet.positions });
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
	setTitleState(state) {
		const index = this.title.indexOf("[");
		if (!state) {
			if (index !== -1)
				this.setTitle(this.title.slice(0, index).trimEnd());
		} else {
			if (index === -1)
				this.setTitle(`${this.title} [${state}]`)
			else
				this.setTitle(`${this.title.slice(0, index).trimEnd()} [${state}]`);
		}
	}
	setVisibility(visibility) {
		if (["public", "unlisted", "friends", "private"].indexOf(visibility) === -1)
			throw "Invalid visiblity level";
		this.room.chat.send(`/visibility ${visibility}`);
	}
	_workqueueSource(add) {
		const MAXPOSITIONS = 200;
		for (let [block, positions] of this._workqueue) {
			positions = positions.filter(position => {
				if (!block.equals(this.get(position.x, position.y, block.layer))) {
					this._workqueueAdd([position], block);
					return false;
				}
				return true;
			});
			const extraFields = block.serializeProperties();
			if (positions.length > MAXPOSITIONS) {
				for (let i = 0; i < positions.length; i += 100)
					add("worldBlockPlacedPacket", {
						isFillOperation: false,
						positions: positions.slice(i, i + 100),
						layer: block.layer, blockId: block.id, extraFields
					});
			} else {
				add("worldBlockPlacedPacket", {
					isFillOperation: false,
					positions,
					layer: block.layer, blockId: block.id, extraFields
				});
			}
		}
		this._workqueue.clear();
	}
	_workqueueAdd(positions, block) {
		const positionsB = this._workqueue.get(block);
		if (positionsB) {
			// way faster to .push if under certain size
			if (positions.length < 32) {
				for (const position of positions)
					positionsB.push(position);
			} else
				this._workqueue.set(block, positionsB.concat(positions));
		} else
			this._workqueue.set(block, positions);
	}
	setMany(positions, block) {
		if (!block) return;
		positions = positions.filter(({ x, y }) => 
			!block.equals(this.get(x, y, block.layer))
		);
		this._workqueueAdd(positions, block);
		for (const { x, y } of positions)
			this.structure.set(x, y, block);
		return block;
	}
	setManyNow(positions, block) {
		if (!block) return;
		const extraFields = block.serializeProperties();
		this.room.sendNow("worldBlockPlacedPacket", {
			isFillOperation: false,
			positions, layer: block.layer, blockId: block.id, extraFields
		});
		for (const { x, y } of positions)
			this.structure.set(x, y, block);
		return block;
	}
	set(x, y, block) {
		if (!block) return;
		const index = this.structure.index(x, y, block.layer);
		if (!index) return;
		return this.setMany([{ x, y }], block);
	}
	setNow(x, y, block) {
		if (!block) return;
		const index = this.structure.index(x, y, block.layer);
		if (!index) return;
		return this.setManyNow([{ x, y }], block);
	}
	waitForBlockPlaced(player, blockStr, timeout) { return new Promise(async (resolve, reject) => {
		timeout = timeout ?? 30;
		let id;
		if (blockStr !== undefined) {
			id = this.room.client.blockManager.id(blockStr);
			if (id === undefined) {
				reject(new Error(`Invalid block string ${blockStr}`));
				return;
			}
		}
		let rejectTimeout;
		const blockPlacedEvent = ({ player: blockPlacedEventPLayer, block, blockOld, x, y }) => {
			if (player && player.id !== blockPlacedEventPLayer.id)
				return;
			if (id !== undefined && block.id !== id)
				return;
			this.off("blockPlaced", blockPlacedEvent);
			clearTimeout(rejectTimeout);
			resolve({ block, blockOld, x, y });
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
		let { x, y, blockOld } = await this.waitForBlockPlaced(player, blockStr, timeout);
		this.set(x, y, blockOld);
		return { x, y, blockOld };
	}
	async selectSub(player, blockStr, timeout) {
		this.room.chat.whisper(player, "Place 2 blocks to select rectangular region");
		let { x: x1, y: y1, blockOld: blockOld1 } = await this.select(player, blockStr, timeout);
		this.room.chat.whisper(player, `Selected first position: ${x1}, ${y1}`);
		let { x: x2, y: y2, blockOld: blockOld2 } = await this.select(player, blockStr, timeout);
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
		return { x1, y1, x2, y2, width, height, size, blockOld1, blockOld2 };
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
		if (!block) return;
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
		this.setAreaClear(x1 + 1, y1 + 1, x2 - 1, y2 - 1);
		this.setAreaOutline(x1, y1, x2, y2, block);
	}
	// From structure
	get width() { return this.structure.width; }
	get height() { return this.structure.height; }
	index(x, y, layer) { return this.structure.index(x, y, layer); }
	get(x, y, layer) { return this.structure.get(x, y, layer); }
	getSub(x1, y1, x2, y2) { return this.structure.getSub(x1, y1, x2, y2); }
}