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
	constructor(client) {
		super();
		if (globalThis.process) {
			// Cleanup on crash or other exit
			const close = error => {
				process.removeListener("uncaughtException", close);
				process.removeListener("exit", close);
				process.removeListener("SIGINT", close);
				process.removeListener("SIGUSR1", close);
				process.removeListener("SIGUSR2", close);
				try {
					this.close();
				} catch (e) {
					console.error(e);
				}
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
		this.workqueue = new WorkQueue(({ name, value }) => this.sendNow(name, value), 300);
		this.addDefaultListeners();
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
	async connect(id, type) {
		const token = await this.client.roomToken(id, type);
		const url = `${URLServerSocketGame(this.client.local)}/room/${token}`;
		this.ws = new WebSocketClient(url);
		this.ws.binaryType = "arraybuffer";
		await (() => new Promise((resolve, reject) => {
			if (this.ws.on) this.ws.on("unexpected-response", (request, response) => {
				let msg = response.statusMessage ?? "";
				// if (response.statusCode == 404)
				// 	msg += " (Probably updating)";
				reject(new Error(`Could not connect to ${request.method} ${request.host}: ${response.statusCode} ${msg}`));
			});
			this.ws.onopen = resolve;
		}))();
		this.id = id;
		this.type = type;
		this.ws.onclose = event => this.close(event.reason);
		this.ws.onmessage = message => {
			const packet = fromBinary(WorldPacketSchema, Buffer.from(message.data));
			// console.log(packet.packet.case, JSON.stringify(packet.packet.value ?? {}).slice(0, 100));
			this.emit(packet.packet.case, packet.packet.value ?? {});
		};
		await (() => new Promise((resolve, reject) => {
			this.once("close", reject);
			this.once("playerInitPacket", resolve);
		}))();
		this.workqueue.start();
	}
	get open() {
		return this.ws !== undefined && this.ws.readyState === WebSocket.OPEN;
	}
	close(reason) {
		if (!this.ws) return;
		reason = reason ?? "Closed by client";
		if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
			if (this.ws.readyState === WebSocket.OPEN)
				this.world.setTitleState(); // TODO doesnt set title
			this.ws.close(1000, reason);
		}
		this.ws = undefined;
		this.workqueue.stop();
		this.emit("close", reason);
	}
	sendNow(name, value) {
		if (!this.open) return;
		const message = create(WorldPacketSchema, { packet: { case: name, value: value ?? {} } });
		const buffer = toBinary(WorldPacketSchema, message);
		this.ws.send(buffer);
	}
	sendFilter(pred) {
		this.workqueue.filter(pred);
	}
	send(name, value) {
		if (!this.open) return;
		this.workqueue.push({ name, value });
	}
}