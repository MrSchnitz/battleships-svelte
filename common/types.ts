export enum SocketEvents {
	AVAILABLE_ROOMS = "availableRooms",
	CREATE_ROOM = "createRoom",
	JOIN_ROOM = "joinRoom",
	ROOM_READY = "roomReady",
	YOUR_ROOM = "yourRoom",
	SHOOT = "shoot",
	AFTER_CONNECT = "afterConnect",
	DISCONNECT = "disconnect",
	APPLY_DISCONNECT = "applyDisconnect",
	PLAYER_DISCONNECTED = "playerDisconnected"
}

export enum ShipType {
	Carrier = "Carrier",
	Battleship = "Battleship",
	Cruiser = "Cruiser",
	Submarine = "Submarine",
	Destroyer = "Destroyer"
}

export const SHIP_SPACES = {
	[ShipType.Carrier]: 5,
	[ShipType.Battleship]: 4,
	[ShipType.Cruiser]: 3,
	[ShipType.Submarine]: 3,
	[ShipType.Destroyer]: 2
} as const;

export const DEFAULT_SHIPS = Object.keys(ShipType);

export type Coordinate = { x: number; y: number };

export type ShipCoordinate = Coordinate & { hit: boolean };

export type Ship = { type: ShipType; coords: ShipCoordinate[]; destroyed: boolean };

export type Shot = {
	coords: Coordinate;
	hit: boolean;
};
