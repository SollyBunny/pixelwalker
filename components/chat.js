import { EventEmitter } from "events";

export class Chat extends EventEmitter {
	constructor(room) {
		super();
		this.room = room;
		this.addDefaultListeners();
	}
	addDefaultListeners() {
		// Chat
		this.room.on("playerChatPacket", packet => {
			this.emit("chat", { player: this.room.players.get(packet.playerId), message: packet.message });
		});
		this.room.on("playerDirectMessagePacket", packet => {
			this.emit("whisper", { player: this.room.players.get(packet.fromPlayerId), message: packet.message });
		});
	}
	send(message) {
		message = String(message).slice(0, 120).replace(/\s+/g, " ");
		this.room.send("playerChatPacket", { message });
	}
	whisper(player, message) {
		if (player.id === this.room.players.self.id || player.name === this.room.players.self.name) {
			this.send(message);
		} else {
			this.send(`/dm ${player.name} ${message}`);
		}
	}
}