// @generated by protoc-gen-es v2.2.2 with parameter "import_extension=.js"
// @generated from file protocol/world.proto (package WorldPackets, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file protocol/world.proto.
 */
export declare const file_protocol_world: GenFile;

/**
 * @generated from message WorldPackets.WorldPacket
 */
export declare type WorldPacket = Message<"WorldPackets.WorldPacket"> & {
  /**
   * @generated from oneof WorldPackets.WorldPacket.packet
   */
  packet: {
    /**
     * Ping packet 
     *
     * @generated from field: WorldPackets.Ping ping = 1;
     */
    value: Ping;
    case: "ping";
  } | {
    /**
     * On join 
     *
     * @generated from field: WorldPackets.PlayerInitPacket player_init_packet = 2;
     */
    value: PlayerInitPacket;
    case: "playerInitPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerInitReceivedPacket player_init_received = 3;
     */
    value: PlayerInitReceivedPacket;
    case: "playerInitReceived";
  } | {
    /**
     * Player packets - Send/received while playing 
     *
     * @generated from field: WorldPackets.PlayerJoinedPacket player_joined_packet = 4;
     */
    value: PlayerJoinedPacket;
    case: "playerJoinedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerLeftPacket player_left_packet = 5;
     */
    value: PlayerLeftPacket;
    case: "playerLeftPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerChatPacket player_chat_packet = 6;
     */
    value: PlayerChatPacket;
    case: "playerChatPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerUpdateRightsPacket player_update_rights_packet = 7;
     */
    value: PlayerUpdateRightsPacket;
    case: "playerUpdateRightsPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerMovedPacket player_moved_packet = 8;
     */
    value: PlayerMovedPacket;
    case: "playerMovedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerFacePacket player_face_packet = 9;
     */
    value: PlayerFacePacket;
    case: "playerFacePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerGodModePacket player_god_mode_packet = 10;
     */
    value: PlayerGodModePacket;
    case: "playerGodModePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerModModePacket player_mod_mode_packet = 11;
     */
    value: PlayerModModePacket;
    case: "playerModModePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerRespawnPacket player_respawn_packet = 12;
     */
    value: PlayerRespawnPacket;
    case: "playerRespawnPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerResetPacket player_reset_packet = 13;
     */
    value: PlayerResetPacket;
    case: "playerResetPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerTouchBlockPacket player_touch_block_packet = 14;
     */
    value: PlayerTouchBlockPacket;
    case: "playerTouchBlockPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerAddEffectPacket player_add_effect_packet = 15;
     */
    value: PlayerAddEffectPacket;
    case: "playerAddEffectPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerRemoveEffectPacket player_remove_effect_packet = 16;
     */
    value: PlayerRemoveEffectPacket;
    case: "playerRemoveEffectPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerResetEffectsPacket player_reset_effects_packet = 17;
     */
    value: PlayerResetEffectsPacket;
    case: "playerResetEffectsPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerTeamUpdatePacket player_team_update_packet = 18;
     */
    value: PlayerTeamUpdatePacket;
    case: "playerTeamUpdatePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerCountersUpdatePacket player_counters_update_packet = 19;
     */
    value: PlayerCountersUpdatePacket;
    case: "playerCountersUpdatePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerLocalSwitchChangedPacket player_local_switch_changed_packet = 20;
     */
    value: PlayerLocalSwitchChangedPacket;
    case: "playerLocalSwitchChangedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerLocalSwitchResetPacket player_local_switch_reset_packet = 21;
     */
    value: PlayerLocalSwitchResetPacket;
    case: "playerLocalSwitchResetPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerDirectMessagePacket player_direct_message_packet = 22;
     */
    value: PlayerDirectMessagePacket;
    case: "playerDirectMessagePacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerTouchPlayerPacket player_touch_player_packet = 23;
     */
    value: PlayerTouchPlayerPacket;
    case: "playerTouchPlayerPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PlayerTeleportedPacket player_teleported_packet = 24;
     */
    value: PlayerTeleportedPacket;
    case: "playerTeleportedPacket";
  } | {
    /**
     * World packets - Mostly send out by the server 
     *
     * @generated from field: WorldPackets.WorldReloadedPacket world_reloaded_packet = 25;
     */
    value: WorldReloadedPacket;
    case: "worldReloadedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.WorldClearedPacket world_cleared_packet = 26;
     */
    value: WorldClearedPacket;
    case: "worldClearedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.WorldMetaUpdatePacket world_meta_update_packet = 27;
     */
    value: WorldMetaUpdatePacket;
    case: "worldMetaUpdatePacket";
  } | {
    /**
     * @generated from field: WorldPackets.WorldBlockPlacedPacket world_block_placed_packet = 28;
     */
    value: WorldBlockPlacedPacket;
    case: "worldBlockPlacedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.WorldBlockFilledPacket world_block_filled_packet = 29;
     */
    value: WorldBlockFilledPacket;
    case: "worldBlockFilledPacket";
  } | {
    /**
     * MISC 
     *
     * @generated from field: WorldPackets.OldChatMessagesPacket old_chat_messages_packet = 30;
     */
    value: OldChatMessagesPacket;
    case: "oldChatMessagesPacket";
  } | {
    /**
     * @generated from field: WorldPackets.SystemMessagePacket system_message_packet = 31;
     */
    value: SystemMessagePacket;
    case: "systemMessagePacket";
  } | {
    /**
     * @generated from field: WorldPackets.GlobalSwitchChangedPacket global_switch_changed_packet = 32;
     */
    value: GlobalSwitchChangedPacket;
    case: "globalSwitchChangedPacket";
  } | {
    /**
     * @generated from field: WorldPackets.GlobalSwitchResetPacket global_switch_reset_packet = 33;
     */
    value: GlobalSwitchResetPacket;
    case: "globalSwitchResetPacket";
  } | {
    /**
     * @generated from field: WorldPackets.PerformWorldActionPacket perform_world_action_packet = 34;
     */
    value: PerformWorldActionPacket;
    case: "performWorldActionPacket";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message WorldPackets.WorldPacket.
 * Use `create(WorldPacketSchema)` to create a new message.
 */
export declare const WorldPacketSchema: GenMessage<WorldPacket>;

/**
 * Empty 
 *
 * @generated from message WorldPackets.Ping
 */
export declare type Ping = Message<"WorldPackets.Ping"> & {
};

/**
 * Describes the message WorldPackets.Ping.
 * Use `create(PingSchema)` to create a new message.
 */
export declare const PingSchema: GenMessage<Ping>;

/**
 *
 * Misc PACKETS
 *
 * @generated from message WorldPackets.GlobalSwitchChangedPacket
 */
export declare type GlobalSwitchChangedPacket = Message<"WorldPackets.GlobalSwitchChangedPacket"> & {
  /**
   * @generated from field: int32 player_id = 1;
   */
  playerId: number;

  /**
   * @generated from field: int32 switch_id = 2;
   */
  switchId: number;

  /**
   * @generated from field: bool enabled = 3;
   */
  enabled: boolean;
};

/**
 * Describes the message WorldPackets.GlobalSwitchChangedPacket.
 * Use `create(GlobalSwitchChangedPacketSchema)` to create a new message.
 */
export declare const GlobalSwitchChangedPacketSchema: GenMessage<GlobalSwitchChangedPacket>;

/**
 * @generated from message WorldPackets.GlobalSwitchResetPacket
 */
export declare type GlobalSwitchResetPacket = Message<"WorldPackets.GlobalSwitchResetPacket"> & {
  /**
   * @generated from field: int32 player_id = 1;
   */
  playerId: number;

  /**
   * @generated from field: bool enabled = 2;
   */
  enabled: boolean;
};

/**
 * Describes the message WorldPackets.GlobalSwitchResetPacket.
 * Use `create(GlobalSwitchResetPacketSchema)` to create a new message.
 */
export declare const GlobalSwitchResetPacketSchema: GenMessage<GlobalSwitchResetPacket>;

/**
 * @generated from message WorldPackets.SystemMessagePacket
 */
export declare type SystemMessagePacket = Message<"WorldPackets.SystemMessagePacket"> & {
  /**
   * @generated from field: string title = 1;
   */
  title: string;

  /**
   * @generated from field: string message = 2;
   */
  message: string;

  /**
   * @generated from field: bool is_dialog = 3;
   */
  isDialog: boolean;
};

/**
 * Describes the message WorldPackets.SystemMessagePacket.
 * Use `create(SystemMessagePacketSchema)` to create a new message.
 */
export declare const SystemMessagePacketSchema: GenMessage<SystemMessagePacket>;

/**
 * @generated from message WorldPackets.OldChatMessagesPacket
 */
export declare type OldChatMessagesPacket = Message<"WorldPackets.OldChatMessagesPacket"> & {
  /**
   * @generated from field: repeated WorldPackets.OldChatMessage old_chat_messages = 1;
   */
  oldChatMessages: OldChatMessage[];
};

/**
 * Describes the message WorldPackets.OldChatMessagesPacket.
 * Use `create(OldChatMessagesPacketSchema)` to create a new message.
 */
export declare const OldChatMessagesPacketSchema: GenMessage<OldChatMessagesPacket>;

/**
 * @generated from message WorldPackets.PerformWorldActionPacket
 */
export declare type PerformWorldActionPacket = Message<"WorldPackets.PerformWorldActionPacket"> & {
  /**
   * @generated from field: WorldPackets.PerformWorldActionPacket.Action action = 1;
   */
  action: PerformWorldActionPacket_Action;
};

/**
 * Describes the message WorldPackets.PerformWorldActionPacket.
 * Use `create(PerformWorldActionPacketSchema)` to create a new message.
 */
export declare const PerformWorldActionPacketSchema: GenMessage<PerformWorldActionPacket>;

/**
 * @generated from enum WorldPackets.PerformWorldActionPacket.Action
 */
export enum PerformWorldActionPacket_Action {
  /**
   * @generated from enum value: SAVE_WORLD = 0;
   */
  SAVE_WORLD = 0,

  /**
   * @generated from enum value: RELOAD_WORLD = 1;
   */
  RELOAD_WORLD = 1,

  /**
   * @generated from enum value: CLEAR_WORLD = 3;
   */
  CLEAR_WORLD = 3,
}

/**
 * Describes the enum WorldPackets.PerformWorldActionPacket.Action.
 */
export declare const PerformWorldActionPacket_ActionSchema: GenEnum<PerformWorldActionPacket_Action>;

/**
 *
 * World PACKETS
 *
 * @generated from message WorldPackets.WorldReloadedPacket
 */
export declare type WorldReloadedPacket = Message<"WorldPackets.WorldReloadedPacket"> & {
  /**
   * @generated from field: bytes world_data = 1;
   */
  worldData: Uint8Array;
};

/**
 * Describes the message WorldPackets.WorldReloadedPacket.
 * Use `create(WorldReloadedPacketSchema)` to create a new message.
 */
export declare const WorldReloadedPacketSchema: GenMessage<WorldReloadedPacket>;

/**
 * Empty 
 *
 * @generated from message WorldPackets.WorldClearedPacket
 */
export declare type WorldClearedPacket = Message<"WorldPackets.WorldClearedPacket"> & {
};

/**
 * Describes the message WorldPackets.WorldClearedPacket.
 * Use `create(WorldClearedPacketSchema)` to create a new message.
 */
export declare const WorldClearedPacketSchema: GenMessage<WorldClearedPacket>;

/**
 * @generated from message WorldPackets.WorldBlockPlacedPacket
 */
export declare type WorldBlockPlacedPacket = Message<"WorldPackets.WorldBlockPlacedPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: bool is_fill_operation = 3;
   */
  isFillOperation: boolean;

  /**
   * Repeated for use in fill operations
   *
   * @generated from field: repeated WorldPackets.PointInteger positions = 4;
   */
  positions: PointInteger[];

  /**
   * @generated from field: int32 layer = 5;
   */
  layer: number;

  /**
   * @generated from field: int32 block_id = 6;
   */
  blockId: number;

  /**
   * Legacy? Holds a byte[] that can hold extra information
   *
   * @generated from field: bytes extra_fields = 7;
   */
  extraFields: Uint8Array;
};

/**
 * Describes the message WorldPackets.WorldBlockPlacedPacket.
 * Use `create(WorldBlockPlacedPacketSchema)` to create a new message.
 */
export declare const WorldBlockPlacedPacketSchema: GenMessage<WorldBlockPlacedPacket>;

/**
 * @generated from message WorldPackets.WorldBlockFilledPacket
 */
export declare type WorldBlockFilledPacket = Message<"WorldPackets.WorldBlockFilledPacket"> & {
  /**
   * @generated from field: WorldPackets.PointInteger position = 1;
   */
  position?: PointInteger;

  /**
   * @generated from field: bool ignoreLayers = 2;
   */
  ignoreLayers: boolean;

  /**
   * @generated from field: int32 layer = 3;
   */
  layer: number;

  /**
   * @generated from field: int32 block_id = 4;
   */
  blockId: number;

  /**
   * Legacy? Holds a byte[] that can hold extra information
   *
   * @generated from field: bytes extra_fields = 5;
   */
  extraFields: Uint8Array;
};

/**
 * Describes the message WorldPackets.WorldBlockFilledPacket.
 * Use `create(WorldBlockFilledPacketSchema)` to create a new message.
 */
export declare const WorldBlockFilledPacketSchema: GenMessage<WorldBlockFilledPacket>;

/**
 * @generated from message WorldPackets.WorldMetaUpdatePacket
 */
export declare type WorldMetaUpdatePacket = Message<"WorldPackets.WorldMetaUpdatePacket"> & {
  /**
   * @generated from field: WorldPackets.WorldMeta meta = 1;
   */
  meta?: WorldMeta;
};

/**
 * Describes the message WorldPackets.WorldMetaUpdatePacket.
 * Use `create(WorldMetaUpdatePacketSchema)` to create a new message.
 */
export declare const WorldMetaUpdatePacketSchema: GenMessage<WorldMetaUpdatePacket>;

/**
 *
 * PLAYER PACKETS
 *
 * @generated from message WorldPackets.PlayerInitPacket
 */
export declare type PlayerInitPacket = Message<"WorldPackets.PlayerInitPacket"> & {
  /**
   * player_id located in PlayerProperties 
   *
   * @generated from field: WorldPackets.PlayerProperties player_properties = 1;
   */
  playerProperties?: PlayerProperties;

  /**
   * @generated from field: WorldPackets.WorldMeta world_meta = 2;
   */
  worldMeta?: WorldMeta;

  /**
   * Static world information 
   *
   * @generated from field: int32 world_width = 3;
   */
  worldWidth: number;

  /**
   * @generated from field: int32 world_height = 4;
   */
  worldHeight: number;

  /**
   * Very specific world state 
   *
   * @generated from field: bytes global_switch_state = 6;
   */
  globalSwitchState: Uint8Array;

  /**
   * @generated from field: bytes world_data = 7;
   */
  worldData: Uint8Array;
};

/**
 * Describes the message WorldPackets.PlayerInitPacket.
 * Use `create(PlayerInitPacketSchema)` to create a new message.
 */
export declare const PlayerInitPacketSchema: GenMessage<PlayerInitPacket>;

/**
 * Pong back to the server that init has been done. 
 *
 * @generated from message WorldPackets.PlayerInitReceivedPacket
 */
export declare type PlayerInitReceivedPacket = Message<"WorldPackets.PlayerInitReceivedPacket"> & {
};

/**
 * Describes the message WorldPackets.PlayerInitReceivedPacket.
 * Use `create(PlayerInitReceivedPacketSchema)` to create a new message.
 */
export declare const PlayerInitReceivedPacketSchema: GenMessage<PlayerInitReceivedPacket>;

/**
 * @generated from message WorldPackets.PlayerJoinedPacket
 */
export declare type PlayerJoinedPacket = Message<"WorldPackets.PlayerJoinedPacket"> & {
  /**
   * @generated from field: WorldPackets.PlayerProperties properties = 1;
   */
  properties?: PlayerProperties;

  /**
   * @generated from field: WorldPackets.PlayerWorldState world_state = 2;
   */
  worldState?: PlayerWorldState;
};

/**
 * Describes the message WorldPackets.PlayerJoinedPacket.
 * Use `create(PlayerJoinedPacketSchema)` to create a new message.
 */
export declare const PlayerJoinedPacketSchema: GenMessage<PlayerJoinedPacket>;

/**
 * @generated from message WorldPackets.PlayerLeftPacket
 */
export declare type PlayerLeftPacket = Message<"WorldPackets.PlayerLeftPacket"> & {
  /**
   * No content required 
   *
   * @generated from field: int32 player_id = 1;
   */
  playerId: number;
};

/**
 * Describes the message WorldPackets.PlayerLeftPacket.
 * Use `create(PlayerLeftPacketSchema)` to create a new message.
 */
export declare const PlayerLeftPacketSchema: GenMessage<PlayerLeftPacket>;

/**
 * @generated from message WorldPackets.PlayerChatPacket
 */
export declare type PlayerChatPacket = Message<"WorldPackets.PlayerChatPacket"> & {
  /**
   * @generated from field: int32 player_id = 1;
   */
  playerId: number;

  /**
   * @generated from field: string message = 2;
   */
  message: string;
};

/**
 * Describes the message WorldPackets.PlayerChatPacket.
 * Use `create(PlayerChatPacketSchema)` to create a new message.
 */
export declare const PlayerChatPacketSchema: GenMessage<PlayerChatPacket>;

/**
 * @generated from message WorldPackets.PlayerUpdateRightsPacket
 */
export declare type PlayerUpdateRightsPacket = Message<"WorldPackets.PlayerUpdateRightsPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: WorldPackets.PlayerRights rights = 2;
   */
  rights?: PlayerRights;
};

