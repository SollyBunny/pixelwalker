import { EventEmitter } from "../lib/eventemitter.js";

export class Player {
	static fromPacket(room, properties, worldState) {
		const player = new Player(room, properties.playerId);
		player.username = properties.username;
		player.accountId = properties.accountId;
		player.face = properties.face;
		player.role = properties.role;
		player.friend = properties.isFriend;
		player.owner = properties.isWorldOwner;
		player.position.x = properties.position.x;
		player.position.y = properties.position.y;
		player.canEdit = properties.rights.canEdit;
		player.canGod = properties.rights.canGod;
		player.canToggleMinimap = properties.rights.canToggleMinimap;
		player.canChangeWorldSettings = properties.rights.canChangeWorldSettings;
		player.coinsGold = worldState.coinsGold ?? 0;
		player.coinsBlue = worldState.coinsBlue ?? 0;
		player.deaths = worldState.deaths ?? 0;
		player.god = worldState.godmode ?? false;
		player.mod = worldState.modmode ?? false;
		player.switches = worldState.switches ? Uint8Array.from(worldState.switches) : new Uint8Array(999);
		player.teamId = worldState.teamId ?? 0;
		return player;
	}
	constructor(room, id) {
		this.room = room;
		this.id = id;
		this.position = { x: 1, y: 1 };
		this.velocity = { x: 0, y: 0 };
		this.lastMovedTime = performance.now();
		this.afk = false;
	}
	get worldPosition() {
		return { x: this.position.x / 16, y: this.position.y / 16 };
	}
	setAfk(afk) {
		if (this.afk === afk)
			return;
		this.afk = afk;
		if (this.afk) {
			this.room.chat.whisper(this, "You are now afk, move to unafk")
		} else {
			this.lastMovedTime = performance.now();
			this.room.chat.whisper(this, "You are no longer afk")
		}
	}
	setCanGod(enabled) {
		enabled = enabled ?? !this.canGod;
		this.room.chat.send(`/${enabled ? "give" : "take"}god #${this.id}`);
	}
	setCanEditGod(enabled) {
		enabled = enabled ?? !(this.canEdit && this.canGod);
		this.room.chat.send(`/${enabled ? "give" : "take"}edit #${this.id}`);
	}
	setCanEdit(enabled) {
		enabled = enabled ?? !this.canEdit;
		this.room.chat.send(`/${enabled ? "give" : "take"}edit #${this.id}`);
		if (this.canGod !== this.canEdit)
			this.setCanGod(this.canGod);
	}
	setGod(enabled) {
		enabled = enabled ?? !this.god;
		this.room.chat.send(`/forcegod #${this.id} ${enabled}`);
	}
	setCrown() {
		this.room.chat.send(`/crown #${this.id}`);
	}
	respawn() {
		this.room.chat.send(`/resetplayer #${this.id}`);
	}
	teleport(x, y) {
		this.room.chat.send(`/tp #${this.id} ${x} ${y}`);
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
		return this.players.get(id) ?? new Player(this.room, id);
	}
	addDefaultListeners() {
		this.room.on("playerInitPacket", packet => {
			const player = Player.fromPacket(this.room, packet.playerProperties, {});
			this.players.set(player.id, player);
			this.self = player;
			this.emit("join", { player });
		});
		this.room.on("playerJoinedPacket", packet => {
			const player = Player.fromPacket(this.room, packet.properties, packet.worldState);
			this.players.set(player.id, player);
			this.emit("join", { player });
		});
		this.room.on("playerLeftPacket", packet => {
			this.emit("leave", { player: this.get(packet.playerId) });
			this.players.delete(packet.playerId);
		});
		this.room.on("playerGodModePacket", packet => {
			const player = this.get(packet.playerId);
			player.god = packet.enabled;
			this.emit("god", { player: player });
		});
		this.room.on("playerUpdateRightsPacket", packet => {
			const player = this.get(packet.playerId);
			player.canGod = packet.canGod;
			player.canEdit = packet.canEdit;
			player.canToggleMinimap = packet.canToggleMinimap;
			player.canChangeWorldSettings = packet.canChangeWorldSettings;
		});
		this.room.on("playerTeleportedPacket", packet => {
			const player = this.get(packet.playerId);
			if (packet.position) {
				player.position.x = packet.position.x;
				player.position.y = packet.position.y;
				this.emit("moved", { player });
			}
		});
		this.room.on("playerResetPacket", packet => {
			const player = this.get(packet.playerId);
			if (packet.position) {
				player.position.x = packet.position.x;
				player.position.y = packet.position.y;
				this.emit("moved", { player });
			}
		})
		this.room.on("playerMovedPacket", packet => {
			const player = this.get(packet.playerId);
			player.position.x = packet.position.x;
			player.position.y = packet.position.y;
			player.velocity.x = packet.velocityX;
			player.velocity.y = packet.velocityY;
			player.lastMovedPacket = packet;
			this.emit("moved", { player });
		});
		// TODO
		this.room.on("playerAddEffectPacket", packet => {

		});
		this.room.on("playerRemoveEffectPacket", packet => {

		});
		// Afk
		this._checkAfkLastTime = performance.now();
		this.on("moved", ({ player }) => {
			if (player.afk)
				player.setAfk(false);
			const now = performance.now()
			if (now - this._checkAfkLastTime > 5000) {
				this._checkAfk();
			}
		});
	}
	[Symbol.iterator]() {
		return this.players.values();
	}
	_checkAfk() {
		const now = performance.now();
		for (const player of this) {
			if (now - player.lastMovedTime > 30000)
				player.setAfk(true);
		}
	}
}