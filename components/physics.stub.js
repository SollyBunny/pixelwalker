import { Vec2 } from "../lib/vec2.js"
import { LAYER_BACKGROUND, LAYER_FOREGROUND } from "./structure.js";

const PhysicsConstants = {
    "msPerTick": 10,
    "maxMsPerTick": 15,
    "variableMultiplier": 7.752,
    "gravity": 2,
    "jumpHeight": 26,
    "jumpBufferFrames": 3,
    "boostSpeed": 16,
    "drag": {
        "base": 0.9813195279915707,
        "noModifier": 0.9045276172161356,
        "slippery": 0.9888162407469856,
        "ladder": 0.9045276172161356,
        "water": 0.9512631926190677,
        "mud": 0.7764545555823221,
        "lava": 0.8172042984143593,
        "toxicWaste": 0.9045276172161356
    },
    "buoyancy": {
        "water": -0.5,
        "mud": 0.4,
        "lava": 0.2,
        "toxicWaste": -0.4
    },
    "effects": {
        "fireDuration": 5000,
        "flyMaxThrust": 0.2,
        "flyThrustBurnoff": 0.01
    }
};

const EffectIds = {
    "0": "HighJump",
    "1": "Fly",
    "2": "Speed",
    "3": "Invulnerability",
    "4": "Curse",
    "5": "Zombie",
    "6": "GreenZombie",
    "7": "GravityForce",
    "8": "MultiJump",
    "9": "GravityDirection",
    "10": "Fire",
    "11": "Smiley",
    "HighJump": 0,
    "Fly": 1,
    "Speed": 2,
    "Invulnerability": 3,
    "Curse": 4,
    "Zombie": 5,
    "GreenZombie": 6,
    "GravityForce": 7,
    "MultiJump": 8,
    "GravityDirection": 9,
    "Fire": 10,
    "Smiley": 11
};

const Y = PhysicsConstants;
const C = EffectIds;
const N = {
	Background: LAYER_BACKGROUND,
	Foreground: LAYER_FOREGROUND,
};
const O = {};