/**
 * Describes the message WorldPackets.PlayerUpdateRightsPacket.
 * Use `create(PlayerUpdateRightsPacketSchema)` to create a new message.
 */
export declare const PlayerUpdateRightsPacketSchema: GenMessage<PlayerUpdateRightsPacket>;

/**
 * @generated from message WorldPackets.PlayerMovedPacket
 */
export declare type PlayerMovedPacket = Message<"WorldPackets.PlayerMovedPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: WorldPackets.PointDouble position = 2;
   */
  position?: PointDouble;

  /**
   * @generated from field: double velocity_x = 3;
   */
  velocityX: number;

  /**
   * @generated from field: double velocity_y = 4;
   */
  velocityY: number;

  /**
   * @generated from field: double modifier_x = 5;
   */
  modifierX: number;

  /**
   * @generated from field: double modifier_y = 6;
   */
  modifierY: number;

  /**
   * @generated from field: int32 horizontal = 7;
   */
  horizontal: number;

  /**
   * @generated from field: int32 vertical = 8;
   */
  vertical: number;

  /**
   * @generated from field: bool space_down = 9;
   */
  spaceDown: boolean;

  /**
   * @generated from field: bool space_just_down = 10;
   */
  spaceJustDown: boolean;

  /**
   * @generated from field: bool just_teleported = 11;
   */
  justTeleported: boolean;

  /**
   * @generated from field: int32 tick_id = 12;
   */
  tickId: number;
};

