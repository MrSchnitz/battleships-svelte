import type {Coordinate} from "../../../server/socketIoHandler";

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

export type ShipCoordinates = { x: number; y: number , hit: boolean };

export type ShipDragDimension = {
	top: number | null;
	bottom: number | null;
	left: number | null;
	right: number | null;
};

export type Ship = { type: ShipType; coords: ShipCoordinates[], destroyed: boolean };
