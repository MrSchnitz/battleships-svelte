import type { Coordinate, Ship, ShipCoordinate, Shot } from "../../../common/types";

export function checkIfShipCoordinateMatch(
	shipCoordinates: ShipCoordinate[],
	{ x, y }: { x: number; y: number }
) {
	return shipCoordinates.some((shipCoordinate) => shipCoordinate.x === x && shipCoordinate.y === y);
}

export function checkShipCoordinates(ship: Ship, { x, y }: Coordinate) {
	return ship.coords.some((coord) => coord.x === x && coord.y === y);
}

export function findShipByCoordinates(ships: Ship[], coordinates: Coordinate) {
	return ships.find((ship) => checkShipCoordinates(ship, coordinates));
}

export function checkShotCoordinates(shot: Shot, { x, y }: Coordinate) {
	return shot.coords.x === x && shot.coords.y === y;
}