/**
 * Describes the message WorldPackets.PlayerMovedPacket.
 * Use `create(PlayerMovedPacketSchema)` to create a new message.
 */
export declare const PlayerMovedPacketSchema: GenMessage<PlayerMovedPacket>;

/**
 * @generated from message WorldPackets.PlayerTeleportedPacket
 */
export declare type PlayerTeleportedPacket = Message<"WorldPackets.PlayerTeleportedPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: WorldPackets.PointDouble position = 2;
   */
  position?: PointDouble;
};

/**
 * Describes the message WorldPackets.PlayerTeleportedPacket.
 * Use `create(PlayerTeleportedPacketSchema)` to create a new message.
 */
export declare const PlayerTeleportedPacketSchema: GenMessage<PlayerTeleportedPacket>;

/**
 * @generated from message WorldPackets.PlayerFacePacket
 */
export declare type PlayerFacePacket = Message<"WorldPackets.PlayerFacePacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 face_id = 2;
   */
  faceId: number;
};

/**
 * Describes the message WorldPackets.PlayerFacePacket.
 * Use `create(PlayerFacePacketSchema)` to create a new message.
 */
export declare const PlayerFacePacketSchema: GenMessage<PlayerFacePacket>;

/**
 * @generated from message WorldPackets.PlayerGodModePacket
 */
