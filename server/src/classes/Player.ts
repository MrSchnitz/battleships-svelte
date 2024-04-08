import type { Coordinate, IPlayer, Ship, Shot } from "../../../common/types.js";
import { ShotEvent } from "../../../common/types.js";

export default class Player implements IPlayer {
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

	checkShipHit(shotCoordinate: Coordinate): Shot {
		let shotType = ShotEvent.MISS;
		const currentDestroyedShips = this.getDestroyedShips();

		this.ships.forEach((ship) => {
			const hitCoordinateIndex = ship.coords.findIndex(
				(c) => c.x === shotCoordinate.x && c.y === shotCoordinate.y
			);

			if (hitCoordinateIndex >= 0) {
				ship.coords[hitCoordinateIndex].hit = true;
				shotType = ShotEvent.HIT;
			}

			if (ship.coords.every((c) => c.hit)) {
				ship.destroyed = true;
			}
		});

		if (currentDestroyedShips.length < this.getDestroyedShips().length) {
			shotType = ShotEvent.DESTROY;
		}

		const shot = {
			coords: shotCoordinate,
			type: shotType
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
