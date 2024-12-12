import { EventEmitter } from "events";
import WebSocket from "ws";
import { toBinary, fromBinary, create } from "@bufbuild/protobuf";
import { WorldPacketSchema } from "./protocol/world_pb.js";

import { URLServerSocketGame } from "./endpoints.js"
import { Chat } from "./components/chat.js";
import { Players } from "./components/players.js";
import { World } from "./components/world.js";

export class Room extends EventEmitter {
	static async fromId(client, id, type) {
		const token = await client.roomToken(id, type);
		const url = `${URLServerSocketGame(client.local)}/room/${token}`;
		function fnc() { return new Promise(resolve => {
			const ws = new WebSocket(url);
			ws.binaryType = "arraybuffer";
			ws.on("unexpected-response", (request, response) => {
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
		if (ws.readyState !== WebSocket.OPEN)
			throw new Error("WebSocket is not open");
		const deconstructorError = function(error) {
			process.removeListener("uncaughtException", deconstructorError);
			deconstructor();
			throw error;
		};
		process.on("uncaughtException", deconstructorError);
		const deconstructor = () => this.deconstructor();
		process.on("exit", deconstructor);
		process.on("SIGINT", deconstructor);
		process.on("SIGUSR1", deconstructor);
		process.on("SIGUSR2", deconstructor);
		this.client = client;
		this.id = id;
		this.type = type;
		this.ws = ws;
		this.open = true;
		this.ws.on("close", (code, reason) => {
			if (!this.open) return;
			this.open = false;
			this.emit("close", { code, reason });
		});
		this.ws.on("message", async message => {
			const packet = fromBinary(WorldPacketSchema, Buffer.from(message));
			// console.log(packet.packet.case, JSON.stringify(packet.packet.value ?? {}).slice(0, 100));
			this.emit(packet.packet.case, packet.packet.value ?? {});
		});
		this.addDefaultListeners();
	}
	deconstructor() {
		if (!this.open) return;
		this.open = false;
		this.ws.close();
	}
	async protobuf() {
		if (!this._protobuf)
			this._protobuf = await Protobuf.load("protocol/world.proto");
		return this._protobuf;
	}
	async WorldPacketSchema() {
		if (!this._WorldPacketSchema)
			this._WorldPacketSchema = (await this.protobuf()).lookupType("WorldPacket");
		return this._WorldPacketSchema;
	}
	async send(name, value) {
		const message = create(WorldPacketSchema, { packet: { case: name, value: value ?? {} } });
		const buffer = toBinary(WorldPacketSchema, message);
		function formatBufferToHexQuads(buffer) {
			// Convert the buffer to a hexadecimal string
			const hexString = buffer.toString('hex');
		
			// Split the string into chunks of four characters
			const chunks = [];
			for (let i = 0; i < hexString.length; i += 4) {
				chunks.push(hexString.slice(i, i + 4));
			}
		
			// Join the chunks with spaces
			const formattedHex = chunks.join(' ');
			return formattedHex;
		}
		// console.log(formatBufferToHexQuads(Buffer.from(buffer)));
		this.ws.send(buffer);
	}
	addDefaultListeners() {
		// Init
		this.on("ping", () => {
			this.send("ping");
		});
		this.on("playerInitPacket", () => {
			this.send("playerInitReceived");
		});
		// Components
		this.players =  new Players(this);
		this.chat = new Chat(this);
		this.world = new World(this);
	}
}