export declare type PlayerGodModePacket = Message<"WorldPackets.PlayerGodModePacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: bool enabled = 2;
   */
  enabled: boolean;
};

/**
 * Describes the message WorldPackets.PlayerGodModePacket.
 * Use `create(PlayerGodModePacketSchema)` to create a new message.
 */
export declare const PlayerGodModePacketSchema: GenMessage<PlayerGodModePacket>;

/**
 * @generated from message WorldPackets.PlayerModModePacket
 */
export declare type PlayerModModePacket = Message<"WorldPackets.PlayerModModePacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: bool enabled = 3;
   */
  enabled: boolean;
};

/**
 * Describes the message WorldPackets.PlayerModModePacket.
 * Use `create(PlayerModModePacketSchema)` to create a new message.
 */
export declare const PlayerModModePacketSchema: GenMessage<PlayerModModePacket>;

/**
 * @generated from message WorldPackets.PlayerRespawnPacket
 */
export declare type PlayerRespawnPacket = Message<"WorldPackets.PlayerRespawnPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: WorldPackets.PointInteger position = 2;
   */
  position?: PointInteger;
};

/**
 * Describes the message WorldPackets.PlayerRespawnPacket.
 * Use `create(PlayerRespawnPacketSchema)` to create a new message.
 */
export declare const PlayerRespawnPacketSchema: GenMessage<PlayerRespawnPacket>;

