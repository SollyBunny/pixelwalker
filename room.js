import { toBinary, fromBinary, create } from "@bufbuild/protobuf";
import { WorldPacketSchema } from "./protocol/world_pb.js";

import { EventEmitter } from "./lib/eventemitter.js";
import { WorkQueue } from "./lib/workqueue.js";
import { URLServerSocketGame } from "./endpoints.js"
import { Chat } from "./components/chat.js";
import { Players } from "./components/players.js";
import { World } from "./components/world.js";

let WebSocketClient;
if (typeof document === "undefined")
	WebSocketClient = (await import("ws")).WebSocket;
else
	WebSocketClient = globalThis.WebSocket;

export class Room extends EventEmitter {
	static async fromId(client, id, type) {
		const token = await client.roomToken(id, type);
		const url = `${URLServerSocketGame(client.local)}/room/${token}`;
		function fnc() { return new Promise(resolve => {
			const ws = new WebSocketClient(url);
			ws.binaryType = "arraybuffer";
			if (ws.on) ws.on("unexpected-response", (request, response) => {
				let msg = response.statusMessage ?? "";
				// if (response.statusCode == 404)
				// 	msg += " (Probably updating)";
				throw new Error(`Could not connect to ${request.method} ${request.host}: ${response.statusCode} ${msg}`);
			});
			ws.onopen = () => {
				resolve(new Room(client, id, type, ws));
			};
		}); }
		return fnc();
	}
	constructor(client, id, type, ws) {
		super();
		if (ws.readyState !== WebSocketClient.OPEN)
			throw new Error("WebSocket is not open");
		if (globalThis.process) {
			// Cleanup on crash or other exit
			const close = error => {
				process.removeListener("uncaughtException", close);
				process.removeListener("exit", close);
				process.removeListener("SIGINT", close);
				process.removeListener("SIGUSR1", close);
				process.removeListener("SIGUSR2", close);
				this.close();
				if (typeof(error) === "string")
					process.kill(process.pid, error)
				if (error instanceof Error)
					throw error;
			};
			process.on("uncaughtException", close);
			process.on("exit", close);
			process.on("SIGINT", close);
			process.on("SIGUSR1", close);
			process.on("SIGUSR2", close);
		}
		this.client = client;
		this.id = id;
		this.type = type;
		this.open = true;
		this.ws = ws;
		this.workqueue = new WorkQueue(({ name, value }) => this.sendNow(name, value), 100);
		this.ws.onclose = event => {
			this.close(event.reason);
		};
		this.ws.onmessage = async message => {
			const packet = fromBinary(WorldPacketSchema, Buffer.from(message.data));
			// console.log(packet.packet.case, JSON.stringify(packet.packet.value ?? {}).slice(0, 100));
			this.emit(packet.packet.case, packet.packet.value ?? {});
		};
		this.addDefaultListeners();
	}
	close(reason) {
		if (!this.open) return;
		this.open = false;
		this.workqueue.close();
		this.ws.close();
		this.emit("close", reason ?? "Closed by client");
	}
	sendNow(name, value) {
		const message = create(WorldPacketSchema, { packet: { case: name, value: value ?? {} } });
		const buffer = toBinary(WorldPacketSchema, message);
		this.ws.send(buffer);
	}
	sendFilter(pred) {
		this.workqueue.filter(pred);
	}
	send(name, value) {
		this.workqueue.push({ name, value });
	}
	addDefaultListeners() {
		// Init
		this.on("ping", () => {
			this.sendNow("ping");
		});
		this.on("playerInitPacket", () => {
			this.sendNow("playerInitReceived");
		});
		// Components
		this.players = new Players(this);
		this.chat = new Chat(this);
		this.world = new World(this);
	}
}