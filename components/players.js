import { EventEmitter } from "events";

import { Vec2 } from "./vec2.js";

export class Player {
	static fromProperties(properties) {
		return new Player(properties.playerId, properties.username, properties.accountId, properties.face, properties.role, properties.isFriend, properties.isWorldOwner, properties?.position?.x, properties?.position?.y, properties?.rights?.canEdit, properties?.rights?.canGod, properties?.rights?.canToggleMinimap, properties?.rights?.canChangeWorldSettings);
	}
	constructor(id, name, accountId, face, role, friend, owner, x, y, canEdit, canGod, canToggleMinimap, canChangeWorldSettings) {
		this.id = id;
		this.name = name;
		this.accountId = accountId;
		this.face = face;
		this.role = role;
		this.friend = friend;
		this.owner = owner;
		this.position = new Vec2(x ?? 1, y ?? 1);
		this.canEdit = canEdit;
		this.canGod = canGod;
		this.canToggleMinimap = canToggleMinimap;
		this.canChangeWorldSettings = canChangeWorldSettings;
		this.god = false;
	}
}

export class Players extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.players = new Map();
		this.addDefaultListeners();
	}
	get(id) {
		return this.players.get(id) ?? new Player(id);
	}
	addDefaultListeners() {
		this.room.on("playerInitPacket", packet => {
			const player = Player.fromProperties(packet.playerProperties);
			this.players.set(player.id, player);
			this.self = player;
			this.emit("join", { player });
		});
		this.room.on("playerJoinedPacket", packet => {
			const player = Player.fromProperties(packet.properties);
			this.players.set(player.id, player);
			this.emit("join", { player });
		});
		this.room.on("playerLeftPacket", packet => {
			this.emit("leave", { player: this.players.get(packet.playerId) });
			this.players.delete(packet.playerId);
		})
		this.room.on("playerGodModePacket", packet => {
			const player = this.players.get(packet.playerId);
			player.god = packet.enabled;
			this.emit("god", { player: player });
		});
	}
}