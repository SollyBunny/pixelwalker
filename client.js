import PocketBase from "pocketbase";
import { jwtDecode } from "jwt-decode";

import { URLServerAPI, URLServerGame } from "./endpoints.js"
import { BlockManager } from "./components/structure.js";

function int32ToRgba(int32) {
	return [
		(int32 >> 16) & 0xFF, // Blue
		(int32 >> 8) & 0xFF,  // Green
		int32 & 0xFF,         // Red
		(int32 >> 24) & 0xFF, // Alpha
	];
}

export class Client {
	static async fromLogin(identity, password, local) {
		if (!identity)
			throw new Error("Identity cannot be empty");
		if (!password)
			throw new Error("Password cannot be empty");
		const client = new Client(local);
		// may throw, TODO: clean up error message
		await client.pocketbase.collection("users").authWithPassword(identity, password);
		return client;
	}
	static fromToken(token, local) {
		if (!token)
			throw new Error("Token cannot be empty");
		const client = new Client(local);
		client.pocketbase.authStore.save(token, { verified: true });
		return client;
	}
	constructor(local) {
		this.local = Boolean(local);
		this.pocketbase = new PocketBase(URLServerAPI(this.local));
	}
	get token() {
		const token = this.pocketbase.authStore.token;
		if (!token)
			throw "No token";
		return token;
	}
	get id() {
		const token = this.pocketbase.authStore.token;
		if (!token)
			throw "No token";
		const id = jwtDecode(token).id;
		if (!id)
			throw "Invalid token";
		return id;
	}
	async roomTypes() {
		if (!this._roomTypes) {
			this._roomTypes = await fetch(`${URLServerGame(this.local)}/listroomtypes`);
			this._roomTypes = await this._roomTypes.json();
		}
		return this._roomTypes;
	}
	async blockColorsMap() {
		if (!this._blockColorsMap) {
			const blockManager = await this.blockManager();
			this._blockColorsMap = (await import("./blockColorsMap.json", { with: { type: "json" } })).default;
			this._blockColorsMap = Object.fromEntries(Object.entries(this._blockColorsMap).map(([name, color]) => {
				return [blockManager.name(Number(name)), int32ToRgba(color)];
			}));
		}
		return this._blockColorsMap;
	}
	async blockMappings() {
		if (!this._blockMappings) {
			this._blockMappings = await fetch(`${URLServerGame(this.local)}/mappings`);
			this._blockMappings = await this._blockMappings.json();
		}
		return this._blockMappings;
	}
	async blockManager() {
		if (!this._blockManager)
			this._blockManager = await BlockManager.fromClient(this);
		return this._blockManager;
	}
	profiles() {
		return this.pocketbase.collection("public_profiles");
	}
	worlds(){
		return this.pocketbase.collection("public_worlds");
	}
	user() {
		return this.pocketbase.collection("users").getOne(this.id);
	}
	async friends() {
		return await this.pocketbase.send("/api/friends", { token: this.token });
	}
	async friendRequests() {
		return await this.pocketbase.send("/api/friends/requests", { token: this.token });
	}
	async roomToken(roomId, roomType) {
		roomType = roomType ?? (this.local ? "pixelwalker_dev" : (await this.roomTypes())[0]);
		return (await this.pocketbase.send(`/api/joinkey/${roomType}/${roomId}`, { })).token;
	}
}

