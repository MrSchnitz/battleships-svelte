import type { Coordinate, Ship, Shot } from "../../../common/types";

export default class Player {
	id: string;
	nick: string;
	ships: Ship[];
	shots: Shot[];
	enemyShots: Shot[];
	destroyedShips: Ship[];

	constructor(id: string, nick: string, ships: Ship[]) {
		this.id = id;
		this.nick = nick;
		this.ships = ships;
		this.shots = [];
		this.enemyShots = [];
		this.destroyedShips = [];
	}

	setShot(shot: Shot) {
		this.shots.push(shot);
	}

	checkShipHit(shotCoordinate: Coordinate) {
		let isHit = false;

		this.ships.forEach((ship) => {
			const hitCoordinateIndex = ship.coords.findIndex(
				(c) => c.x === shotCoordinate.x && c.y === shotCoordinate.y
			);

			if (hitCoordinateIndex >= 0) {
				ship.coords[hitCoordinateIndex].hit = true;
				isHit = true;
			}

			if (ship.coords.every((c) => c.hit)) {
				ship.destroyed = true;
			}
		});

		const shot = {
			coords: shotCoordinate,
			hit: isHit
		};

		this.enemyShots.push(shot);

		return shot;
	}

	getDestroyedShips() {
		return this.ships.filter((ship) => ship.destroyed);
	}

	getData() {
		return {
			id: this.id,
			nick: this.nick,
			ships: this.ships,
			shots: this.shots,
			enemyShots: this.enemyShots,
			destroyedShips: this.destroyedShips
		};
	}
}
