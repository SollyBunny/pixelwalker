/**
 * The API server link is the link to the [PocketBase](https://pocketbase.io/)-
 * based server. This part of the PixelWalker backend architecture manages
 * accounts, and persistant storage.
 */
export function URLServerAPI(local) {
	if (local)
		return "http://127.0.0.1:8090";
	return "https://api.pixelwalker.net";
}

/**
 * The Game server link is the link to the game server, which manages runtime
 * world connections.
 */
export function URLServerSocketGame(local) {
	if (local)
		return "ws://127.0.0.1:5148";
	return "wss://game.pixelwalker.net";
}

/**
 * The Game server link is the link to the game server, which manages runtime
 * world connections.
 */
export function URLServerGame(local) {
	if (local)
		return "http://localhost:5148";
	return "https://game.pixelwalker.net";
}