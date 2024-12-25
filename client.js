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
	constructor(local) {
		this.local = Boolean(local);
		this.pocketbase = new PocketBase(URLServerAPI(this.local));
	}
	async init() {
		await Promise.all([
			(async () => {
				// Get room types
				this.roomTypes = await fetch(`${URLServerGame(this.local)}/listroomtypes`);
				this.roomTypes = await this.roomTypes.json();
			})(),
			(async () => {
				// Get mappings
				this.blockIds = await fetch(`${URLServerGame(this.local)}/mappings`);
				this.blockIds = await this.blockIds.json();
				// Get color map
				this.blockColors = (await import("./dataBlockColors.js")).default;
				this.blockColors = new Map(Object.entries(this.blockColors).map(([id, color]) =>
					[Number(id), int32ToRgba(color)]
				));
				// Create block manager
				this.blockManager = new BlockManager(this);
			})()
		]);
	}
	async authWithCredentials(identity, password) {
		if (!identity)
			throw new Error("Identity cannot be empty");
		if (!password)
			throw new Error("Password cannot be empty");
		// may throw, TODO: clean up error message
		await this.pocketbase.collection("users").authWithPassword(identity, password);
	}
	async authWithToken(token) {
		if (!token)
			throw new Error("Token cannot be empty");
		this.pocketbase.authStore.save(token, { verified: true });
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
		roomType = roomType ?? (this.local ? "pixelwalker_dev" : this.roomTypes[0]);
		return (await this.pocketbase.send(`/api/joinkey/${roomType}/${roomId}`, {})).token;
	}
}