/**
 * @generated from message WorldPackets.PlayerResetPacket
 */
export declare type PlayerResetPacket = Message<"WorldPackets.PlayerResetPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: optional WorldPackets.PointInteger position = 2;
   */
  position?: PointInteger;
};

/**
 * Describes the message WorldPackets.PlayerResetPacket.
 * Use `create(PlayerResetPacketSchema)` to create a new message.
 */
export declare const PlayerResetPacketSchema: GenMessage<PlayerResetPacket>;

/**
 * @generated from message WorldPackets.PlayerTouchBlockPacket
 */
export declare type PlayerTouchBlockPacket = Message<"WorldPackets.PlayerTouchBlockPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: optional WorldPackets.PointInteger position = 2;
   */
  position?: PointInteger;

  /**
   * @generated from field: int32 block_id = 3;
   */
  blockId: number;
};

/**
 * Describes the message WorldPackets.PlayerTouchBlockPacket.
 * Use `create(PlayerTouchBlockPacketSchema)` to create a new message.
 */
export declare const PlayerTouchBlockPacketSchema: GenMessage<PlayerTouchBlockPacket>;

/**
 * @generated from message WorldPackets.PlayerTouchPlayerPacket
 */
export declare type PlayerTouchPlayerPacket = Message<"WorldPackets.PlayerTouchPlayerPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 touched_player = 2;
   */
  touchedPlayer: number;

  /**
   * @generated from field: WorldPackets.PlayerTouchPlayerPacket.TouchType touch_type = 3;
   */
  touchType: PlayerTouchPlayerPacket_TouchType;
};

