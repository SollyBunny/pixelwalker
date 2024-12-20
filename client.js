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
		const res = await fetch(URLServerAPI(local) + "/api/collections/users/auth-with-password", {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US",
				"content-type": "application/json",
				"priority": "u=1, i",
				"sec-ch-ua": "\"Not?A_Brand\";v=\"99\", \"Chromium\";v=\"130\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Linux\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"Referer": "https://client.pixelwalker.net/",
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": JSON.stringify({ identity, password }),
			"method": "POST"
		});
		const json = await res.json();
		if (!json.token) {
			if (json.message)
				throw new Error(`Couldn't login: ${json.message}`);
			else
				throw new Error("Couldn't login: No token");
		}
		return new Client(json.record.id, json.token, local);
	}
	static fromToken(token, local) {
		const id = jwtDecode(token).id;
		if (!id)
			throw new Error("Invalid token");
		return new Client(id, token, local);
	}
	constructor(id, token, local) {
		this.id = id;
		this.token = token;
		this.local = Boolean(local);
		this.pocketbase = new PocketBase(URLServerAPI(this.local));
		this.pocketbase.authStore.save(this.token, { verified: true });
		if (!this.pocketbase.authStore.isValid)
			throw new Error("Invalid token");
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