class PhysicsWrapepr {
	constructor() {
		this.state = {
			world: {
				getBlockData: this.getBlockData
			}
		};
		this.effects = {
			get: () => undefined,
			has: () => false,
		};
		this.gravity = new Vec2();
		this.delayedGravity = new Vec2();
		this.delayBlockQueue = [];
		this.isFlying = false;
	}
	setStuff(world, player) {
		this._world = world;
		this._player = player;
		this.position = Vec2.clone(player.position);
		this.velocity = Vec2.clone(player.velocity);
	}
	getBlockData(x, y, layer) {
		return this._world.get(x, y, layer);
	}
	handleGravity(block) {
		return new Vec2(0, Y.gravity);
	}
	tickPhysics() {
		if (this.isDead)
			return;
		this.delayBlockCollisions();
		const t = Y.drag.base
			, r = Y.drag.noModifier
			, n = this.position.x + 8 >> 4
			, o = this.position.y + 8 >> 4
			, a = this.state.world.getBlockData(n, o, N.Foreground)
			, c = a.id
			, d = s.getById(c)
			, h = this.effects.has(C.Fly);
		let w = this.delayBlockQueue.shift();
		this.delayBlockQueue.push(c),
		(!d.hasGravity || d.isClimbable) && (w = this.delayBlockQueue.shift(),
		this.delayBlockQueue.push(c));
		const S = w ? s.getById(w) : void 0;
		this.gravity.set(0, 0),
		this.delayedGravity.set(0, 0),
		!this.isFlying && (this.gravity.setVec2(this.handleGravity(d)),
		this.delayedGravity.setVec2(this.handleGravity(S)));
		const z = this.getBlockBelow()
			, m = this.effects.get(C.MultiJump)
			, g = this.effects.get(C.HighJump);
		S != null && S.isLiquid ? this.movement.setVec2(this.inputDirection) : this.delayedGravity.y != 0 ? this.movement.set(this.inputDirection.x, 0) : this.delayedGravity.x != 0 ? this.movement.set(0, this.inputDirection.y) : this.movement.setVec2(this.inputDirection);
		const x = this.effects.get(C.Speed);
		x && (x.percentage !== 0 || !this.isFlying) && this.movement.setVec2(this.movement.multiply(x.percentage / 100));
		const v = this.effects.get(C.GravityForce);
		v && this.delayedGravity.setVec2(this.delayedGravity.multiply(v.percentage / 100)),
		this.modifier.set(this.delayedGravity.x + this.movement.x, this.delayedGravity.y + this.movement.y),
		this.originalSpeed.setVec2(this.velocity);
		const A = z.isSlippery && this.grounded;
		(this.velocity.x || this.modifier.x) && (this.velocity.multX += this.modifier.x,
		this.isFlying ? this.velocity.x *= t : (this.movement.x == 0 && this.delayedGravity.y != 0 || this.velocity.x < 0 && this.movement.x > 0 || this.velocity.x > 0 && this.movement.x < 0 ? A ? this.velocity.x *= Y.drag.slippery : (this.velocity.x *= t,
		this.velocity.x *= r) : this.velocity.x *= t,
		this.velocity.x *= d.drag)),
		(this.velocity.y || this.modifier.y) && (this.velocity.multY += this.modifier.y,
		this.isFlying ? this.velocity.y *= t : (this.movement.y == 0 && this.delayedGravity.x != 0 || this.velocity.y < 0 && this.movement.y > 0 || this.velocity.y > 0 && this.movement.y < 0 ? A ? this.velocity.y *= Y.drag.slippery : (this.velocity.y *= t,
		this.velocity.y *= r) : this.velocity.y *= t,
		this.velocity.y *= d.drag)),
		!this.isFlying && d.isBoost && (d.boostX != 0 && (this.velocity.x = Y.boostSpeed * d.boostX),
		d.boostY != 0 && (this.velocity.y = Y.boostSpeed * d.boostY)),
		this.reminder.set(this.position.x % 1, this.position.y % 1),
		this.currentSpeed.setVec2(this.velocity);
		let I = !1
			, M = !1;
		for (this.justTeleported = !1,
		this.grounded = !1; this.currentSpeed.x != 0 && !I || this.currentSpeed.y != 0 && !M; ) {
			this.isMe && this.processPortals(a, n, o),
			this.originalPosition.setPoint(this.position);
			let se = new xe(this.currentSpeed.x,this.currentSpeed.y);
			this.currentSpeed.x > 0 ? this.currentSpeed.x + this.reminder.x >= 1 ? (this.position.x += 1 - this.reminder.x,
			this.position.x >>= 0,
			this.currentSpeed.x -= 1 - this.reminder.x,
			this.reminder.x = 0) : (this.position.x += this.currentSpeed.x,
			this.currentSpeed.x = 0) : this.currentSpeed.x < 0 && (this.reminder.x + this.currentSpeed.x < 0 && (this.reminder.x != 0 || d.isBoost) ? (this.currentSpeed.x += this.reminder.x,
			this.position.x -= this.reminder.x,
			this.position.x >>= 0,
			this.reminder.x = 1) : (this.position.x += this.currentSpeed.x,
			this.currentSpeed.x = 0)),
			this.state.world.collidesWith(this) && (this.position.x = this.originalPosition.x,
			this.velocity.x > 0 && this.gravity.x > 0 && (this.grounded = !0),
			this.velocity.x < 0 && this.gravity.x < 0 && (this.grounded = !0),
			this.velocity.x = 0,
			this.currentSpeed.x = se.x,
			I = !0),
			this.currentSpeed.y > 0 ? this.currentSpeed.y + this.reminder.y >= 1 ? (this.position.y += 1 - this.reminder.y,
			this.position.y >>= 0,
			this.currentSpeed.y -= 1 - this.reminder.y,
			this.reminder.y = 0) : (this.position.y += this.currentSpeed.y,
			this.currentSpeed.y = 0) : this.currentSpeed.y < 0 && (this.reminder.y + this.currentSpeed.y < 0 && (this.reminder.y != 0 || d.isBoost) ? (this.position.y -= this.reminder.y,
			this.position.y >>= 0,
			this.currentSpeed.y += this.reminder.y,
			this.reminder.y = 1) : (this.position.y += this.currentSpeed.y,
			this.currentSpeed.y = 0)),
			this.state.world.collidesWith(this) && (this.position.y = this.originalPosition.y,
			this.velocity.y > 0 && this.gravity.y > 0 && (this.grounded = !0),
			this.velocity.y < 0 && this.gravity.y < 0 && (this.grounded = !0),
			this.velocity.y = 0,
			this.currentSpeed.y = se.y,
			M = !0)
		}
		this.velocity.x = ee.clamp(this.velocity.x, -16, 16),
		this.velocity.x = ee.clampToZeroInRange(this.velocity.x, 1e-4),
		this.velocity.y = ee.clamp(this.velocity.y, -16, 16),
		this.velocity.y = ee.clampToZeroInRange(this.velocity.y, 1e-4);
		let T = !1
			, R = 1;
		const fe = performance.now()
			, be = d.isLiquid && !this.isFlying;
		if (this.spaceJustDown && !be && (this.lastJump = -fe,
		T = !0,
		R = -1,
		this.jumpBufferFrames = Y.jumpBufferFrames),
		this.spaceDown && !be ? h ? (this.isThrusting = !0,
		this.currentThrust = Y.effects.flyMaxThrust) : this.lastJump < 0 ? fe + this.lastJump > 750 && (T = !0) : fe - this.lastJump > 150 && (T = !0) : this.isThrusting = !1,
		this.jumpBufferFrames > 0 && (!be && (T = !0),
		this.jumpBufferFrames--),
		(this.velocity.x == 0 && this.gravity.x && this.delayedGravity.x || this.velocity.y == 0 && this.gravity.y && this.delayedGravity.y) && this.grounded && (this.jumpCount = 0),
		this.jumpCount == 0 && !this.grounded && (this.jumpCount = 1),
		T && !h) {
			const se = (m == null ? void 0 : m.jumps) ?? 1
				, ze = (m == null ? void 0 : m.jumps) === -1
				, J = ze || this.jumpCount < se
				, P = (g == null ? void 0 : g.jumpHeight) ?? 3
				, le = P > 2 ? P / 9 + 6 / 9 : P / 9 + 5 / 9;
			J && this.gravity.x && this.delayedGravity.x && (se < 1e3 && this.jumpCount++,
			this.velocity.multX = -this.gravity.x * Y.jumpHeight * le,
			this.lastJump = fe * R,
			this.jumpBufferFrames = 0),
			J && this.gravity.y && this.delayedGravity.y && (se < 1e3 && this.jumpCount++,
			this.velocity.multY = -this.gravity.y * Y.jumpHeight * le,
			this.lastJump = fe * R,
			this.jumpBufferFrames = 0)
		}
		h && (this.gravity.y != 0 && (this.velocity.multY -= this.currentThrust * (Y.jumpHeight * .5) * (this.gravity.y * .5)),
		this.gravity.x != 0 && (this.velocity.multX -= this.currentThrust * (Y.jumpHeight * .5) * (this.gravity.x * .5)),
		!this.isThrusting && (this.currentThrust = this.currentThrust > 0 ? this.currentThrust - Y.effects.flyThrustBurnoff : 0));
		let U = this.velocity.x << 8
			, Z = this.velocity.y << 8;
		!(U !== 0 || Z !== 0) && !be && (this.position.x = this.snapToGrid(this.position.x, this.modifier.x),
		this.position.y = this.snapToGrid(this.position.y, this.modifier.y)),
		this.handleOtherPlayerCollisions(),
		this.touchBlock(n, o, d, a),
		this.sendMovementPacket(),
		this.tickId++
	}
}