/**
 * Describes the message WorldPackets.PlayerTouchPlayerPacket.
 * Use `create(PlayerTouchPlayerPacketSchema)` to create a new message.
 */
export declare const PlayerTouchPlayerPacketSchema: GenMessage<PlayerTouchPlayerPacket>;

/**
 * @generated from enum WorldPackets.PlayerTouchPlayerPacket.TouchType
 */
export enum PlayerTouchPlayerPacket_TouchType {
  /**
   * @generated from enum value: START = 0;
   */
  START = 0,

  /**
   * @generated from enum value: END = 1;
   */
  END = 1,
}

/**
 * Describes the enum WorldPackets.PlayerTouchPlayerPacket.TouchType.
 */
export declare const PlayerTouchPlayerPacket_TouchTypeSchema: GenEnum<PlayerTouchPlayerPacket_TouchType>;

/**
 * @generated from message WorldPackets.PlayerAddEffectPacket
 */
export declare type PlayerAddEffectPacket = Message<"WorldPackets.PlayerAddEffectPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: bool from_server = 2;
   */
  fromServer: boolean;

  /**
   * Effect data 
   *
   * Todo: Make this an enum.
   *
   * @generated from field: int32 effect_id = 3;
   */
  effectId: number;

  /**
   * @generated from field: optional int32 duration = 4;
   */
  duration?: number;

  /**
   * @generated from field: optional int32 strength = 5;
   */
  strength?: number;
};

/**
 * Describes the message WorldPackets.PlayerAddEffectPacket.
 * Use `create(PlayerAddEffectPacketSchema)` to create a new message.
 */
export declare const PlayerAddEffectPacketSchema: GenMessage<PlayerAddEffectPacket>;

/**
 * @generated from message WorldPackets.PlayerRemoveEffectPacket
 */
export declare type PlayerRemoveEffectPacket = Message<"WorldPackets.PlayerRemoveEffectPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * Todo: Make this an enum.
   *
   * @generated from field: int32 effect_id = 4;
   */
  effectId: number;
};

/**
 * Describes the message WorldPackets.PlayerRemoveEffectPacket.
 * Use `create(PlayerRemoveEffectPacketSchema)` to create a new message.
 */
export declare const PlayerRemoveEffectPacketSchema: GenMessage<PlayerRemoveEffectPacket>;

/**
 * @generated from message WorldPackets.PlayerResetEffectsPacket
 */
export declare type PlayerResetEffectsPacket = Message<"WorldPackets.PlayerResetEffectsPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: bool from_server = 2;
   */
  fromServer: boolean;
};

/**
 * Describes the message WorldPackets.PlayerResetEffectsPacket.
 * Use `create(PlayerResetEffectsPacketSchema)` to create a new message.
 */
export declare const PlayerResetEffectsPacketSchema: GenMessage<PlayerResetEffectsPacket>;

/**
 * @generated from message WorldPackets.PlayerTeamUpdatePacket
 */
export declare type PlayerTeamUpdatePacket = Message<"WorldPackets.PlayerTeamUpdatePacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 team_id = 2;
   */
  teamId: number;
};

/**
 * Describes the message WorldPackets.PlayerTeamUpdatePacket.
 * Use `create(PlayerTeamUpdatePacketSchema)` to create a new message.
 */
export declare const PlayerTeamUpdatePacketSchema: GenMessage<PlayerTeamUpdatePacket>;

/**
 * @generated from message WorldPackets.PlayerCountersUpdatePacket
 */
export declare type PlayerCountersUpdatePacket = Message<"WorldPackets.PlayerCountersUpdatePacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 coins = 2;
   */
  coins: number;

  /**
   * @generated from field: int32 blue_coins = 3;
   */
  blueCoins: number;

  /**
   * @generated from field: int32 deaths = 4;
   */
  deaths: number;
};

/**
 * Describes the message WorldPackets.PlayerCountersUpdatePacket.
 * Use `create(PlayerCountersUpdatePacketSchema)` to create a new message.
 */
export declare const PlayerCountersUpdatePacketSchema: GenMessage<PlayerCountersUpdatePacket>;

