import { SHIP_SPACES } from "../../../common/types";
import type { Ship, ShipCoordinate, ShipType } from "../../../common/types";
import { create2DArray } from "$lib/utils/create2DArray";

export function placeShipsRandomly(size: number): Ship[] {
	const array = create2DArray(size);
	const ships: Ship[] = [];

	const isAdjacentShip = (
		array: { x: number; y: number }[][],
		x: number,
		y: number,
		size: number
	): boolean => {
		for (let i = Math.max(0, x - 1); i <= Math.min(size - 1, x + 1); i++) {
			for (let j = Math.max(0, y - 1); j <= Math.min(size - 1, y + 1); j++) {
				if (!array[i][j]) {
					return true;
				}
			}
		}
		return false;
	};

	for (const shipType of Object.keys(SHIP_SPACES) as ShipType[]) {
		const shipLength = SHIP_SPACES[shipType];
		let placed = false;

		while (!placed) {
			const x = Math.floor(Math.random() * size);
			const y = Math.floor(Math.random() * size);
			const horizontal = Math.random() < 0.5;

			const positions: ShipCoordinate[] = [];
			let valid = true;

			if (horizontal) {
				for (let i = 0; i < shipLength; i++) {
					const newX = x + i;

					if (newX >= size || array[newX][y] === null || isAdjacentShip(array, newX, y, size)) {
						valid = false;
						break;
					}

					positions.push({ x: newX, y, hit: false });
				}

				if (valid) {
					ships.push({ type: shipType, coords: positions, destroyed: false });
					positions.forEach((pos) => {
						array[pos.x][pos.y] = null;
					});
					placed = true;
				}
			} else {
				for (let i = 0; i < shipLength; i++) {
					const newY = y + i;

					if (newY >= size || array[x][newY] === null || isAdjacentShip(array, x, newY, size)) {
						valid = false;
						break;
					}

					positions.push({ x, y: newY, hit: false });
				}

				if (valid) {
					ships.push({ type: shipType, coords: positions, destroyed: false });
					positions.forEach((pos) => {
						array[pos.x][pos.y] = null;
					});
					placed = true;
				}
			}
		}
	}

	return ships;
}