/**
 * @generated from message WorldPackets.PlayerLocalSwitchChangedPacket
 */
export declare type PlayerLocalSwitchChangedPacket = Message<"WorldPackets.PlayerLocalSwitchChangedPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 switch_id = 2;
   */
  switchId: number;

  /**
   * @generated from field: bool switch_enabled = 3;
   */
  switchEnabled: boolean;
};

/**
 * Describes the message WorldPackets.PlayerLocalSwitchChangedPacket.
 * Use `create(PlayerLocalSwitchChangedPacketSchema)` to create a new message.
 */
export declare const PlayerLocalSwitchChangedPacketSchema: GenMessage<PlayerLocalSwitchChangedPacket>;

/**
 * @generated from message WorldPackets.PlayerLocalSwitchResetPacket
 */
export declare type PlayerLocalSwitchResetPacket = Message<"WorldPackets.PlayerLocalSwitchResetPacket"> & {
  /**
   * @generated from field: optional int32 player_id = 1;
   */
  playerId?: number;

  /**
   * @generated from field: int32 switch_id = 2;
   */
  switchId: number;

  /**
   * @generated from field: bool switch_enabled = 3;
   */
  switchEnabled: boolean;
};

/**
 * Describes the message WorldPackets.PlayerLocalSwitchResetPacket.
 * Use `create(PlayerLocalSwitchResetPacketSchema)` to create a new message.
 */
export declare const PlayerLocalSwitchResetPacketSchema: GenMessage<PlayerLocalSwitchResetPacket>;

/**
 * @generated from message WorldPackets.PlayerDirectMessagePacket
 */
export declare type PlayerDirectMessagePacket = Message<"WorldPackets.PlayerDirectMessagePacket"> & {
  /**
   * @generated from field: int32 from_player_id = 1;
   */
  fromPlayerId: number;

  /**
   * @generated from field: int32 target_player_id = 2;
   */
  targetPlayerId: number;

  /**
   * @generated from field: string message = 3;
   */
  message: string;
};

/**
 * Describes the message WorldPackets.PlayerDirectMessagePacket.
 * Use `create(PlayerDirectMessagePacketSchema)` to create a new message.
 */
export declare const PlayerDirectMessagePacketSchema: GenMessage<PlayerDirectMessagePacket>;

/**
 *
 * ============================================
 * PARTS, not messages themselves.
 * ============================================
 *
 * @generated from message WorldPackets.PlayerWorldState
 */
export declare type PlayerWorldState = Message<"WorldPackets.PlayerWorldState"> & {
  /**
   * @generated from field: int32 coins_gold = 1;
   */
  coinsGold: number;

  /**
   * @generated from field: int32 coins_blue = 2;
   */
  coinsBlue: number;

  /**
   * @generated from field: int32 deaths = 3;
   */
  deaths: number;

  /**
   * @generated from field: repeated WorldPackets.PointInteger collected_items = 4;
   */
  collectedItems: PointInteger[];

  /**
   * @generated from field: bool has_gold_crown = 5;
   */
  hasGoldCrown: boolean;

  /**
   * @generated from field: bool has_silver_crown = 6;
   */
  hasSilverCrown: boolean;

  /**
   * @generated from field: bytes switches = 7;
   */
  switches: Uint8Array;

  /**
   * @generated from field: bool godmode = 8;
   */
  godmode: boolean;

  /**
   * @generated from field: bool modmode = 9;
   */
  modmode: boolean;

  /**
   * @generated from field: int32 team_id = 10;
   */
  teamId: number;
};

/**
 * Describes the message WorldPackets.PlayerWorldState.
 * Use `create(PlayerWorldStateSchema)` to create a new message.
 */
export declare const PlayerWorldStateSchema: GenMessage<PlayerWorldState>;

/**
 * @generated from message WorldPackets.PlayerProperties
 */
export declare type PlayerProperties = Message<"WorldPackets.PlayerProperties"> & {
  /**
   * @generated from field: int32 player_id = 1;
   */
  playerId: number;

  /**
   * @generated from field: string account_id = 2;
   */
  accountId: string;

  /**
   * @generated from field: string username = 3;
   */
  username: string;

  /**
   * @generated from field: int32 face = 4;
   */
  face: number;

  /**
   * @generated from field: string role = 5;
   */
  role: string;

  /**
   * @generated from field: bool is_friend = 6;
   */
  isFriend: boolean;

  /**
   * @generated from field: WorldPackets.PointDouble position = 7;
   */
  position?: PointDouble;

  /**
   * @generated from field: bool is_world_owner = 8;
   */
  isWorldOwner: boolean;

  /**
   * @generated from field: WorldPackets.PlayerRights rights = 9;
   */
  rights?: PlayerRights;
};

/**
 * Describes the message WorldPackets.PlayerProperties.
 * Use `create(PlayerPropertiesSchema)` to create a new message.
 */
export declare const PlayerPropertiesSchema: GenMessage<PlayerProperties>;

/**
 * @generated from message WorldPackets.PlayerRights
 */
export declare type PlayerRights = Message<"WorldPackets.PlayerRights"> & {
  /**
   * @generated from field: bool can_edit = 1;
   */
  canEdit: boolean;

  /**
   * @generated from field: bool can_god = 2;
   */
  canGod: boolean;

  /**
   * @generated from field: bool can_toggle_minimap = 3;
   */
  canToggleMinimap: boolean;

  /**
   * @generated from field: bool can_change_world_settings = 4;
   */
  canChangeWorldSettings: boolean;
};

/**
 * Describes the message WorldPackets.PlayerRights.
 * Use `create(PlayerRightsSchema)` to create a new message.
 */
export declare const PlayerRightsSchema: GenMessage<PlayerRights>;

/**
 * @generated from message WorldPackets.WorldMeta
 */
export declare type WorldMeta = Message<"WorldPackets.WorldMeta"> & {
  /**
   * @generated from field: string title = 1;
   */
  title: string;

  /**
   * @generated from field: int32 plays = 2;
   */
  plays: number;

  /**
   * @generated from field: string owner = 3;
   */
  owner: string;

  /**
   * @generated from field: string owner_role = 4;
   */
  ownerRole: string;

  /**
   * @generated from field: string description = 5;
   */
  description: string;

  /**
   * @generated from field: string visibility = 6;
   */
  visibility: string;

  /**
   * @generated from field: WorldPackets.WorldMeta.WorldType world_Type = 7;
   */
  worldType: WorldMeta_WorldType;

  /**
   * @generated from field: bool has_unsaved_changes = 8;
   */
  hasUnsavedChanges: boolean;

  /**
   * @generated from field: bool minimap_enabled = 9;
   */
  minimapEnabled: boolean;
};

/**
 * Describes the message WorldPackets.WorldMeta.
 * Use `create(WorldMetaSchema)` to create a new message.
 */
export declare const WorldMetaSchema: GenMessage<WorldMeta>;

/**
 * @generated from enum WorldPackets.WorldMeta.WorldType
 */
export enum WorldMeta_WorldType {
  /**
   * @generated from enum value: Saved = 0;
   */
  Saved = 0,

  /**
   * @generated from enum value: Unsaved = 1;
   */
  Unsaved = 1,

  /**
   * @generated from enum value: Legacy = 2;
   */
  Legacy = 2,
}

/**
 * Describes the enum WorldPackets.WorldMeta.WorldType.
 */
export declare const WorldMeta_WorldTypeSchema: GenEnum<WorldMeta_WorldType>;

/**
 * @generated from message WorldPackets.OldChatMessage
 */
export declare type OldChatMessage = Message<"WorldPackets.OldChatMessage"> & {
  /**
   * @generated from field: string player_name = 1;
   */
  playerName: string;

  /**
   * @generated from field: string player_role = 2;
   */
  playerRole: string;

  /**
   * @generated from field: bool is_friend = 3;
   */
  isFriend: boolean;

  /**
   * @generated from field: string message = 4;
   */
  message: string;
};

/**
 * Describes the message WorldPackets.OldChatMessage.
 * Use `create(OldChatMessageSchema)` to create a new message.
 */
export declare const OldChatMessageSchema: GenMessage<OldChatMessage>;

/**
 *
 * Represents an integer position.
 *
 * @generated from message WorldPackets.PointInteger
 */
export declare type PointInteger = Message<"WorldPackets.PointInteger"> & {
  /**
   * @generated from field: int32 x = 1;
   */
  x: number;

  /**
   * @generated from field: int32 y = 2;
   */
  y: number;
};

/**
 * Describes the message WorldPackets.PointInteger.
 * Use `create(PointIntegerSchema)` to create a new message.
 */
export declare const PointIntegerSchema: GenMessage<PointInteger>;

/**
 *
 * Represents a double position.
 *
 * @generated from message WorldPackets.PointDouble
 */
export declare type PointDouble = Message<"WorldPackets.PointDouble"> & {
  /**
   * @generated from field: double x = 1;
   */
  x: number;

  /**
   * @generated from field: double y = 2;
   */
  y: number;
};

/**
 * Describes the message WorldPackets.PointDouble.
 * Use `create(PointDoubleSchema)` to create a new message.
 */
export declare const PointDoubleSchema: GenMessage<PointDouble>;

